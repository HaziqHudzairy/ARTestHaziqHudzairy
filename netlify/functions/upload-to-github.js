const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const { imageData, fileName, folderName } = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Store token in environment variables
    const REPO = 'ARTestHaziqHudzairy'; // Replace with your repo name
    const OWNER = 'HaziqHudzairy'; // Replace with your GitHub username
    const BRANCH = 'main'; // Replace with your branch name

    const filePath = `${folderName}/${fileName}`;
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`;

    // Convert base64 data to buffer
    const content = imageData.split(',')[1];

    try {
        // Check if file exists
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
            },
        });

        let sha = null;
        if (response.status === 200) {
            const data = await response.json();
            sha = data.sha; // File exists, get its SHA
        }

        const result = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add ${fileName}`,
                content: content,
                branch: BRANCH,
                sha: sha,
            }),
        });

        if (!result.ok) {
            throw new Error('Failed to upload to GitHub');
        }

        return {
            statusCode: 200,
            body: 'File uploaded successfully!',
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: `Error: ${error.message}`,
        };
    }
};
