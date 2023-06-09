export function displayMap(locations){
	mapboxgl.accessToken = 'pk.eyJ1IjoibHVjZW50LXJhaSIsImEiOiJjbGhuN3B1bXAxamZuM21waGI5OG5jbGlvIn0.Xef5oLU5PiFGXsaSLyzuZQ';
	var map = new mapboxgl.Map({
		container: 'map',	// tag with id 'map' is selected
		style: 'mapbox://styles/lucent-rai/clhn7vmho01oa01pr9qq98jy5',
		scrollZoom: false
		// interactive: false,
	});

	const bounds = new mapboxgl.LngLatBounds();

	locations.forEach(location => {
		// Create Marker
		const element = document.createElement('div');
		element.className = 'marker';

		// Add Market
		new mapboxgl.Marker({
			element,
			anchor: 'bottom'
		})
			.setLngLat(location.coordinates)
			.addTo(map);

		// Add popup
		new mapboxgl.Popup({
			offset: 30
		})
		.setLngLat(location.coordinates)
		.setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
		.addTo(map);

		// Extends map bounds to include current location
		bounds.extend(location.coordinates);
	});

	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 150,
			left: 100,
			right: 100
		}
	});
}