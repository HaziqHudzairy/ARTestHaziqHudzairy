const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        const { imageData } = JSON.parse(event.body);

        if (!imageData) {
            return {
                statusCode: 400,
                body: 'No image data provided',
            };
        }

        // Decode base64 and save the file
        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
        const fileName = `note-${Date.now()}.png`;

        // Ensure the `asset/notes` directory exists
        const directoryPath = path.join(__dirname, '../../asset/notes');
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const filePath = path.join(directoryPath, fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File saved successfully', fileName }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: 'Internal Server Error',
        };
    }
};
