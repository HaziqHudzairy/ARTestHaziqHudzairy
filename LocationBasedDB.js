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

window.findEntityById = function findEntityById(entityId, callback) {
    const dbRef = ref(database, "entities"); // Reference to the 'entities' node

    // Fetch data from Firebase
    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Firebase Data:", data); // Debugging log to view the data structure

        // Traverse the data structure
        for (const category in data) {
            const entities = data[category];
            if (entities[entityId]) {
                console.log("Entity found:", entities[entityId]); // Debugging log
                callback(entities[entityId]); // Return the full entity object
                return;
            }
        }

        console.warn("Entity not found for ID:", entityId); // Log if entity ID is not found
        callback(null); // Return null if entity is not found
    }, (error) => {
        console.error("Error fetching data:", error); // Log errors
        callback(null); // Handle errors gracefully
    });
};


window.findLatLngByEntityId = function findLatLngByEntityId(entityId, callback) {
    const dbRef = ref(database, "entities"); // Reference to the 'information' node

    // Fetch data from Firebase
    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Firebase Data:", data); // Debugging log to view the data structure

        // Traverse the data structure
        for (const category in data) {
            const entities = data[category];
            if (entities[entityId]) {
                const latitude = entities[entityId].latitude;
                const longitude = entities[entityId].longitude;

                if (latitude && longitude) {
                    console.log("Latitude:", latitude, "Longitude:", longitude); // Debugging log
                    callback({ latitude, longitude }); // Return the coordinates
                    return;
                } else {
                    console.warn("Latitude or Longitude not found for entity:", entityId);
                    callback(null); // Return null if coordinates are missing
                    return;
                }
            }
        }

        console.warn("Entity not found for ID:", entityId); // Log if entity ID is not found
        callback(null); // Return null if entity is not found
    }, (error) => {
        console.error("Error fetching data:", error); // Log errors
        callback(null); // Handle errors gracefully
    });
}

// Re-fetch and render entities from the database
window.fetchAndRenderEntities = function () {
    fetchEntitiesNameCoordinate();
    const entitiesRef = ref(database, "entities");
    onValue(entitiesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            renderEntities(data);  // Render all the entities after fetching the data
        } else {
            console.error("No data found in the database.");
        }
    });
}
// Call the function after assigning it to window
fetchAndRenderEntities();

// Recursive Function to Fetch and Render Entities
function renderEntities(node, parent = null) {
    Object.keys(node).forEach((key) => {
        const child = node[key];

        // If the child has `latitude` and `longitude`, it's an entity
        if (child.latitude && child.longitude) {
            createAREntity(child, key, parent);
        } else if (typeof child === "object") {
            // Recursively handle nested objects
            renderEntities(child, key);
        }
    });
}

// Function to Create AR Entity with Toon Shader
window.createAREntity = function (entity, id, parentCategory = null) {
    const scene = document.querySelector("a-scene");
    const entityElement = document.createElement("a-entity");
    entityElement.setAttribute('data-entity-id', id);

    entityElement.classList.add('location-entity');
    entityElement.setAttribute("id", id);
    entityElement.setAttribute("gps-entity-place", `latitude: ${entity.latitude}; longitude: ${entity.longitude}`);
    entityElement.setAttribute("gltf-model", entity.model); // Model from database
    entityElement.setAttribute("scale", entity.scale || "1 1 1"); // Default scale if not provided
    entityElement.setAttribute("look-at", "[gps-camera]");
    entityElement.setAttribute("animation-mixer", "clip: *"); // Optional for animations

    entityElement.addEventListener('model-loaded', () => {
        const model = entityElement.getObject3D('mesh'); // Get the loaded 3D model

        if (model) {
            // Traverse through the model's children to find meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    const originalMaterial = child.material; // Save the original material

                    // Create a gradient map texture for toon shading
                    const textureLoader = new THREE.TextureLoader();
                    const gradientMap = textureLoader.load('asset/middle_button/threeTone.jpg');
                    gradientMap.minFilter = THREE.NearestFilter;
                    gradientMap.magFilter = THREE.NearestFilter;

                    // Apply MeshToonMaterial while preserving the original material's color/texture
                    child.material = new THREE.MeshToonMaterial({
                        color: originalMaterial.color || 0xffffff, // Use the original color
                        map: originalMaterial.map || null,         // Preserve the original texture
                        gradientMap: gradientMap,                 // Use the gradient map for toon effect
                        emissive: originalMaterial.emissive || 0x000000, // Preserve emissive color if set
                        emissiveMap: originalMaterial.emissiveMap || null, // Preserve emissive texture if set
                    });
                }
            });
        }
    });


    // Append to Scene
    scene.appendChild(entityElement);
};



// window.showEntityInformation = async function (entityName) {
//     const virtualSpace = document.querySelector('#virtual-space');
//     const nameElement = document.querySelector('#Name');
//     const descriptionElement = document.querySelector('#Description');
//     const operatingHoursElement = document.querySelector('#operating_hours');
//     const contactInformationElement = document.querySelector('#contact_information');

//     const entitiesRef = ref(database, "information");

//     onValue(entitiesRef, (snapshot) => {
//         const data = snapshot.val();

//         if (data) {
//             let foundEntity = null;

//             // Loop through categories to find the entity
//             Object.keys(data).forEach((category) => {
//                 if (data[category] && data[category][entityName]) {
//                     foundEntity = data[category][entityName];
//                 }
//             });

//             if (foundEntity) {
//                 // Update elements with found data
//                 nameElement.setAttribute('value', foundEntity.name || "N/A");
//                 descriptionElement.setAttribute('value', foundEntity.description || "Description not available.");
//                 operatingHoursElement.setAttribute('value', foundEntity.operating_hours || "Operating hours not available.");
//                 contactInformationElement.setAttribute('value', foundEntity.contact_information || "Contact information not available.");

//                 virtualSpace.setAttribute('visible', true); // Make the virtual space visible
//             } else {
//                 console.error('Entity not found:', entityName);
//                 virtualSpace.setAttribute('visible', false); // Hide the virtual space
//             }
//         } else {
//             console.error('No data found in database.');
//             virtualSpace.setAttribute('visible', false); // Hide the virtual space
//         }
//     });
// };

window.showEntityInformation = async function (entityName) {
    const virtualSpace = document.querySelector('#virtual-space');
    const nameElement = document.querySelector('#Name');
    const descriptionElement = document.querySelector('#Description');
    const operatingHoursElement = document.querySelector('#operating_hours');
    const contactInformationElement = document.querySelector('#contact_information');

    const entitiesRef = ref(database, "information");

    onValue(entitiesRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            let foundEntity = null;

            // Loop through categories to find the entity by name
            Object.keys(data).forEach((category) => {
                if (data[category]) {
                    Object.keys(data[category]).forEach((entityKey) => {
                        const entity = data[category][entityKey];
                        if (entity.name && entity.name.toLowerCase() === entityName.toLowerCase()) {
                            foundEntity = entity;
                        }
                    });
                }
            });

            if (foundEntity) {
                // Update elements with found data
                nameElement.setAttribute('value', foundEntity.name || "N/A");
                descriptionElement.setAttribute('value', foundEntity.description || "Description not available.");
                operatingHoursElement.setAttribute('value', foundEntity.operating_hours || "Operating hours not available.");
                contactInformationElement.setAttribute('value', foundEntity.contact_information || "Contact information not available.");

                virtualSpace.setAttribute('visible', true); // Make the virtual space visible
            } else {
                console.error('Entity not found:', entityName);
                virtualSpace.setAttribute('visible', false); // Hide the virtual space
            }
        } else {
            console.error('No data found in database.');
            virtualSpace.setAttribute('visible', false); // Hide the virtual space
        }
    });
};

window.findEntityIdByName = function (entityName) {
    const entitiesRef = ref(database, "entities"); // Reference to the entities node

    return new Promise((resolve, reject) => {
        onValue(entitiesRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                console.error("No data found in the database.");
                return reject("No data found.");
            }

            for (const category in data) {
                const entities = data[category]; // Get the entities under a category
                for (const entityId in entities) {
                    if (entities[entityId].name && entities[entityId].name.toLowerCase() === entityName.toLowerCase()) {
                        console.log(`Entity found: Name: ${entityName}, ID: ${entityId}`);
                        return resolve(entityId); // Return the matching entity ID
                    }
                }
            }

            console.warn(`Entity not found for name: ${entityName}`);
            resolve(null); // Resolve with null if no matching entity is found
        }, (error) => {
            console.error("Error fetching data:", error);
            reject(error); // Handle errors gracefully
        });
    });
};


let imageRotationInterval = null; // Store the interval ID globally

/**
 * Stops the image rotation and resets the plane to a default state.
 */
window.stopAndResetImageRotation = async function() {
    const eventsImagePlane = document.querySelector('#events'); // Target the <a-plane> element

    // Clear the interval if it's active
    if (imageRotationInterval) {
        clearInterval(imageRotationInterval);
        imageRotationInterval = null;
        console.log("Image rotation stopped.");
    }

    // Reset the plane to a default state
    eventsImagePlane.setAttribute("material", "src: asset/images/no-image-available.png");
    console.log("Plane reset to default state.");
}

/**
 * Function to show event images for a specific location with rotation.
 */
window.showEventImagesForLocation = async function (locationEntityName) {
    const eventsImagePlane = document.querySelector('#events'); // Target the <a-plane> element
    const eventsRef = ref(database, "events");

    // Set a default placeholder image while data is loading
    eventsImagePlane.setAttribute("material", "src: #okW0vkufRDeNJIMV0clGKwo37182-1736091043865");

    try {
        // Resolve the entity ID asynchronously
        const entityId = await window.findEntityIdByName(locationEntityName);

        if (!entityId) {
            console.warn(`Entity not found for name: ${locationEntityName}`);
            eventsImagePlane.setAttribute("material", "src: asset/images/no-image-available.png"); // Default image
            return;
        }

        // Fetch event data from Firebase Realtime Database
        onValue(eventsRef, (snapshot) => {
            const data = snapshot.val();
            const eventIds = []; // Array to store matching event IDs

            if (data) {
                // Collect all matching event IDs with "#" prepended
                Object.keys(data).forEach((eventId) => {
                    const event = data[eventId];
                    if (event.eventLocation === entityId) {
                        eventIds.push("#" + eventId); // Add event ID with "#" prepended
                    }
                });

                // Ensure the array exists and has elements
                if (eventIds && eventIds.length > 0) {
                    // Start rotating images
                    let currentIndex = 0;

                    const rotateImages = () => {
                        const currentEventId = eventIds[currentIndex];
                        eventsImagePlane.setAttribute('material', `src: ${currentEventId}`);
                        currentIndex = (currentIndex + 1) % eventIds.length; // Loop back to the first image
                    };

                    // Display the first image immediately
                    rotateImages();

                    // Clear any existing interval before starting a new one
                    if (imageRotationInterval) {
                        clearInterval(imageRotationInterval);
                    }

                    // Change the image every 5 seconds
                    imageRotationInterval = setInterval(rotateImages, 5000);
                } else {
                    // alert("No items in the event IDs array.");
                    eventsImagePlane.setAttribute("material", "src: asset/AR_Environment_Info/stickynotes.png");
                }
            } else {
                console.error("No events data found in the database.");
            }
        });
    } catch (error) {
        console.error("Error resolving entity ID or fetching events:", error);
        eventsImagePlane.setAttribute("material", "src: asset/images/error-image.png"); // Error placeholder
    }
};

/**
 * Fetch events based on location and display them in the slider.
 */
window.fetchAndRenderEventsByLocation = async function (locationEntityName) {
    const eventsRef = ref(database, "events");
    const eventContainer = document.querySelector('.event-slider-container');

    // Clear the existing event slider
    eventContainer.innerHTML = '';

    try {
        // Resolve the `entityId` for the given location name
        const entityId = await window.findEntityIdByName(locationEntityName);

        if (!entityId) {
            alert(`Entity not found for name: ${locationEntityName}`);
            return;
        }

        // Fetch events related to the resolved `entityId`
        onValue(eventsRef, (snapshot) => {
            const data = snapshot.val();
            const eventDetails = []; // Array to store event details
            // alert(`Entity: ${entityId}`);

            if (data) {
                // Filter events for the matching location
                Object.keys(data).forEach((eventId) => {
                    const event = data[eventId];
                    if (event.eventLocation === entityId) {
                        // Collect event details
                        eventDetails.push({ id: eventId, ...event });
                        // alert(`Entity: ${eventId}`);
                    }
                });

                // Render the event details in the slider
                if (eventDetails.length > 0) {
                    eventDetails.forEach((event) => {
                        const card = createEventCard(event); // Create a card for each event
                        eventContainer.appendChild(card);
                    });

                    // Initialize the slider
                    initializeSlider();
                } else {
                    console.warn(`No events found for location: ${locationEntityName}`);
                    eventContainer.innerHTML = `<p style="color:white">No events available for this location. Click anywhere to continue</p>`;
                }
            } else {
                console.error("No events data found in the database.");
                eventContainer.innerHTML = `<p>Error fetching event data.</p>`;
            }
        });
    } catch (error) {
        console.error("Error fetching events for location:", error);
        eventContainer.innerHTML = `<p>Error fetching events for this location.</p>`;
    }
};


/**
 * Create a card dynamically for an event.
 */
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card hidden'; // Initially hidden

    // Card content
    card.innerHTML = `
        <img src="${event.eventPosterUrl || 'https://via.placeholder.com/300'}" alt="Event Image">
        <h3>${event.eventName || 'Unnamed Event'}</h3>
        <p>Date: ${event.eventDate || 'N/A'}</p>
        <p>Time: ${event.eventTime || 'N/A'}</p>
        <p>Description: ${event.eventDetails || 'No description available.'}</p>
    `;

    // Stop propagation for click events
    card.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    return card;
}

/**
 * Initialize the card slider with swipe functionality.
 */
function initializeSlider() {
    const cards = document.querySelectorAll('.event-card');
    let currentIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function showCard(index) {
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.remove('hidden');
                card.style.transform = 'translateX(0)';
                card.style.opacity = '1';
            } else {
                card.classList.add('hidden');
                card.style.transform = 'translateX(100%)';
                card.style.opacity = '0';
            }
        });
    }

    function handleTouchStart(event) {
        const touch = event.touches[0];
        startX = touch.clientX;
        isDragging = true;
        currentX = startX;
    }

    function handleTouchMove(event) {
        if (!isDragging) return;

        const touch = event.touches[0];
        currentX = touch.clientX;
        const deltaX = currentX - startX;

        const card = cards[currentIndex];
        card.style.transform = `translateX(${deltaX}px)`;
    }

    function handleTouchEnd() {
        if (!isDragging) return;

        const deltaX = currentX - startX;
        const card = cards[currentIndex];
        isDragging = false;

        // If swipe distance is significant, move to the next card
        if (Math.abs(deltaX) > 100) {
            const direction = deltaX > 0 ? 'right' : 'left';
            card.style.transform = `translateX(${direction === 'left' ? '-150%' : '150%'})`;
            card.style.opacity = '0';

            currentIndex = (currentIndex + (direction === 'left' ? 1 : -1) + cards.length) % cards.length;
            setTimeout(() => {
                showCard(currentIndex);
            }, 300);
        } else {
            // Reset the position if swipe is not significant
            card.style.transform = 'translateX(0)';
        }
    }

    // Attach touch events to each card
    cards.forEach(card => {
        card.addEventListener('touchstart', handleTouchStart);
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', handleTouchEnd);
    });

    // Show the initial card
    showCard(currentIndex);
}


window.updateStickyNotesByLocation = async function(locationEntityName) {
    const board = document.getElementById('unique-board'); // Board container

    try {
        // Get the entityId for the locationEntityName
        const entityId = await window.findEntityIdByName(locationEntityName);

        if (!entityId) {
            console.warn(`Entity not found for name: ${locationEntityName}`);
            board.innerHTML = '<p>No sticky notes available for this location.</p>';
            return;
        }

        // Reference to the file directory for the entity's images
        const drawingsRef = ref(database, `user-drawings/${entityId}`);

        // Fetch data from Firebase Realtime Database
        onValue(drawingsRef, (snapshot) => {
            const data = snapshot.val();

            // Clear the existing notes
            board.innerHTML = '';

            if (data) {
                // Loop through the fetched images
                Object.keys(data).forEach((key) => {
                    const imageUrl = data[key];

                    // Create a new sticky note
                    const newNote = document.createElement('div');
                    newNote.classList.add('unique-sticky-note');
                    newNote.innerHTML = `<img src="${imageUrl}" alt="Image ${key}">`;

                    // Add click event to show the image in the modal
                    newNote.addEventListener('click', () => {
                        const modal = document.getElementById('unique-modal');
                        const modalImage = document.getElementById('unique-modal-image');

                        modalImage.src = imageUrl;
                        modal.classList.add('active');
                    });

                    // Append the new sticky note to the board
                    board.appendChild(newNote);
                });
            } else {
                console.warn(`No images found in user-drawings/${entityId}.`);
                board.innerHTML = '<p>No sticky notes available for this location.</p>';
            }
        }, (error) => {
            console.error("Error fetching data from user-drawings directory:", error);
            board.innerHTML = '<p>Error loading sticky notes.</p>';
        });
    } catch (error) {
        console.error("Error updating sticky notes by location:", error);
        board.innerHTML = '<p>Error loading sticky notes.</p>';
    }
};











