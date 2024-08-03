document.getElementById('getDirectionsBtn').addEventListener('click', async () => {
    const startAddress = document.getElementById('start').value.trim();
    const destinationAddress = document.getElementById('destination').value.trim();

    if (!startAddress || !destinationAddress) {
        document.getElementById('directionsResult').innerText = 'Please enter both start and destination addresses.';
        return;
    }

    try {
        const startCoordinates = await geocodeAddress(startAddress);
        const destinationCoordinates = await geocodeAddress(destinationAddress);

        const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?start=${startCoordinates.lng},${startCoordinates.lat}&end=${destinationCoordinates.lng},${destinationCoordinates.lat}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENROUTESERVICE_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        displayDirections(data);

    } catch (error) {
        console.error('Error fetching directions:', error);
        document.getElementById('directionsResult').innerText = 'Error fetching directions. Please try again.';
    }
});

// Function to geocode an address to coordinates
async function geocodeAddress(address) {
    const response = await fetch(`https://api.openrouteservice.org/geocode/search?text=${encodeURIComponent(address)}&api_key=${OPENROUTESERVICE_API_KEY}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${OPENROUTESERVICE_API_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.features.length) {
        throw new Error('No results found for the address.');
    }
    const firstResult = data.features[0].geometry.coordinates;
    return { lng: firstResult[0], lat: firstResult[1] };
}

// Function to display directions on the page
function displayDirections(data) {
    const directionsContainer = document.getElementById('directionsResult');
    const steps = data.features[0].properties.segments[0].steps;
    const directionsHtml = steps.map(step => `
        <p style="font-weight: bold; color: #333;">${step.instruction} (${Math.round(step.distance)} meters, ${Math.round(step.duration / 60)} minutes)</p>
    `).join('');
    directionsContainer.innerHTML = `<h2>Directions:</h2>${directionsHtml}`;
}
