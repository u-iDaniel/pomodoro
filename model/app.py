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

   # Perform inference
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    # Apply softmax to get probabilities
    probs = torch.softmax(logits, dim=1)

    # Get predicted class index
    predicted_class = torch.argmax(probs, dim=1).item()

    # Mapping back to genre labels (reverse mapping from your training labels)
    genre_mapping = {
        1: "Pop", 2: "Hip-Hop/Rap", 3: "Latin", 4: "Rock", 5: "EDM",
        6: "Afrobeats", 7: "Reggaeton", 8: "R&B", 9: "Indie Pop", 10: "Dance-Pop",
        11: "K-Pop", 12: "Alternative Rock", 13: "Country", 14: "Jazz", 15: "Classical",
        16: "Blues", 17: "Metal", 18: "Punk", 19: "Folk", 20: "Lo-fi" }

    # Convert the prediction back to a genre name
    predicted_genre = genre_mapping[predicted_class + 1]  # +1 to match your labels

    # Return the prediction result
    return jsonify({'prediction': predicted_genre})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)