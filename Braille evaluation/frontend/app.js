document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this); // Gather the form data

    fetch('http://127.0.0.1:5000/evaluate', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response data
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `Accuracy: ${data.accuracy.toFixed(2)}%`; // Display accuracy
    })
    .catch(error => {
        // Handle errors
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `Error: ${error.message}`;
    });
});
