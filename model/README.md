# pomoAI (Roberta)

### To run locally
Make sure you have installed docker

Run 
```bash
docker build -t your_image_tag . 
docker run -p 5000:5000 your_image_tag
```

The model will start taking POST requests at "/predict"  