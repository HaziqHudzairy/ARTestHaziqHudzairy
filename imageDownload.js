const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Extract file name from the headers
        const fileName = event.headers['file-name'];
        const filePath = path.join('asset/EventsImages', fileName);

        // Ensure the directory exists
        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        // Save the file to the local directory
        fs.writeFileSync(filePath, event.body, 'binary');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `File ${fileName} uploaded successfully` }),
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to upload file', details: error.message }),
        };
    }
};
