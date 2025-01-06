// Update the location continuously with system popup for errors
function updateLocation() {
    navigator.geolocation.watchPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Update the user's location display
            updateLocationDisplay(latitude, longitude);

            // Check if the user is near any entity (within a 25-meter radius)
            checkProximity(latitude, longitude, window.dynamicEntities, 30);
        },
        function (error) {
            // Handle different types of errors and show system alert popup
            let message = "";
            switch (error.code) {
                case 1:
                    message = "Permission denied. Please enable location access in your browser settings.";
                    break;
                case 2:
                    message = "Position unavailable. Please check your GPS or internet connection.";
                    break;
                case 3:
                    message = "Request timed out. Please try again.";
                    break;
                default:
                    message = "An unknown error occurred. Please refresh and try again.";
                    break;
            }
            // Display system alert popup
            alert(message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
}

// Call the function to start updating the location
updateLocation();

function clearClickEvent(btnContent) {
    btnContent.removeEventListener("click", handleExitClick);
}

function handleExitClick() {
    const searchForm = document.getElementById("search-form");
    const centerMenu = document.querySelector('.center-menu2');
    searchForm.style.display = 'block';

    clearMarkers();
    hideExitNav();

    centerMenu.style.animation = 'boink-reverse 0.5s ease-in-out forwards';

    setTimeout(() => {
        centerMenu.style.animation = 'none';
        fallBackCenterMenu();
    }, 500);

}

function recreateCenterMenu() {
    const oldMenu = document.querySelector('.center-menu2');
    const parent = oldMenu.parentElement;

    // Remove the old menu
    parent.removeChild(oldMenu);

    // Create a new menu element
    const newMenu = document.createElement('div');
    newMenu.className = 'center-menu2 hidden';
    newMenu.innerHTML = `
        <img src="asset/middle_button/we love the earth.png" alt="earth_img">
        <div class="center-circle2">
            <h6>You are going to</h6>
            <h3></h3>
        </div>
    `;

    // Append the new menu
    parent.appendChild(newMenu);
    return newMenu;
}

function fallBackCenterMenu() {
    recreateCenterMenu(); // Completely reset the element
}


function unhideExitNav() {
    const btnContent = document.querySelector('.btn-content');
    btnContent.classList.remove('hidden');

    // Add the event listener
    btnContent.addEventListener("click", handleExitClick);
}

function hideExitNav() {
    const btnContent = document.querySelector('.btn-content');
    btnContent.classList.add('hidden');

    // Remove the event listener
    clearClickEvent(btnContent);
}

//Show fata container for user position
document.getElementById("data-container").style.display = "block";
// Select form, input, suggestions container, and suggestion lists
const searchForm = document.getElementById("search-form");
const searchInput = searchForm.querySelector("input");
const suggestionsContainer = document.getElementById("suggestions-container");

// Ensure click handling for both search form and document works without conflicts
searchForm.addEventListener("click", (event) => {
    renderPlaceNames();
    searchForm.classList.add("expanded");
    suggestionsContainer.classList.remove("hidden");
    suggestionsContainer.classList.add("show");
    animateSuggestions();
    event.stopPropagation();
});

document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        searchInput.value = '';
        resetFormAndSuggestions();
    }
});

function animateSuggestions() {
    const suggestionLists = suggestionsContainer.querySelectorAll(".suggestions-list");
    suggestionLists.forEach((list, index) => {
        if (index < 10) {
            // Animate only the first 10 items
            requestAnimationFrame(() => {
                setTimeout(() => {
                    list.classList.add("animated");
                }, index * 100); // Stagger animations for first 10 items
            });
        } else {
            // Delay showing the rest by 3 seconds
            setTimeout(() => {
                list.classList.add("animated");
                list.style.opacity = '1';
                list.style.transform = 'translateX(0)'; // Reset any transform
            }, 1000);
        }
    });
}


// Function to reset form and hide suggestions
function resetFormAndSuggestions() {
    searchForm.classList.remove('expanded');
    suggestionsContainer.classList.remove('show');

    suggestionsContainer.innerHTML = '';
    setTimeout(() => {
        suggestionsContainer.classList.add('hidden');
    }, 300); // Animation duration


}

// Function to render place names dynamically
function renderPlaceNames() {
    const suggestionsContainer = document.querySelector(".suggestions-container");

    // Iterate through the global array
    window.dynamicEntities.forEach((entity) => {
        const suggestionList = document.createElement("div");
        suggestionList.className = "suggestions-list";

        const nameContainer = document.createElement("div");
        nameContainer.className = "suggestions-list-name";

        const placeName = document.createElement("h2");
        placeName.textContent = entity.name;

        nameContainer.appendChild(placeName);
        suggestionList.appendChild(nameContainer);

        suggestionList.addEventListener("click", () => {
            searchInput.value = '';
            clickSuggestion(entity);
        });

        suggestionsContainer.appendChild(suggestionList);
    });
}

function renderPlaceFilter(filterText = '') {
    const suggestionsContainer = document.querySelector('.suggestions-container');
    suggestionsContainer.innerHTML = ''; // Clear existing suggestions

    // Filter dynamicEntities based on filterText (case-insensitive)
    const filteredEntities = window.dynamicEntities.filter(entity =>
        entity.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredEntities.length === 0) {
        // If no results, show a "No results found" message
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'suggestions-list animated'; // Ensure animation applies
        noResultsMessage.textContent = 'No results found';
        suggestionsContainer.appendChild(noResultsMessage);
    } else {
        // Iterate through the filtered array
        filteredEntities.forEach((entity, index) => {
            const suggestionList = document.createElement('div');
            suggestionList.className = 'suggestions-list'; // Initially without the animated class

            const nameContainer = document.createElement('div');
            nameContainer.className = 'suggestions-list-name';

            const placeName = document.createElement('h2');
            placeName.textContent = entity.name;

            nameContainer.appendChild(placeName);
            suggestionList.appendChild(nameContainer);

            suggestionList.addEventListener('click', () => {
                searchInput.value = '';
                clickSuggestion(entity);
            });

            suggestionsContainer.appendChild(suggestionList);

            // Add animation class after a short delay for visibility
            setTimeout(() => {
                suggestionList.classList.add('animated');
            }, index * 50); // Optional stagger effect
        });
    }

    // Ensure the container is visible
    if (!suggestionsContainer.classList.contains('show')) {
        suggestionsContainer.classList.add('show');
    }
}

function clickSuggestion(entity) {

    fallBackCenterMenu();
    resetFormAndSuggestions();

    const searchForm = document.getElementById("search-form");
    const centerMenu = document.querySelector('.center-menu2');
    const centerCircleH3 = centerMenu.querySelector('.center-circle2 h3');

    searchForm.style.display = 'none';
    centerCircleH3.textContent = entity.name;
    centerMenu.classList.remove('hidden');
    setNavigationCoordinates(entity.latitude, entity.longitude);
    // startTrackingDestination(entity.latitude, entity.longitude)
    unhideExitNav();
}

searchInput.addEventListener('input', (event) => {
    const searchText = event.target.value;
    setTimeout(() => { // Small delay for better UX
        renderPlaceFilter(searchText);
    }, 0);
});

// Function to show debug messages in the div
function showDebugMessage(message) {
    const debugDiv = document.getElementById("debug-message");
    debugDiv.innerText = message; // Set the message text
    debugDiv.style.display = "block"; // Make the div visible
    debugDiv.style.opacity = "1"; // Fade-in effect
}

// Function to hide the debug message
function hideDebugMessage() {
    const debugDiv = document.getElementById("debug-message");
    debugDiv.style.opacity = "0"; // Fade-out effect
    setTimeout(() => {
        debugDiv.style.display = "none"; // Hide after fade-out
    }, 500); // Match this timeout with the CSS transition duration
}

// Function to update the latitude and longitude display
function updateLocationDisplay(latitude, longitude) {
    document.getElementById('userLocation').innerText = 'Your Location: \n Latitude: ' + latitude.toFixed(6) + '\n' + 'Longitude: ' + longitude.toFixed(6);

    // Get the latitude and longitude of the object
    var entity = document.getElementById('entity');
    if (entity) {
        var objectLatLng = entity.getAttribute('gps-entity-place');
        if (objectLatLng) {
            var objectLatitude = parseFloat(objectLatLng.latitude);
            var objectLongitude = parseFloat(objectLatLng.longitude);
            document.getElementById('objectLocation').innerText = 'Object Location: \n Latitude: ' + objectLatitude.toFixed(6) + '\n' + 'Longitude: ' + objectLongitude.toFixed(6);
        }
    }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Function to clear the virtual space and its entities
function clearVirtualSpace() {
    const virtualSpace = document.querySelector('#virtual-space');
    // const scene = document.querySelector('a-scene');

    // Hide virtual space
    virtualSpace.setAttribute('visible', false);


}

// Example function to show the cancel button with a fade effect
function showCancelButton() {
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.style.display = 'flex'; // Ensure it's visible
    setTimeout(() => {
        cancelButton.style.opacity = '1'; // Start the fade-in effect
    }, 10); // Small delay to allow the display change to take effect
}

// Example function to hide the cancel button with fade-out effect
function hideCancelButton() {
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.style.opacity = '0'; // Fade out the button
    setTimeout(() => {
        cancelButton.style.display = 'none'; // Hide it after the fade-out
    }, 500); // Match the duration of the fade-out (in this case, 0.5s)
}


function resetAnimation(notification) {
    // Remove the current animation
    notification.style.animation = 'none';

    // Force reflow to reset the animation state
    void notification.offsetWidth;

    // Reapply the animation
    notification.style.animation = '';
}

function clearEnvEvent(btnContent) {
    btnContent.removeEventListener("click", handleExitEnv);
}

function handleExitEnv() {
    hideExitEnv();
    clearVirtualSpace();
    stopAndResetImageRotation()
    slideInNotification();

}

function unhideExitEnv() {
    const btnContent = document.querySelector('.btn-content2');
    btnContent.classList.remove('hidden');
    btnContent.classList.add('slide-in-left');

    //resetAnimation(notification);
    // Add the event listener
    btnContent.addEventListener("click", handleExitEnv);
}

function unhideEventBtn() {
    const eventBtn = document.querySelector('.btn-events');
    eventBtn.classList.remove('hidden');
    eventBtn.classList.add('slide-in-left');

    //Here is the problem future haziq
    eventBtn.addEventListener("click", handleShowEvents);
}

function handleShowEvents(){
    ShowAllEvents();
}

function ShowAllEvents() {
    const events = document.querySelector('.event-slider-container');
    const overlay = document.querySelector('.overlay');

    // Fetch and render events for the current entity
    if (currentEntityName) {
        fetchAndRenderEventsByLocation(currentEntityName);
    } else {
        console.warn('No current entity selected to fetch events for.');
        return;
    }

    // Show the events container and overlay
    events.classList.remove('hidden');
    overlay.classList.remove('hidden');

    // Add event listener to hide events when clicking the overlay
    overlay.addEventListener("click", hideAllEvents);
}


function hideAllEvents() {
    const events = document.querySelector('.event-slider-container');
    const overlay = document.querySelector('.overlay');

    // Hide the events container and overlay
    events.classList.add('hidden');
    overlay.classList.add('hidden');
}


function slideOutNotification() {
    const notification = document.querySelector('.notification-container');

    // Reset animation classes
    notification.classList.remove('slide-in-left');
    //resetAnimation(notification);

    // Add slide-out animation
    notification.classList.add('slide-out-left');
}

function slideInNotification(entityname) {
    const notification = document.querySelector('.notification-container');

    // Reset animation classes
    notification.classList.remove('slide-out-left');
    //resetAnimation(notification);

    // Add slide-in animation
    notification.classList.add('slide-in-left');
}

function hideEventBtn() {
    const btnContent = document.querySelector('.btn-events');
    btnContent.classList.add('slide-out-left');
    btnContent.classList.add('hidden');
    clearEnvEvent(btnContent);
}

function hideExitEnv() {
    const btnContent = document.querySelector('.btn-content2');
    btnContent.classList.add('slide-out-left');
    btnContent.classList.add('hidden');
    clearEnvEvent(btnContent);
    hideEventBtn();
}

let currentEntityName = "";
let CurrentEntityID = null; // Global variable to store the current entity ID

// Function to check proximity and retrieve the Environment Model
function checkProximity(userLat, userLon, entities, radius) {
    let isNearAnyEntity = false;

    entities.forEach(entity => {
        const distance = calculateDistance(userLat, userLon, entity.latitude, entity.longitude);
        if (distance <= radius) {
            isNearAnyEntity = true;

            currentEntityName = entity.name;
            CurrentEntityID = getIDBasedOnNames(currentEntityName, entities); // Set CurrentEntityID globally
            showNotification(entity.name);
        }
    });

    // Hide the center menu if the user is not near any entity
    if (!isNearAnyEntity) {
        CurrentEntityID = null; // Reset CurrentEntityID if no entity is near
        hideNotification();
    }
}

// Function to get the ID based on the name
function getIDBasedOnNames(entityName, entities) {
    let entityID = null; // Declare `entityID`

    // Iterate through entities to find the matching name
    entities.forEach(entity => {
        if (entity.name === entityName) {
            entityID = String(entity.id); // Explicitly convert the ID to a string
        }
    });

    return entityID; // Return the found ID or null if not found
}

function showNotification(entityname) {
    const notification = document.querySelector('.notification-container');
    const locationName = document.querySelector('.notification-box h1');
    locationName.textContent = entityname;
    notification.classList.remove('hide-notification'); // Remove fade-out class
    notification.classList.add('show-notification'); // Add fade-in class
    notification.style.display = 'flex'; // Ensure it's visible

    notification.addEventListener('click', handleNotificationClick);
}

function debugVirtualSpaceState() {
    const virtualSpace = document.querySelector('#virtual-space');
    const camera = document.querySelector('a-camera[gps-camera]');
    const cameraWorldPosition = new THREE.Vector3();
    camera.object3D.getWorldPosition(cameraWorldPosition);


    //const debugInfo = `Current entity name:${currentEntityName}`;
    // Display debugging information
    showDebugMessage(debugInfo);
}

function handleNotificationClick() {
    const virtualSpace = document.querySelector('#virtual-space');
    unhideExitEnv();
    unhideEventBtn();
    slideOutNotification();
    //virtualSpace.setAttribute('visible', true);
    // showEntityInformation(currentEntityID);S
    showEntityInformation(currentEntityName);
    showEventImagesForLocation(currentEntityName);
    virtualSpace.setAttribute('follow-camera', '');
    virtualSpace.setAttribute('position', '0 1.6 -5');
    debugVirtualSpaceState();
    
}


function hideNotification() {
    const notification = document.querySelector('.notification-container');
    notification.classList.remove('show-notification'); // Remove fade-in class
    notification.classList.add('hide-notification'); // Add fade-out class

    // Ensure the element is hidden after the animation ends
    notification.addEventListener('animationend', () => {
        notification.style.display = 'none'; // Hide after animation ends
    }, { once: true });
}


const cancelButton = document.getElementById('cancel-button');
cancelButton.addEventListener('click', function () {
    const virtualSpace = document.querySelector('#virtual-space');

    // Hide the cancel button
    hideCancelButton();

    // Hide virtual space
    virtualSpace.setAttribute('visible', false);

    clearVirtualSpace()

    refreshEntities();

    // Show the search form again
    const searchForm = document.getElementById('search-form');
    searchForm.style.display = 'block'; // Ensure the form is visible

});

// Clear entities and re-fetch/render them
function refreshEntities() {
    fetchAndRenderEntities(); // Fetch and re-render entities from the database
}

function clearSceneEntities() {
    const scene = document.querySelector('a-scene');

    // Select all entities with the class 'dynamic-entity'
    const dynamicEntities = scene.querySelectorAll('.location-entity');

    // Loop through all dynamically created entities and remove them
    dynamicEntities.forEach((entity) => {
        const entityId = entity.getAttribute('data-entity-id');
        console.log(`Removing entity with ID: ${entityId}`); // Log which entity is being removed
        entity.parentNode.removeChild(entity); // Remove each dynamic entity
    });

    console.log("Cleared all dynamic entities.");
}

// function showProximityMessage(message) {
//     const virtualSpace = document.querySelector('#virtual-space');
//     const proximityDiv = document.getElementById("proximity-message");
//     const searchForm = document.getElementById("search-form");

//     // Display and update the proximity message
//     proximityDiv.innerText = message;
//     proximityDiv.style.display = "block";
//     proximityDiv.style.opacity = "1"; // Fade-in effect

//     showNotification(message);

//     // Add event listener if not already added
//     if (!centerMenu.dataset.listener) {
//         centerMenu.addEventListener('click', function () {
//             hideProximityMessage();
//             searchForm.style.display = "none";
//             showCancelButton();
//             virtualSpace.setAttribute('visible', true);
//             virtualSpace.setAttribute('follow-camera', '');
//             clearSceneEntities();
//             showDebugMessage(`You are viewing ${message} AR environment`);
//         });

//         // Mark the listener as added
//         centerMenu.dataset.listener = 'true';
//     }
// }

// // Function to hide the proximity message
// function hideProximityMessage() {
//     const proximityDiv = document.getElementById("proximity-message");
//     proximityDiv.style.opacity = "0"; // Fade-out effect\
//     hideNotification();
//     setTimeout(() => {
//         proximityDiv.style.display = "none";
//     }, 500); // Match this timeout with the CSS transition duration

// }



// Function to show the plane and change the images
let currentIndex = 0;
function showImagePlane() {
    const plane = document.getElementById("image-plane");
    const camera = document.getElementById("camera");
    const currentEntity = window.dynamicEntities[10]; // For example, take the first entity

    if (currentEntity && currentEntity.eventImageLinks.length > 0) {
        const images = currentEntity.eventImageLinks;
        plane.setAttribute("visible", "true");

        // Set the first image
        plane.setAttribute("src", images[currentIndex]);

        // Loop through images
        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            plane.setAttribute("src", images[currentIndex]);
        }, 3000); // Transition every 3 seconds
    }
}



function showEnvironmentModel(userLat, userLon, entity) {
    // Find the AR scene
    const scene = document.querySelector('a-scene');

    // Create a new entity for the environment model
    const environmentEntity = document.createElement('a-entity');
    environmentEntity.setAttribute('gps-entity-place', `latitude: ${userLat}; longitude: ${userLon}`);
    environmentEntity.setAttribute('gltf-model', '#f315Scene'); // Use the provided model
    environmentEntity.setAttribute('scale', '400 400 400'); // Default scale, can be adjusted as needed
    environmentEntity.setAttribute('look-at', '[gps-camera]'); // Always face the camera

    // Optionally, add animation or other attributes
    environmentEntity.setAttribute('animation-mixer', 'clip: *'); // Optional animation

    // Append the environment entity to the scene
    scene.appendChild(environmentEntity);

    // Log the correct model name for debugging
    //showDebugMessage(`Entity created at coordinates: Latitude: ${userLat}, Longitude: ${userLon}, Model: ${entity.model}`);
}


document.addEventListener('DOMContentLoaded', () => {
    const arScene = document.querySelector('a-scene');
    
    // Wait for the AR scene to load
    arScene.addEventListener('loaded', () => {
        // Locate the default VR button
        const vrButton = document.querySelector('.a-enter-vr');
        
        if (vrButton) {
            // Remove existing event listeners (if any)
            const newButton = vrButton.cloneNode(true);
            vrButton.parentNode.replaceChild(newButton, vrButton);

            // Add custom behavior
            newButton.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the default VR mode behavior
                window.location.href = 'VirtualView.html'; // Redirect to your desired page
            });

            console.log('VR button customized for redirection.');
        } else {
            console.error('VR button not found. Ensure the AR scene is set up correctly.');
        }
    });
});