# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime
from flask_cors import CORS
import random
import re
import json

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load model
model_name = "distilgpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Define a fallback exercise database in case the model fails
EXERCISE_DB = {
    "arm": [
        "Bicep curl",
        "Tricep dip",
        "Hammer curl",
        "Cable tricep pushdown",
        "Parallel bar dip",
        "Concentration curl"
    ],
    "chest": [
        "Bench press",
        "Chest fly",
        "Push-up",
        "Incline bench press",
        "Wide-grip push-up",
        "Cable chest fly"
    ],
    "thigh": [
        "Squat",
        "Leg press",
        "Lunge",
        "Leg extension",
        "Romanian deadlift",
        "Hamstring curl"
    ],
    "calf": [
        "Calf raise",
        "Seated calf raise",
        "Single-leg calf raise",
        "Standing calf raise on step",
        "Cable calf raise",
        "Jumping calf raise"
    ]
}

# Define weight ranges for different exercises and difficulty levels
WEIGHT_RANGES = {
    "kezdő": {
        "arm": (5, 15),    # kg
        "chest": (10, 30),  # kg
        "thigh": (15, 40),  # kg
        "calf": (10, 25)    # kg
    },
    "közepes": {
        "arm": (10, 25),    # kg
        "chest": (20, 50),  # kg
        "thigh": (30, 65),  # kg
        "calf": (15, 40)    # kg
    },
    "haladó": {
        "arm": (15, 40),    # kg
        "chest": (30, 80),  # kg
        "thigh": (50, 100), # kg
        "calf": (20, 60)    # kg
    }
}

# Base weights for bodyweight exercises
BODYWEIGHT_EXERCISES = [
    "Push-up", "Tricep dip", "Parallel bar dip", "Wide-grip push-up"
]

def create_fallback_workout(input_text):
    """Create a fallback workout plan when the AI model fails"""
    # Try to extract muscle groups from input text
    muscle_groups = []
    difficulty = "közepes"  # Default
    
    # Check for muscle groups
    for group in EXERCISE_DB.keys():
        if group.lower() in input_text.lower():
            muscle_groups.append(group)
    
    # Check for difficulty
    if "kezdő" in input_text.lower():
        difficulty = "kezdő"
        reps_range = (8, 10)
        sets_range = (2, 3)
    elif "haladó" in input_text.lower():
        difficulty = "haladó"
        reps_range = (8, 12)
        sets_range = (3, 5)
    else:
        difficulty = "közepes"
        reps_range = (10, 12)
        sets_range = (3, 4)
    
    # If no muscle groups were found, use all
    if not muscle_groups:
        muscle_groups = list(EXERCISE_DB.keys())
    
    # Generate workout plan
    result = []
    for group in muscle_groups:
        # Pick 1-2 exercises for this group
        num_exercises = min(random.randint(1, 2), len(EXERCISE_DB[group]))
        selected_exercises = random.sample(EXERCISE_DB[group], num_exercises)
        
        for exercise in selected_exercises:
            reps = random.randint(*reps_range)
            sets = random.randint(*sets_range)
            
            # Add weight information based on difficulty and muscle group
            if exercise in BODYWEIGHT_EXERCISES:
                # For bodyweight exercises
                exercise_text = f"{group}: {exercise} - {sets}x{reps} (testsúllyal)"
            else:
                # For weighted exercises
                weight_range = WEIGHT_RANGES[difficulty][group]
                weight = round(random.uniform(*weight_range) / 5) * 5  # Round to nearest 5
                exercise_text = f"{group}: {exercise} - {sets}x{reps} ({weight} kg)"
            
            result.append(exercise_text)
    
    return "\n".join(result)

@app.route('/generate', methods=['POST'])
def generate_workout_plan():
    print("Received request headers:", request.headers)
    print("Received request data:", request.data)
    
    try:
        if not request.is_json:
            print("Request is not JSON")
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        print("Parsed JSON data:", data)
        
        if not data or ('InputText' not in data and 'inputText' not in data):
            print("InputText missing")
            return jsonify({"error": "InputText is required"}), 400
        
        prompt = data.get('InputText', data.get('inputText', ''))
        
        try:
            # Try to use AI model
            inputs = tokenizer(prompt, return_tensors="pt", max_length=250, truncation=True)
            
            output = model.generate(
                inputs["input_ids"],
                max_length=500,
                num_return_sequences=1,
                temperature=0.7,
                top_k=50,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
            
            generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
            
            # Remove the original prompt to get only the generated part
            if prompt in generated_text:
                generated_text = generated_text[len(prompt):]
            
            # Clean up the text
            generated_text = generated_text.strip()
            
            # Validate the generated text against the expected format
            valid_lines = []
            pattern = r"([a-zA-Z]+):\s*([a-zA-Z\s]+)\s*-\s*(\d+)x(\d+)"
            
            # Extract properly formatted lines
            for line in generated_text.split("\n"):
                if match := re.search(pattern, line):
                    valid_lines.append(line.strip())
            
            # If we couldn't extract enough valid lines, use the fallback
            if len(valid_lines) < 2:
                generated_text = create_fallback_workout(prompt)
            else:
                # Process valid lines to add weights
                processed_lines = []
                for line in valid_lines:
                    match = re.search(pattern, line)
                    if match:
                        group = match.group(1).lower()
                        exercise = match.group(2).strip()
                        sets = int(match.group(3))
                        reps = int(match.group(4))
                        
                        # Determine difficulty from prompt
                        if "kezdő" in prompt.lower():
                            difficulty = "kezdő"
                        elif "haladó" in prompt.lower():
                            difficulty = "haladó"
                        else:
                            difficulty = "közepes"
                        
                        # Check if group exists in our DB, if not use a default
                        if group not in WEIGHT_RANGES[difficulty]:
                            group = "chest"  # Default to chest if unknown group
                        
                        # Add weight information
                        if any(bw_ex.lower() in exercise.lower() for bw_ex in BODYWEIGHT_EXERCISES):
                            processed_line = f"{group}: {exercise} - {sets}x{reps} (testsúllyal)"
                        else:
                            weight_range = WEIGHT_RANGES[difficulty][group]
                            weight = round(random.uniform(*weight_range) / 5) * 5  # Round to nearest 5
                            processed_line = f"{group}: {exercise} - {sets}x{reps} ({weight} kg)"
                        
                        processed_lines.append(processed_line)
                
                generated_text = "\n".join(processed_lines) if processed_lines else create_fallback_workout(prompt)
        
        except Exception as model_error:
            print(f"Model error: {str(model_error)}")
            # Use fallback if model fails
            generated_text = create_fallback_workout(prompt)
        
        return jsonify({
            'generatedText': generated_text,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        print("Error:", str(e))
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)