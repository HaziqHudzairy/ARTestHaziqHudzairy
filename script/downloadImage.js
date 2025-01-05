require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Debug log helper with timestamps
const log = (message) => console.log(`[${new Date().toISOString()}] ${message}`);

// Ensure Firebase service account key is available
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin SDK
log('Initializing Firebase Admin SDK...');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const bucket = admin.storage().bucket('um-ar-d0418.firebasestorage.app');
log(`Using bucket: ${bucket.name}`);

// Path to the record of downloaded files
const recordFilePath = './script/downloadedFilesV2.json';
if (!fs.existsSync(recordFilePath)) {
    log('Creating downloadedFiles.json to track downloaded files...');
    fs.writeFileSync(recordFilePath, JSON.stringify([]));
} else {
    log('Found existing downloadedFiles.json.');
}

// Path to your HTML file
const htmlFilePath = '.LocationBased.html';

const downloadImagesToDirectory = async () => {
    const folder = 'uploads'; // Folder in Firebase Storage
    const localPath = './asset/EventsImages'; // Local directory for downloads

    log(`Ensuring local path exists: ${localPath}`);
    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath, { recursive: true });
        log(`Created directory: ${localPath}`);
    }

    try {
        log('Reading list of already downloaded files...');
        const downloadedFiles = JSON.parse(fs.readFileSync(recordFilePath, 'utf-8'));
        log(`Downloaded files so far: ${downloadedFiles}`);

        log(`Fetching files from Firebase Storage with prefix: '${folder}'...`);
        const [files] = await bucket.getFiles({ prefix: folder });
        log(`Fetched ${files.length} file(s) from Firebase Storage.`);

        if (files.length === 0) {
            log('No files found in the bucket.');
            return;
        }

        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        for (const file of files) {
            const fileName = path.basename(file.name);
            const eventId = path.parse(fileName).name; // Use the file name (without extension) as the event ID
            log(`Processing file: ${file.name} (local name: ${fileName})`);

            if (downloadedFiles.includes(fileName)) {
                log(`Skipping already downloaded file: ${fileName}`);
                continue;
            }

            const localFile = path.join(localPath, fileName);
            log(`Downloading ${file.name} to ${localFile}...`);
            await file.download({ destination: localFile });

            log(`Successfully downloaded: ${fileName}`);
            downloadedFiles.push(fileName);

            // Append the <img> tag to the <a-assets> section
            const imgTag = `\n            <img id="${eventId}" src="asset/EventsImages/${fileName}">`;
            const assetsTagPosition = htmlContent.indexOf('<a-assets>') + '<a-assets>'.length;
            htmlContent =
                htmlContent.slice(0, assetsTagPosition) + imgTag + htmlContent.slice(assetsTagPosition);
        }

        // Write updated HTML back to the file
        log('Updating HTML file with new <img> tags...');
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

        log('Updating downloadedFiles.json...');
        fs.writeFileSync(recordFilePath, JSON.stringify(downloadedFiles, null, 2));

        log('All new images downloaded and added to HTML successfully!');
    } catch (error) {
        log('Error occurred while downloading images:');
        console.error(error);
    }
};

// Run the function
log('Starting image download...');
downloadImagesToDirectory()
    .then(() => log('Image download process completed.'))
    .catch((error) => log(`Image download process failed: ${error}`));
