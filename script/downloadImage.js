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
const recordFilePath = './script/downloadedFiles.json';
if (!fs.existsSync(recordFilePath)) {
    log('Creating downloadedFiles.json to track downloaded files...');
    fs.writeFileSync(recordFilePath, JSON.stringify([]));
} else {
    log('Found existing downloadedFiles.json.');
}

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

        for (const file of files) {
            const fileName = path.basename(file.name);
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
        }

        log('Updating downloadedFiles.json...');
        fs.writeFileSync(recordFilePath, JSON.stringify(downloadedFiles, null, 2));

        log('All new images downloaded successfully!');
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
