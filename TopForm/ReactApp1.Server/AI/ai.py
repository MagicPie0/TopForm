from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime

app = Flask(__name__)

# Load model
model_name = "distilgpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Verify model is loaded
        if not model or not tokenizer:
            raise Exception("Model not loaded")
            
        return jsonify({
            "status": "online",
            "model": model_name,
            "ready": True,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/generate', methods=['POST'])
def generate_workout():
    try:
        data = request.get_json()
        if not data or 'InputText' not in data:
            return jsonify({"error": "InputText is required"}), 400

        inputs = tokenizer(data['InputText'], 
                         return_tensors="pt", 
                         padding="max_length", 
                         truncation=True, 
                         max_length=50)

        output = model.generate(
            inputs["input_ids"],
            attention_mask=inputs['attention_mask'],
            max_length=100,
            num_return_sequences=1,
            pad_token_id=tokenizer.eos_token_id,
            temperature=1,
            top_k=10,
            top_p=0.7,
            do_sample=True,
            repetition_penalty=1.5,
            eos_token_id=tokenizer.eos_token_id
        )

        generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
        return jsonify({
            'generatedText': generated_text,
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)