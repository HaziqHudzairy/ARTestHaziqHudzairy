async function triggerImageDownload() {
    const apiUrl = 'https://image-downloader-umber.vercel.app/api/download-images'; // Vercel backend URL

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to download images: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Download response:', data);

        // Optionally display the downloaded files
        const status = document.getElementById('status');
        if (data.newFiles && data.newFiles.length > 0) {
            status.textContent = `Downloaded files: ${data.newFiles.join(', ')}`;
        } else {
            status.textContent = 'No new images to download.';
        }
    } catch (error) {
        console.error('Error triggering image download:', error);
        const status = document.getElementById('status');
        status.textContent = `Error: ${error.message}`;
    }
}

// Attach the function to a button click
document.getElementById('downloadButton').addEventListener('click', triggerImageDownload);
