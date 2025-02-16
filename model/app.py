from flask import Flask, request, jsonify
import torch
import numpy as np
import pandas as pd
from transformers import RobertaTokenizer, RobertaForSequenceClassification, AdamW

app = Flask(__name__)

# Load the model and tokenizer
model = RobertaForSequenceClassification.from_pretrained('./music_genre_model_new')
tokenizer = RobertaTokenizer.from_pretrained('./music_genre_model_new')

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)
model.eval()  # Set the model to evaluation mode

# Define a route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    # Get input text from the POST request
    data = request.json
    input_text = data['text']

    # Tokenize the input text
    inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True)
    input_ids = inputs['input_ids'].to(device)
    attention_mask = inputs['attention_mask'].to(device)

    # Make a prediction
    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits

    # Convert logits to predicted class labels (if multiclass)
    predictions = torch.argmax(logits, dim=1).cpu().numpy()

    # Return the prediction result
    return jsonify({'prediction': predictions.tolist()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
