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

                const isArray = Array.isArray(eventIds);
                alert(`Data type of eventIds: ${typeof eventIds} (Is it an array? ${isArray})`);

                // Ensure the array exists and has elements
                if (eventIds && eventIds.length > 0) {
                    eventIds.forEach((eventId, index) => {
                        // Alert each item in the array
                        alert(`Item ${index + 1}: ${eventId}`);
                    });

                    // Start rotating images
                    let currentIndex = 0;

                    const rotateImages = () => {
                        const currentEventId = eventIds[currentIndex];
                        eventsImagePlane.setAttribute('material', `src: ${currentEventId}`);
                        alert(`Displaying image: ${currentEventId}`);
                        currentIndex = (currentIndex + 1) % eventIds.length; // Loop back to the first image
                    };

                    // Display the first image immediately
                    rotateImages();

                    // Change the image every 2 seconds
                    setInterval(rotateImages, 2000);
                } else {
                    alert("No items in the event IDs array.");
                    eventsImagePlane.setAttribute("material", "src: asset/images/no-image-available.png");
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









