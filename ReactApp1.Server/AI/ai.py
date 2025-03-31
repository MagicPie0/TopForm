from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)

# Modell betöltése
model_name = "distilgpt2"  # A distillált GPT-2 modell neve
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Beállítjuk a pad_token_id-t
tokenizer.pad_token = tokenizer.eos_token  # Pad token az EOS token lesz

@app.route('/generate', methods=['POST'])
def generate_workout():
    # JSON-ból kinyerjük az inputot
    data = request.get_json()
    input_text = data['InputText']

    # Tokenizálás
    inputs = tokenizer(input_text, return_tensors="pt", padding="max_length", truncation=True, max_length=50)

    # Attention mask hozzáadása
    attention_mask = inputs['attention_mask']

    # Generálás beállítások
    output = model.generate(
        inputs["input_ids"],
        attention_mask=attention_mask,
        max_length=100,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id,
        temperature=1,
        top_k=10,
        top_p=0.7,
        do_sample=True,
        repetition_penalty=1.5,
        eos_token_id=tokenizer.eos_token_id  # Segíti a modell leállását
    )




    # Az eredmény visszaalakítása szöveggé
    generated_text = tokenizer.decode(output[0], skip_special_tokens=True)

    # JSON válasz visszaküldése
    return jsonify({'generatedText': generated_text})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
