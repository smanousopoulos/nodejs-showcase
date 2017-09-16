const fetch = require('isomorphic-fetch');

const key = 'AIzaSyA-xlsZjK45BPKbB2XMavxQWbC4CKMSeaA';

const geosearch = (lat, lon, radius = 1000) => fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=point_of_interest&key=${key}`)
.then(res => res.json())
.then(res => res.results.map(poi => ({
    title: poi.name,
    url: null, 
    images: [],
    info: {},
    summary: poi.name,
    coordinates: {
      lat: poi.geometry.location.lat,
      lon: poi.geometry.location.lng,
    },
    icon: poi.icon,
    id: poi.id,
})));

module.exports = {
  geosearch,
};
