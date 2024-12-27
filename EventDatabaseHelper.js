import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
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

                // Get the category of the event from the eventLocation
                const selectedCategory = Object.keys(locations).find(category => locations[category].hasOwnProperty(event.eventLocation));

                // Map entity name to actual location name
                const categoryLocations = locations[selectedCategory]; // Get the locations of the selected category
                const eventLocationName = categoryLocations[event.eventLocation]; // Map entity to actual name

                window.dynamicEvents.push({
                    id: eventId,
                    name: event.eventName,
                    date: event.eventDate,
                    place: event.eventLocationName,
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
            userEvents.forEach((event) => {
                const selectedCategory = Object.keys(locations).find(category => locations[category].hasOwnProperty(event.eventLocation));

                const categoryLocations = locations[selectedCategory]; // Get the locations of the selected category
                const eventLocationName = categoryLocations[event.eventLocation]; // Map entity to actual name

                window.dynamicUserEvents.push({
                    id: event.eventId, // Correct reference to eventId
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

// Render user's events dynamically in the personal container
function renderUserEvents() {
    const personalContainer = document.querySelector('.personal-container .event-list');
    personalContainer.innerHTML = ''; // Clear any existing content

    // Check if there are no events
    if (window.dynamicUserEvents.length === 0) {
        // Create a "No Events" message
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
        // Loop through the user's events and create HTML for each event
        window.dynamicUserEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');

            // Create the event title
            const eventTitle = document.createElement('div');
            eventTitle.classList.add('event-title');
            eventTitle.textContent = event.name;

            // Create the event details (date and location)
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

            // Create the event description
            const eventDescription = document.createElement('div');
            eventDescription.classList.add('event-description');
            eventDescription.textContent = event.details;

            // Create the 'View Details' button
            const eventButton = document.createElement('button');
            eventButton.classList.add('event-btn');
            eventButton.textContent = 'View Details';
            eventButton.addEventListener('click', () => {
                // Handle the button click, e.g., show event details in a modal or redirect to another page
                alert(`Viewing details for event: ${event.name}`);
            });

            // Append all the created elements to the event item
            eventItem.appendChild(eventTitle);
            eventItem.appendChild(eventDetails);
            eventItem.appendChild(eventDescription);
            eventItem.appendChild(eventButton);

            // Append the event item to the event list
            personalContainer.appendChild(eventItem);
        });
    }
}



