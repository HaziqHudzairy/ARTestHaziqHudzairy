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
            console.error("Error getting user's location:", error);
        }
    );
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

function clearMarkers() {
    const scene = document.querySelector('a-scene');

    // Select and remove all route markers and wrappers (including start/end labels)
    scene.querySelectorAll('.route-marker-wrapper, .route-marker').forEach((marker) => {
        marker.parentNode.removeChild(marker);
    });
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
        marker.setAttribute('geometry', 'primitive: box; depth: 1; height: 0.5; width: 0.2');
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
    // Add Start and End labels
    const [startLon, startLat] = route[0];
    const startLabel = document.createElement('a-text');
    startLabel.setAttribute('value', 'Start');
    startLabel.setAttribute('gps-entity-place', `latitude: ${startLat}; longitude: ${startLon}`);
    startLabel.setAttribute('color', 'white');
    startLabel.setAttribute('scale', '10 10 10');
    startLabel.classList.add('route-marker'); // Add a unique class
    document.querySelector('a-scene').appendChild(startLabel);

    const [endLon, endLat] = route[route.length - 1];
    const endLabel = document.createElement('a-text');
    endLabel.setAttribute('value', 'End');
    endLabel.setAttribute('gps-entity-place', `latitude: ${endLat}; longitude: ${endLon}`);
    endLabel.setAttribute('color', 'white');
    endLabel.setAttribute('scale', '10 10 10');
    endLabel.classList.add('route-marker'); // Add a unique class
    document.querySelector('a-scene').appendChild(endLabel);
}

// Call the render function after the scene is loaded
document.querySelector('a-scene').addEventListener('loaded', function () {
    renderRoute(); // Render route markers
});

async function fetchTurnByTurnDirections(start, end) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            // Extract the steps from the route response
            const steps = data.routes[0].legs[0].steps;
            displayDirections(steps);  // Call function to display instructions
        } else {
            console.error("No route found.");
        }
    } catch (error) {
        console.error('Error fetching route:', error);
    }
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


const arScene = document.getElementById("ar-scene");
const sceneRect = arScene.getBoundingClientRect();

const cameraComponent = document.querySelector('a-camera').components.camera;
const fov = cameraComponent ? cameraComponent.camera.fov : 'Not Found';
const aspectRatio = cameraComponent ? cameraComponent.camera.aspect : 'Not Found';

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;