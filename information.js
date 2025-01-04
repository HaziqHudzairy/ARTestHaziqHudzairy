import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

let allLocations = []; // To store all locations globally

export function fetchLocations(callback) {
    const dbRef = ref(db, "information");
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


window.findEntityIdByName = function findEntityIdByName(entityName, callback) {
    const dbRef = ref(db, "information"); // Correctly access the 'information' node

    // Fetch data from Firebase
    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();

        // Traverse the data structure
        for (const category in data) {
            const entities = data[category];
            for (const key in entities) {
                if (entities[key].name.trim().toLowerCase() === entityName.trim().toLowerCase()) {
                    callback(key); // Return the key as the Entity ID
                    return;
                }
            }
        }
        console.warn("Entity not found for name:", entityName); // Log if no match is found
        callback(null); // Return null if entity not found
    }, (error) => {
        console.error("Error fetching data:", error); // Log errors
        callback(null); // Handle errors gracefully
    });
};



document.addEventListener("DOMContentLoaded", () => {
    initializeVerticalListSlider();
});

export function initializeVerticalListSlider() {
    const slider = document.getElementById("vertical-suggestions-slider");
    const filterButton = document.getElementById("filterButton");
    const filterModal = document.getElementById("filterModal");
    const filterClose = document.getElementById("filterClose");
    const filterForm = document.getElementById("filterForm");

    // Fetch data from Firebase and populate the slider
    fetchLocations((locations) => {
        renderLocations(locations);
    });

    // Toggle filter modal visibility
    filterButton.addEventListener("click", () => {
        filterModal.classList.add("visible");
    });

    filterClose.addEventListener("click", () => {
        filterModal.classList.remove("visible");
    });

    // Apply filters
    filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const selectedCategories = Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked')
        ).map((checkbox) => checkbox.value);
        const sortOption = document.getElementById("filterSort").value;

        let filteredLocations = [...allLocations];

        // Filter by selected categories
        if (selectedCategories.length > 0) {
            filteredLocations = filteredLocations.filter((location) =>
                selectedCategories.includes(location.category)
            );
        }

        // Sort by name
        if (sortOption === "asc") {
            filteredLocations.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (sortOption === "desc") {
            filteredLocations.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        }

        renderLocations(filteredLocations);
        filterModal.classList.remove("visible"); // Close the modal
    });

    document.getElementById("arButton").addEventListener("click", function () {
        const locationName = document.getElementById("locationName").textContent;
    
        console.log("AR Button Clicked. Location Name:", locationName); // Debugging log
    
        // Call the global function
        findEntityIdByName(locationName, (entityId) => {
            if (entityId) {
                console.log("Entity ID found:", entityId); // Debugging log
                // Add entityID to the URL as a query parameter
                const queryParams = new URLSearchParams({ entityID: entityId });
                // Redirect to LocationBased.html with the entityID
                window.location.href = `LocationBased.html?${queryParams}`;
            } else {
                console.warn("Entity not found for name:", locationName);
                alert("Entity not found. Please try again.");
            }
        });
    });
    

    // Function to render locations in the slider
    function renderLocations(locations) {
        slider.innerHTML = ""; // Clear existing items
        locations.forEach((location) => {
            const listItem = document.createElement("div");
            listItem.className = "vertical-list-item";
            listItem.innerHTML = `
                <div class="vertical-item-name">${location.name || "Unknown Location"}</div>
                <div class="vertical-item-contact">Contact: ${location.contact_information || "N/A"}</div>
            `;
            listItem.addEventListener("click", () => showLocationDetails(location));
            slider.appendChild(listItem);
        });
    }

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
}


