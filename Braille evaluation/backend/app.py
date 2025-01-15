from flask import Flask, request, jsonify, send_from_directory
from braille_utils import evaluate_accuracy  # Import evaluate_accuracy from braille_utils
import PyPDF2
import io

app = Flask(__name__)

# Define the root route to serve the frontend
@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')  # Serve the index.html

# Serve static files (like CSS and JS)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../frontend', path)  # Serve static files

# Function to extract text from PDF
def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'  # Add new line after each page
    return text

# Evaluate Braille accuracy route
@app.route('/evaluate', methods=['POST'])
def evaluate_braille():
    if 'originalFile' not in request.files or 'brailleFile' not in request.files:
        return jsonify({"error": "Both files are required."}), 400

    original_file = request.files['originalFile']
    braille_file = request.files['brailleFile']

    # Determine if original_file is PDF or text
    if original_file.filename.endswith('.pdf'):
        original_text = extract_text_from_pdf(original_file)
    else:
        original_text = original_file.read().decode('utf-8')

    braille_text = braille_file.read().decode('utf-8')

    # Debugging print statements
    print("Original file content:", original_text)
    print("Braille file content:", braille_text)

    # Call the evaluate_accuracy function to check the accuracy
    accuracy = evaluate_accuracy(original_text, braille_text)

    # Debugging print statement for accuracy
    print("Calculated accuracy:", accuracy)

    return jsonify({
        "accuracy": accuracy
    })

if __name__ == "__main__":
    app.run(debug=True)
