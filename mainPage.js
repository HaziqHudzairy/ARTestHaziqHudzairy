import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Firebase Initialization
const firebaseConfig = {
    apiKey: "AIzaSyB1NEkxuhsfBrsTgfei80LWmF4o_IQwO8",
    authDomain: "um-ar-d0418.firebaseapp.com",
    databaseURL: "https://um-ar-d0418-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "um-ar-d0418",
    storageBucket: "um-ar-d0418.firebasestorage.com",
    messagingSenderId: "624669072499",
    appId: "1:624669072499:web:315e91c12fad88513c6d52",
    measurementId: "G-XWM53Y6FBZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global array to store entities
window.dynamicEntities = [];

// Function to fetch entities from Firebase
function fetchEntitiesNameCoordinate() {
    const entitiesRef = ref(database, "entities");
    onValue(entitiesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            window.dynamicEntities = []; // Reset the array
            Object.keys(data).forEach((category) => {
                Object.values(data[category]).forEach((entity) => {
                    window.dynamicEntities.push({
                        id: entity.id,
                        name: entity.name,
                        latitude: entity.latitude,
                        longitude: entity.longitude,
                        model: entity.model,
                    });
                });
            });
        } else {
            console.error("No data found in the database.");
        }
    });
}
fetchEntitiesNameCoordinate()

const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestions");

function renderSuggestions(filter = "") {
    suggestionsList.innerHTML = ""; // Clear existing suggestions

    // Filter entities based on user input
    const filteredEntities = window.dynamicEntities.filter((entity) =>
        entity.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Populate the suggestions list
    filteredEntities.forEach((entity) => {
        const listItem = document.createElement("li");
        listItem.textContent = entity.name;

        // On click, redirect to LocationBased.html with coordinates
        listItem.onclick = () => {
            const destinationLat = entity.latitude;
            const destinationLon = entity.longitude;

            // Redirect to LocationBased.html with query parameters
            window.location.href = `LocationBased.html?lat=${destinationLat}&lon=${destinationLon}`;
        };

        suggestionsList.appendChild(listItem);
    });

    // Show or hide the suggestions list based on results
    suggestionsList.style.display = filteredEntities.length > 0 ? "block" : "none";
}


// Show suggestions when the input is focused
searchInput.addEventListener("focus", () => renderSuggestions(searchInput.value));

// Update suggestions as the user types
searchInput.addEventListener("input", (event) => renderSuggestions(event.target.value));

// Hide suggestions when clicking outside the input or suggestions list
document.addEventListener("click", (event) => {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = "none";
    }
});

