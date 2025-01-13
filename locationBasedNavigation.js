// Your Mapbox Token Specifically for UM.AR domain
const MAPBOX_TOKEN = 'sk.eyJ1IjoiaGF6aXFodWR6YWlyeTAyIiwiYSI6ImNtM3VvYzduZDBqazgyanIzOTdibXM1c3IifQ.IRA9AZlLo-eF9uXsQkzdmg';


let start = []; // User's coordinates
let end = [];   // Destination coordinates

function setNavigationCoordinates(destinationLatitude, destinationLongitude) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;
            start = [userLatitude, userLongitude];
            end = [destinationLatitude, destinationLongitude];

            // Format debug message
            const debugMessage = `Start Coordinates (User): ${start.join(', ')}\nEnd Coordinates (Destination): ${end.join(', ')}`;

            // Call showDebugMessage with the formatted message
            //showDebugMessage(debugMessage);
            renderRoute();

            // Optionally perform additional actions, like fetching routes or updating UI
        },
        (error) => {
            console.error(`Error getting user's location: ${error.message}`);
        }
    );
}

function startTrackingDestination(destinationLatitude, destinationLongitude) {
    navigator.geolocation.watchPosition(
        (position) => {
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;

            start = [userLatitude, userLongitude];
            end = [destinationLatitude, destinationLongitude];

            // Fetch and display updated route and directions
            fetchTurnByTurnDirections(start, end);
        },
        (error) => {
            console.error("Error tracking user's location:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 } // High accuracy for real-time tracking
    );
}

async function fetchTurnByTurnDirections(start, end) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const steps = route.legs[0].steps;
            const totalDistance = (route.legs[0].distance / 1000).toFixed(2); // Distance in km
            const totalTime = (route.legs[0].duration / 60).toFixed(0); // Time in minutes

            displayDirections(steps);
            //displaySummary(totalDistance, totalTime); // Update summary dynamically
        } else {
            console.error("No route found.");
        }
    } catch (error) {
        console.error('Error fetching route:', error);
    }
}

function displaySummary(distance, time) {
    const summaryContainer = document.getElementById("summary-container");
    summaryContainer.innerHTML = `
        <p>Total Distance: ${distance} km</p>
        <p>Estimated Time: ${time} min</p>
    `;
}

// Function to display the turn-by-turn instructions
function displayDirections(steps) {
    const directionsContainer = document.getElementById("directions-container");
    directionsContainer.innerHTML = ''; // Clear any existing directions

    steps.forEach((step, index) => {
        const instruction = step.maneuver.instruction;
        const distance = step.distance; // Distance for this step
        const time = step.duration; // Duration for this step (in seconds)

        // Create a new element for the instruction and append to the container
        const stepElement = document.createElement('div');
        stepElement.className = "direction-step";
        stepElement.innerHTML = `
        <p>Step ${index + 1}: ${instruction}</p>
        <p>Distance: ${(distance / 1000).toFixed(2)} km</p>
        <p>Time: ${(time / 60).toFixed(0)} min</p>
    `;
        directionsContainer.appendChild(stepElement);
    });
}


// Fetch route data from Mapbox Directions API
async function fetchRoute(start, end) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            return data.routes[0].geometry.coordinates; // Array of waypoints
        } else {
            console.error("No route found.");
            return [];
        }
    } catch (error) {
        console.error('Error fetching route:', error);
        return [];
    }
}

// Function to interpolate points along the polyline
function densifyPolyline(polyline, interval) {
    const points = [];
    for (let i = 0; i < polyline.length - 1; i++) {
        const [lon1, lat1] = polyline[i];
        const [lon2, lat2] = polyline[i + 1];
        const segmentPoints = interpolatePoints(lat1, lon1, lat2, lon2, interval); // 1 meter interval
        points.push(...segmentPoints);
    }
    return points;
}

// Helper function to interpolate points
function interpolatePoints(lat1, lon1, lat2, lon2, interval) {
    const points = [];
    const R = 6371e3; // Earth’s radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    const steps = Math.ceil(distance / interval); // Number of markers
    for (let i = 0; i <= steps; i++) {
        const fraction = i / steps;
        const lat = lat1 + (lat2 - lat1) * fraction;
        const lon = lon1 + (lon2 - lon1) * fraction;
        points.push([lon, lat]);
    }
    return points;
}

function clearMemory() {
    start = [];
    end = [];
    // Clear other global arrays or references if necessary
}

function clearMarkers() {
    const scene = document.querySelector('a-scene');
    scene.querySelectorAll('.route-marker-wrapper, .route-marker').forEach((marker) => {
        marker.parentNode.removeChild(marker);
    });
    clearMemory();
}

// Render AR markers for the densified route
async function renderRoute() {
    clearMarkers(); // Clear existing markers for the route

    const route = await fetchRoute(start, end); // Fetch route
    if (!route || route.length === 0) return;

    const densifiedPoints = densifyPolyline(route, 2); // Densify polyline

    // Render markers with jumping animation using a wrapper entity
    densifiedPoints.forEach(([lon, lat], index) => {
        // Wrapper entity to animate
        const wrapper = document.createElement('a-entity');
        wrapper.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lon}`);
        wrapper.classList.add('route-marker-wrapper'); // Add a unique class

        // Create the actual marker as a child of the wrapper
        const marker = document.createElement('a-entity');
        marker.setAttribute('geometry', 'primitive: cylinder; radius: 0.5; height: 0.5');
        marker.setAttribute('material', 'color: red');
        marker.setAttribute('scale', '0.5 0.5 0.5');
        marker.setAttribute('look-at', '[gps-camera]');
        marker.classList.add('route-marker'); // Add a unique class

        // Append the marker to the wrapper
        wrapper.appendChild(marker);

        marker.setAttribute('animation__scale', `
            property: scale;
            dir: alternate;
            dur: 2500;
            easing: easeInOutSine;
            loop: true;
            to: 0.5 1 0.5;
            delay: ${index * 200};
        `);
        marker.setAttribute('animation__color', `
            property: material.color;
            dir: alternate;
            dur: 2500;
            easing: easeInOutSine;
            loop: true;
            to: yellow;
            delay: ${index * 200};
        `);

        // Append the wrapper to the scene
        document.querySelector('a-scene').appendChild(wrapper);
    });
    // Add Start Marker
    const [startLon, startLat] = route[0];
    const startMarker = document.createElement('a-entity');
    startMarker.setAttribute('gps-entity-place', `latitude: ${startLat}; longitude: ${startLon}`);
    startMarker.setAttribute('geometry', 'primitive: cylinder; radius: 0.6; height: 0.7');
    startMarker.setAttribute('material', 'color: blue');
    startMarker.setAttribute('scale', '1 1 1'); // Adjust scale if needed
    startMarker.classList.add('route-marker'); // Add a unique class
    document.querySelector('a-scene').appendChild(startMarker);


    const [endLon, endLat] = route[route.length - 1];
    const endMarker = document.createElement('a-entity');
    endMarker.setAttribute('gps-entity-place', `latitude: ${endLat}; longitude: ${endLon}`);
    endMarker.setAttribute('gltf-model', '#locationPinDestination'); // Reference to the asset item ID
    endMarker.setAttribute('scale', '4 4 4'); // Adjust scale if needed
    endMarker.setAttribute('animation-mixer', ''); // Ensures the animation in the GLB plays
    endMarker.classList.add('route-marker'); // Add a unique class
    document.querySelector('a-scene').appendChild(endMarker);
}

// Call the render function after the scene is loaded
document.querySelector('a-scene').addEventListener('loaded', function () {
    renderRoute(); // Render route markers
});






const arScene = document.getElementById("ar-scene");
const sceneRect = arScene.getBoundingClientRect();

const cameraComponent = document.querySelector('a-camera').components.camera;
const fov = cameraComponent ? cameraComponent.camera.fov : 'Not Found';
const aspectRatio = cameraComponent ? cameraComponent.camera.aspect : 'Not Found';

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;