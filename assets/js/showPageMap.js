mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: site.geometry.coordinates,
    zoom: 9
});

// Create a new marker.
const marker = new mapboxgl.Marker()
    .setLngLat(site.geometry.coordinates)
    .addTo(map);