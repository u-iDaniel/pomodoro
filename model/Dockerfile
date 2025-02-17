# Use a base Python image
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the Flask app port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
