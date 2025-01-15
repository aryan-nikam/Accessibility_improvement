const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');
const { convertToBraille } = require('./braille'); // Make sure braille.js is in the same directory

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files (like HTML/CSS/JS) from the public directory
app.use(express.static('public'));

// Route to handle file uploads for speech conversion
app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    const language = req.body.language || 'en'; // Default to English if no language is provided
    const convertToBrailleOption = req.body.convertToBraille; // Braille conversion checkbox

    console.log('File received for speech conversion:', file);
    console.log('Selected language:', language);
    console.log('Convert to Braille:', convertToBrailleOption);

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    let text = '';

    // Handle different file types
    if (file.mimetype === 'application/pdf') {
        // PDF text extraction
        const dataBuffer = fs.readFileSync(file.path);
        text = await pdfParse(dataBuffer).then(data => data.text);
    } else if (file.mimetype.startsWith('image/')) {
        // Image text extraction using Tesseract
        text = await Tesseract.recognize(file.path, 'eng').then(result => result.data.text);
    } else if (file.mimetype === 'text/plain') {
        // Text file reading
        text = fs.readFileSync(file.path, 'utf-8');
    } else {
        return res.status(400).send('Unsupported file type.');
    }

    console.log('Extracted text:', text);

    // Convert text to speech
    const gtts = new gTTS(text, language);
    const audioPath = path.join(__dirname, 'uploads', `${file.filename}.mp3`);
    gtts.save(audioPath, (err, result) => {
        if (err) {
            console.error('Error converting text to speech:', err);
            return res.status(500).send('Error converting text to speech.');
        }

        const response = {
            text,
            audioPath: `/uploads/${file.filename}.mp3`
        };

        if (convertToBrailleOption) {
            // Convert to Braille
            const brailleText = convertToBraille(text);
            const braillePath = path.join(__dirname, 'uploads', `${file.filename}_braille.txt`);
            fs.writeFileSync(braillePath, brailleText, 'utf-8');

            response.braillePath = `/uploads/${file.filename}_braille.txt`;
        }

        res.json(response);
    });
});

// Route to handle file uploads for Braille conversion
app.post('/upload-braille', upload.single('file'), async (req, res) => {
    const file = req.file;
    const convertToSpeechOption = req.body.convertToSpeech === 'on'; // Checkbox value

    console.log('File received for Braille conversion:', file);
    console.log('Convert to Speech:', convertToSpeechOption);

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    let text = '';

    // Handle different file types
    if (file.mimetype === 'application/pdf') {
        // PDF text extraction
        const dataBuffer = fs.readFileSync(file.path);
        text = await pdfParse(dataBuffer).then(data => data.text);
    } else if (file.mimetype.startsWith('image/')) {
        // Image text extraction using Tesseract
        text = await Tesseract.recognize(file.path, 'eng').then(result => result.data.text);
    } else if (file.mimetype === 'text/plain') {
        // Text file reading
        text = fs.readFileSync(file.path, 'utf-8');
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
        // Handle Excel files if needed
        // You'll need a library like exceljs to parse Excel files
        // Example code: text = await parseExcel(file.path);
        return res.status(400).send('Excel file handling is not yet implemented.');
    } else {
        return res.status(400).send('Unsupported file type.');
    }

    console.log('Extracted text for Braille:', text);

    // Convert to Braille
    const brailleText = convertToBraille(text);
    const braillePath = path.join(__dirname, 'uploads', `${file.filename}_braille.txt`);
    fs.writeFileSync(braillePath, brailleText, 'utf-8');

    let response = {
        braillePath: `/uploads/${file.filename}_braille.txt`
    };

    if (convertToSpeechOption) {
        // Convert text to speech
        const language = req.body.language || 'en'; // Default to English if no language is provided
        const gtts = new gTTS(text, language);
        const audioPath = path.join(__dirname, 'uploads', `${file.filename}.mp3`);
        gtts.save(audioPath, (err, result) => {
            if (err) {
                console.error('Error converting text to speech:', err);
                return res.status(500).send('Error converting text to speech.');
            }

            response.audioPath = `/uploads/${file.filename}.mp3`;
            res.json(response);
        });
        return; // Return here to avoid sending the response twice
    }

    res.json(response);
});

// Serve the audio and Braille files
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});