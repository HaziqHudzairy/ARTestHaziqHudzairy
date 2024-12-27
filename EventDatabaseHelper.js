import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
//import {getFireStore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";


// Firebase Initialization
const firebaseConfig = {
    apiKey: "AIzaSyB1NEkxuhsfBrsTgfei80LWmF4o_IQwO8",
    authDomain: "um-ar-d0418.firebaseapp.com",
    databaseURL: "https://um-ar-d0418-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "um-ar-d0418",
    storageBucket: "um-ar-d0418.firebasestorage.app",
    messagingSenderId: "624669072499",
    appId: "1:624669072499:web:315e91c12fad88513c6d52",
    measurementId: "G-XWM53Y6FBZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Check connection status
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
        console.log("Database connected.");
    } else {
        console.log("Database connection lost.");
    }
});

// Global array to store events
window.dynamicEvents = [];

function fetchEvents() {
    const eventsRef = ref(db, "events");
    onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            window.dynamicEvents = []; // Reset the array
            Object.keys(data).forEach((eventId) => {
                const event = data[eventId];

                const selectedCategory = Object.keys(locations).find(category =>
                    locations[category].hasOwnProperty(event.eventLocation)
                );

                const categoryLocations = locations[selectedCategory]; // Get the locations of the selected category
                const eventLocationName = categoryLocations[event.eventLocation]; // Map entity to actual name

                window.dynamicEvents.push({
                    id: eventId, // Correctly pass the eventId
                    name: event.eventName,
                    date: event.eventDate,
                    place: eventLocationName, // Use the actual location name here
                    time: event.eventTime,
                    details: event.eventDetails,
                    posterUrl: event.eventPosterUrl,
                    locationName: eventLocationName, // Add the actual location name here
                });
            });
            console.log(window.dynamicEvents); // For debugging, check the events data in the console
            updateEventSlider(); // Call the function to update the slider
        } else {
            console.error("No events found in the database.");
        }
    });
}

// Call the function when the page loads
fetchEvents();



// Data structure for locations
const locations = {
    facilities: {
        entityAcademyIslam: "Academy of Islamic Studies Musolla",
        entityAidil: "E307",
        entityBangunanCanseleri: "Bangunan Canseleri",
        entityBankIslam: "Bank Islam",
        entityDTC: "Dewan Tunku Canselor (DTC)",
        entityExamHall: "Examination Hall",
        entityKPS: "KPS Complex",
        entityMasjid: "Masjid Ar-Rahman",
        entityPanggung: "Panggung Eksperimen",
        entityTemple: "Sri Sivan Temple",
        entityUMCentral: "UM Central",
        entityUser: "F315"
    },
    faculties: {
        entityAkademiIslam: "Islamic Studies Academy",
        entityAkademiMelayu: "Malay Studies Academy",
        entityArts: "Faculty of Arts and Social Sciences",
        entityBuiltEnvironment: "Faculty of Built Environment",
        entityBusiness: "Faculty of Business and Economics",
        entityCS: "Faculty of Computer Science",
        entityCreativeArts: "Faculty of Creative Arts",
        entityDentistry: "Faculty of Dentistry",
        entityEducation: "Faculty of Education",
        entityEngineering: "Faculty of Engineering",
        entityInstituteAdvancedStudies: "Institute of Advanced Studies",
        entityLanguages: "Faculty of Languages",
        entityLaw: "Faculty of Law",
        entityMedicine: "Faculty of Medicine",
        entityPharmacy: "Faculty of Pharmacy",
        entityPusatAsasi: "Foundation Centre",
        entityScience: "Faculty of Science",
        entitySport: "Faculty of Sports Science"
    },
    libraries: {
        entityDentalLibrary: "UM Dental Library",
        entityIslamicLibrary: "Islamic Studies Library",
        entityLawLibrary: "Tan Sri Prof. Ahmad Ibrahim Law Library",
        entityMedicalLibrary: "TJ Danaraj Medical Library",
        entityUMLibrary: "UM Main Library",
        entityZabaLibrary: "Za'ba Memorial Library"
    },
    residentialColleges: {
        entityKolej1: "Kolej Kediaman 1",
        entityKolej10: "Kolej Kediaman 10",
        entityKolej11: "Kolej Kediaman 11",
        entityKolej12: "Kolej Kediaman 12",
        entityKolej13: "Kolej Kediaman 13",
        entityKolej2: "Kolej Kediaman 2",
        entityKolej3: "Kolej Kediaman 3",
        entityKolej4: "Kolej Kediaman 4",
        entityKolej5: "Kolej Kediaman 5",
        entityKolej6: "Kolej Kediaman 6",
        entityKolej7: "Kolej Kediaman 7",
        entityKolej8: "Kolej Kediaman 8",
        entityKolej9: "Kolej Kediaman 9",
        entityRumahUniversiti: "Rumah Universiti"
    },
    sportsAndRecreation: {
        entityKayaks: "Kayak at Varsity Lake UM",
        entityLadangMini: "Ladang Mini ISB UM",
        entityMustafaRiver: "Mustafa River UM",
        entityPadangC: "Padang C UM",
        entityRimbaIlmu: "Rimba Ilmu Botanical Garden UM",
        entitySwimmingPool: "Swimming Pool UM Sports Center",
        entityUMArenaStadium: "UM Arena Stadium",
        entityUMPark: "UM Park",
        entityUMSportsCentre: "UM Sports Centre",
        entityUMWallSquash: "UM Wall Squash Complex",
        entityVarsityGreen: "UM Varsity Green"
    }

};

const categoryFilter = document.getElementById('categoryFilter');
const eventLocation = document.getElementById('eventLocation');

// Populate locations based on selected category
categoryFilter.addEventListener('change', () => {
    const selectedCategory = categoryFilter.value;
    const categoryLocations = locations[selectedCategory];

    // Clear existing options
    eventLocation.innerHTML = '<option value="" disabled selected>Select a location</option>';

    // Add new options
    for (const [key, value] of Object.entries(categoryLocations)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value;
        eventLocation.appendChild(option);
    }
});


// Log the clubName value to see if it's correct


const eventForm = document.getElementById('eventForm');
// Form submission
const uidUser = window.userUid;
const emailUser = window.userEmail;

eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventDetails = document.getElementById('eventDetails').value;
    const eventLocationValue = eventLocation.value;
    const eventPoster = document.getElementById('eventPoster').files[0];

    try {
        if (!eventPoster) throw new Error("No poster selected.");

        // Upload poster and get the URL
        const posterUrl = await uploadImage(eventPoster);

        // Generate a unique event ID
        const eventId = `${uidUser}-${Date.now()}`;

        // Save event details to Firebase Realtime Database
        await set(ref(db, `events/${eventId}`), {
            eventName,
            eventDate,
            eventTime,
            eventDetails,
            eventOrganizer: "Admin",
            eventLocation: eventLocationValue,
            eventPosterUrl: posterUrl,
        });

        alert('Event submitted successfully!');
        eventForm.reset();
    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to submit the event: ${error.message}`);
    }
});

// Function to upload an image
async function uploadImage(file) {
    try {
        // Create a storage reference
        const fileRef = storageRef(storage, `uploads/${file.name}`);

        // Upload the file
        const snapshot = await uploadBytes(fileRef, file);
        console.log('Uploaded a file successfully:', snapshot.metadata);

        // Get the file's download URL
        const downloadURL = await getDownloadURL(fileRef);
        console.log('File available at:', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}


// Function to filter events for the logged-in user
function filterUserEvents(events) {
    return Object.keys(events).filter(eventId => {
        // Check if the eventId contains the user's ID
        const eventUserId = eventId.split('-')[0]; // Extract the user ID from event ID
        return eventUserId === uidUser; // Match event's userID with logged-in user's ID
    }).map(eventId => events[eventId]); // Return the events corresponding to the user's ID
}

// Fetch user-specific events from Firebase
function fetchUserEvents() {
    const eventsRef = ref(db, "events");
    onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            window.dynamicUserEvents = []; // Reset the array for user-specific events
            const userEvents = filterUserEvents(data); // Filter events for the current user

            // Push user's events to window.dynamicUserEvents
            userEvents.forEach((event, index) => {
                const eventId = Object.keys(data)[index]; // Correctly get the eventId
                const selectedCategory = Object.keys(locations).find(category =>
                    locations[category].hasOwnProperty(event.eventLocation)
                );

                const categoryLocations = locations[selectedCategory]; // Get the locations of the selected category
                const eventLocationName = categoryLocations[event.eventLocation]; // Map entity to actual name

                window.dynamicUserEvents.push({
                    id: eventId, // Correctly pass the eventId
                    name: event.eventName,
                    date: event.eventDate,
                    place: eventLocationName, // Use the actual location name here
                    time: event.eventTime,
                    details: event.eventDetails,
                    posterUrl: event.eventPosterUrl,
                    locationName: eventLocationName, // Add the actual location name here
                });
            });
            console.log(window.dynamicUserEvents); // For debugging, check the user's events in the console
            renderUserEvents(); // Call the function to display user's events
        } else {
            console.error("No events found in the database.");
        }
    });
}


// Call the function to fetch and display events for the logged-in user
fetchUserEvents();


function renderUserEvents() {
    const personalContainer = document.querySelector('.personal-container .event-list');
    personalContainer.innerHTML = ''; // Clear any existing content

    // Check if there are no events
    if (window.dynamicUserEvents.length === 0) {
        const noEventsMessage = document.createElement('div');
        noEventsMessage.classList.add('event-item');
        noEventsMessage.innerHTML = `
            <div class="event-title">No Events Available</div>
            <div class="event-details">
                <span class="event-date">Please add some events!</span>
            </div>
        `;
        personalContainer.appendChild(noEventsMessage);
    } else {
        window.dynamicUserEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');

            // Attach event ID
            eventItem.setAttribute('data-id', event.id);
            console.log(eventItem);


            // Event content
            const eventTitle = document.createElement('div');
            eventTitle.classList.add('event-title');
            eventTitle.textContent = event.name;

            const eventDetails = document.createElement('div');
            eventDetails.classList.add('event-details');
            const eventDate = document.createElement('span');
            eventDate.classList.add('event-date');
            eventDate.textContent = `Date: ${event.date}`;
            const eventLocation = document.createElement('span');
            eventLocation.classList.add('event-location');
            eventLocation.textContent = `Location: ${event.locationName}`;
            eventDetails.appendChild(eventDate);
            eventDetails.appendChild(eventLocation);

            const eventDescription = document.createElement('div');
            eventDescription.classList.add('event-description');
            eventDescription.textContent = event.details;

            // Add view details button
            const eventButton = document.createElement('button');
            eventButton.classList.add('event-btn');
            eventButton.textContent = 'View Details';
            eventButton.addEventListener('click', () => {
                showEventDetails(eventItem); // Pass eventItem
            });

            eventItem.appendChild(eventTitle);
            eventItem.appendChild(eventDetails);
            eventItem.appendChild(eventDescription);
            eventItem.appendChild(eventButton);

            // Add data attributes
            eventItem.setAttribute('data-time', event.time);
            eventItem.setAttribute('data-poster-url', event.posterUrl);

            personalContainer.appendChild(eventItem);
        });
    }
}


function showEventDetails(eventItem) {
    

    const title = eventItem.querySelector('.event-title').textContent;
    const date = eventItem.querySelector('.event-date').textContent;
    const location = eventItem.querySelector('.event-location').textContent;
    const description = eventItem.querySelector('.event-description').textContent;

    const time = eventItem.getAttribute('data-time');
    const posterUrl = eventItem.getAttribute('data-poster-url');

    const detailsContainer = document.querySelector('.details-event');
    detailsContainer.querySelector('.event-title').textContent = title;
    detailsContainer.querySelector('.event-date').textContent = date;
    detailsContainer.querySelector('.event-location').textContent = location;
    detailsContainer.querySelector('.event-description').textContent = description;

    const eventTimeElement = detailsContainer.querySelector('.event-time');
    if (eventTimeElement) {
        eventTimeElement.textContent = `Time: ${time}`;
    }

    const imgContainer = detailsContainer.querySelector('.img-container img');
    if (imgContainer) {
        imgContainer.src = posterUrl;
        imgContainer.alt = title;
    }

    detailsContainer.style.visibility = 'visible';
    detailsContainer.style.opacity = '1';

    const overlay = document.querySelector('.overlay');
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';

    $('.nav').addClass('hidden');

    // Remove previous event listener and bind the correct eventId to the edit button
    const editButton = document.querySelector('.edit-btn');
    editButton.onclick = null; // Clear any previous listener
    editButton.addEventListener('click', () => enableEditMode(eventItem)); // Add the correct eventId
}



function enableEditMode(eventItem) {
    const eventId = eventItem.getAttribute('data-id');
    const detailsContainer = document.querySelector('.details-event');
    alert(`Editing Event ID: ${eventId}`);

    // Replace static content with input fields
    const titleField = detailsContainer.querySelector('.event-title');
    const dateField = detailsContainer.querySelector('.event-date');
    const timeField = detailsContainer.querySelector('.event-time');
    const locationField = detailsContainer.querySelector('.event-location');
    const descriptionField = detailsContainer.querySelector('.event-description');
    const imgContainer = detailsContainer.querySelector('.img-container');

    // Save original values in case the user cancels the edit
    titleField.setAttribute('data-original', titleField.textContent);
    dateField.setAttribute('data-original', dateField.textContent.replace('Date: ', ''));
    timeField.setAttribute('data-original', timeField.textContent.replace('Time: ', ''));
    locationField.setAttribute('data-original', locationField.textContent.replace('Location: ', ''));
    descriptionField.setAttribute('data-original', descriptionField.textContent);

    // Convert to editable fields
    titleField.innerHTML = `
        <label for="edit-title">Event Title</label>
        <input type="text" id="edit-title" value="${titleField.textContent}" class="edit-title" placeholder="Enter the event title">
    `;

    dateField.innerHTML = `
        <label for="edit-date">Event Date</label>
        <input type="date" id="edit-date" value="${dateField.getAttribute('data-original')}" class="edit-date">
    `;

    timeField.innerHTML = `
        <label for="edit-time">Event Time</label>
        <input type="time" id="edit-time" value="${timeField.getAttribute('data-original')}" class="edit-time">
    `;

    // Create a dropdown for the location field
    locationField.innerHTML = `
        <label for="edit-location">Event Location</label>
        <select id="edit-location" class="edit-location">
            <option value="" disabled>Select a location</option>
        </select>
    `;

    // Populate the dropdown with options dynamically
    const locationDropdown = locationField.querySelector('#edit-location');
    for (const [category, categoryLocations] of Object.entries(locations)) {
        for (const [key, value] of Object.entries(categoryLocations)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;

            // Pre-select the current location
            if (key === locationField.getAttribute('data-original')) {
                option.selected = true;
            }

            locationDropdown.appendChild(option);
        }
    }

    descriptionField.innerHTML = `
        <label for="edit-description">Event Description</label>
        <textarea id="edit-description" class="edit-description" placeholder="Enter a description for the event">${descriptionField.textContent}</textarea>
    `;

    // Add a button for changing the image
    const changeImageButton = document.createElement('button');
    changeImageButton.textContent = 'Upload New Image';
    changeImageButton.classList.add('change-image-btn');

    // Add the file input field for uploading a new image
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none'; // Hide input, trigger with button

    // Create a loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    loadingSpinner.style.display = 'none'; // Initially hidden

    // Append the spinner to the image container
    imgContainer.appendChild(loadingSpinner);

    // Trigger file input when button is clicked
    changeImageButton.addEventListener('click', () => {
        imageInput.click();
    });

    // Handle image upload
    imageInput.addEventListener('change', async (e) => {
        const newImageFile = e.target.files[0];
        if (newImageFile) {
            try {
                // Show the loading spinner
                loadingSpinner.style.display = 'block';

                const newImageUrl = await uploadImage(newImageFile); // Assume `uploadImage` uploads and returns the image URL

                const imgElement = imgContainer.querySelector('img');
                imgElement.src = newImageUrl; // Update the displayed image
            } catch (error) {
                console.error('Failed to upload new image:', error);
                alert('Failed to upload the new image. Please try again.');
            } finally {
                // Hide the loading spinner after upload is complete or failed
                loadingSpinner.style.display = 'none';
            }
        }
    });

    // Append the button and file input to the image container
    imgContainer.appendChild(changeImageButton);
    imgContainer.appendChild(imageInput);


    // Unhide the overlay
    const overlay = document.querySelector('.done-btn');
    overlay.style.visibility = 'hidden';
    overlay.style.opacity = '0';

    // Remove existing buttons and ensure only the desired ones are displayed
    const buttonContainer = detailsContainer.querySelector('.button-container');
    buttonContainer.innerHTML = ''; // Clear existing buttons

    // Add Save Changes button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.classList.add('save-btn');
    saveButton.style.backgroundColor = 'green'; // Green color
    saveButton.style.color = 'white';
    saveButton.style.marginRight = '10px';
    buttonContainer.appendChild(saveButton);

    // Add Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.style.backgroundColor = '#d32f2f'; // Red color
    deleteButton.style.color = 'white';
    deleteButton.style.marginRight = '10px'; // Set margin for Delete button
    buttonContainer.appendChild(deleteButton);

    // Add Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-btn');
    cancelButton.style.backgroundColor = '#007BFF'; // Blue color
    cancelButton.style.color = 'white';
    cancelButton.style.marginRight = '10px'; // Set margin for Cancel button
    buttonContainer.appendChild(cancelButton);

    alert(`eventId: ${eventId}`);


    // Attach Save and Cancel button handlers
    cancelButton.addEventListener('click', () => cancelEditMode());
    saveButton.addEventListener('click', () => saveChanges(eventId));
    deleteButton.addEventListener('click', () => deleteEvent(eventId)); // You should implement this function
}



async function saveChanges(currentEventId) {
    deleteEvent(currentEventId)
    const detailsContainer = document.querySelector('.details-event');

    // Get updated values from inputs
    const updatedTitle = detailsContainer.querySelector('#edit-title').value;
    const updatedDate = detailsContainer.querySelector('#edit-date').value;
    const updatedTime = detailsContainer.querySelector('#edit-time').value;
    const updatedLocation = detailsContainer.querySelector('#edit-location').value;
    const updatedDescription = detailsContainer.querySelector('#edit-description').value;

    const imgContainer = detailsContainer.querySelector('.img-container');
    const currentPosterUrl = imgContainer.querySelector('img').src; // Get the current image URL

    const imageInput = imgContainer.querySelector('input[type="file"]'); // Get the file input element
    const newImageFile = imageInput.files[0]; // Check if a new image file is selected

    try {
        let updatedPosterUrl = currentPosterUrl; // Default to the current image URL

        // If a new image is selected, upload it and update the URL
        if (newImageFile) {
            console.log('Uploading new image...');
            updatedPosterUrl = await uploadImage(newImageFile); // Use the uploadImage function
            console.log('New image uploaded successfully:', updatedPosterUrl);
        }

        // Generate a unique event ID
        const eventId = `${uidUser}-${Date.now()}`;

        // Save event details to Firebase Realtime Database
        await set(ref(db, `events/${eventId}`), {
            eventName: updatedTitle,
            eventDate: updatedDate,
            eventTime: updatedTime,
            eventDetails: updatedDescription,
            eventOrganizer: "Admin",
            eventLocation: updatedLocation,
            eventPosterUrl: updatedPosterUrl, // Use either the new or the current image URL
        });

        alert('Event updated successfully!');

        // Reset and hide the details container
        cancelEditMode();
    } catch (error) {
        console.error('Error updating the event:', error);
        alert('Failed to update the event. Please try again.');
    }
}

async function deleteEvent(eventId) {
    // Show confirmation popup
    const confirmDelete = await showDeleteConfirmation();
    if (!confirmDelete) {
        return; // Exit if the user cancels
    }

    try {
        // Reference the specific event in Firebase
        const eventRef = ref(db, `events/${eventId}`);

        // Remove the event
        await set(eventRef, null);

        alert('Event deleted successfully!');

        // Hide the details-event and overlay after deletion
        const detailsContainer = document.querySelector('.details-event');
        detailsContainer.style.visibility = 'hidden';
        detailsContainer.style.opacity = '0';

        const overlay = document.querySelector('.overlay');
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';

        // Reset and hide the details container
        cancelEditMode();

        // Optionally refresh the list of events
        fetchEvents();
    } catch (error) {
        console.error('Error deleting the event:', error);
        alert('Failed to delete the event. Please try again.');
    }
}

function showDeleteConfirmation() {
    return new Promise((resolve) => {
        // Create the confirmation modal
        const modal = document.createElement('div');
        modal.classList.add('delete-modal');

        modal.innerHTML = `
            <div class="delete-modal-content">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this event? This action cannot be undone.</p>
                <div class="delete-modal-actions">
                    <button class="delete-confirm-btn">Yes, Delete</button>
                    <button class="delete-cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        // Add the modal to the document
        document.body.appendChild(modal);

        // Attach event listeners for the buttons
        const confirmButton = modal.querySelector('.delete-confirm-btn');
        const cancelButton = modal.querySelector('.delete-cancel-btn');

        confirmButton.addEventListener('click', () => {
            resolve(true); // Resolve promise with true
            document.body.removeChild(modal); // Remove modal from the DOM
        });

        cancelButton.addEventListener('click', () => {
            resolve(false); // Resolve promise with false
            document.body.removeChild(modal); // Remove modal from the DOM
        });
    });
}






function cancelEditMode() {
    const detailsContainer = document.querySelector('.details-event');

    // Restore original non-editable values
    const titleField = detailsContainer.querySelector('.event-title');
    const dateField = detailsContainer.querySelector('.event-date');
    const timeField = detailsContainer.querySelector('.event-time');
    const locationField = detailsContainer.querySelector('.event-location');
    const descriptionField = detailsContainer.querySelector('.event-description');
    const imgContainer = detailsContainer.querySelector('.img-container');

    // Retrieve original values from data attributes
    const originalTitle = titleField.getAttribute('data-original');
    const originalDate = dateField.getAttribute('data-original');
    const originalTime = timeField.getAttribute('data-original');
    const originalLocation = locationField.getAttribute('data-original');
    const originalDescription = descriptionField.getAttribute('data-original');

    // Revert fields to non-editable display
    titleField.innerHTML = originalTitle;
    dateField.innerHTML = `Date: ${originalDate}`;
    timeField.innerHTML = `Time: ${originalTime}`;
    locationField.innerHTML = `Location: ${originalLocation}`;
    descriptionField.innerHTML = originalDescription;

    // Remove upload button if it exists
    const uploadButton = imgContainer.querySelector('.change-image-btn');
    if (uploadButton) {
        uploadButton.remove();
    }

    // Remove file input field if it exists
    const fileInput = imgContainer.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.remove();
    }

    // Remove editing buttons and restore initial state
    const buttonContainer = detailsContainer.querySelector('.button-container');
    buttonContainer.innerHTML = `
        <button class="edit-btn">Edit</button>
        <button class="done-btn">Done</button>
    `;

    // Attach the "Edit" button handler again
    const editButton = buttonContainer.querySelector('.edit-btn');
    editButton.addEventListener('click', () => enableEditMode());

    // Attach the "Done" button handler again
    const doneButton = buttonContainer.querySelector('.done-btn');
    doneButton.addEventListener('click', () => {
        detailsContainer.style.visibility = 'hidden';
        detailsContainer.style.opacity = '0';

        const overlay = document.querySelector('.overlay');
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';

        $('.nav').removeClass('hidden');
    });

    // Hide the details-event container and overlay
    detailsContainer.style.visibility = 'hidden';
    detailsContainer.style.opacity = '0';

    const overlay = document.querySelector('.overlay');
    overlay.style.visibility = 'hidden';
    overlay.style.opacity = '0';

    // Restore the navbar
    $('.nav').removeClass('hidden');
}








