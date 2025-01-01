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

// Fetch entities from Firebase and populate global array
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
                        contact_information: entity.contact_information,
                        website: entity.website,
                        description: entity.description,
                        operating_hours: entity.operating_hours,
                    });
                });
            });
        } else {
            console.error("No data found in the database.");
        }
    });
}
fetchEntitiesNameCoordinate();

// Global array to store all locations
let allLocations = [];

// Fetch locations from Firebase and populate `allLocations`
function fetchLocations(callback) {
    const dbRef = ref(database, "information");
    onValue(dbRef, (snapshot) => {
        const categories = snapshot.val();
        allLocations = []; // Reset the array
        for (const category in categories) {
            const entities = categories[category];
            allLocations = [...allLocations, ...Object.values(entities).map((entity) => ({ ...entity, category }))];
        }
        callback(allLocations);
    });
}

fetchLocations(() => {
    console.log("Locations loaded:", allLocations);
});

const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestions");

// Function to render suggestions based on user input
function renderSuggestions(filter = "") {
    suggestionsList.innerHTML = ""; // Clear existing suggestions

    // Filter locations based on user input
    const filteredLocations = allLocations.filter((location) =>
        location.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Populate the suggestions list
    filteredLocations.forEach((location) => {
        const listItem = document.createElement("li");
        listItem.textContent = location.name;

        // On click, fetch respective data and show it in the popup
        listItem.onclick = () => {
            showLocationDetails(location); // Pass the clicked location to the function
        };

        suggestionsList.appendChild(listItem);
    });

    // Show or hide the suggestions list based on results
    suggestionsList.style.display = filteredLocations.length > 0 ? "block" : "none";
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

// Function to show location details in the popup
function showLocationDetails(location) {
    document.getElementById("locationName").innerHTML = location.name || "Unknown Location";
    document.getElementById("locationContact").innerHTML = location.contact_information || "Not available.";
    document.getElementById("locationWebsite").innerHTML = location.website
        ? `<a href="${location.website}" target="_blank" style="color: #007BFF; text-decoration: none;">Visit Website</a>`
        : "Not available.";
    document.getElementById("locationDescription").innerHTML = location.description || "No description available.";
    document.getElementById("locationHours").innerHTML = location.operating_hours || "Operating hours not specified.";

    const modal = document.getElementById("locationModal");
    modal.classList.add("visible");
}

// Close modal when clicking the `x` icon
document.getElementById("modalClose").addEventListener("click", () => {
    const modal = document.getElementById("locationModal");
    modal.classList.remove("visible");
});

// Close modal when clicking outside the content
document.getElementById("locationModal").addEventListener("click", (event) => {
    if (event.target === document.getElementById("locationModal")) {
        const modal = document.getElementById("locationModal");
        modal.classList.remove("visible");
    }
});

