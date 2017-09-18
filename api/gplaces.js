const fetch = require('isomorphic-fetch');

const key = require('./gplaces.key'); 

const geosearch = (lat, lon, radius = 1000, token = null) => {
  const baseuri = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${key}`;
  const uri = token ? `${baseuri}&pagetoken=${token}` : `${baseuri}&location=${lat},${lon}&radius=${radius}&type=point_of_interest`;

  return fetch(uri)
.then(res => res.json())
.then((res) => {
  if (res.status !== 'OK') { 
    throw res.status;
  }
  return res;
});
}

const transformPOI = poi => ({
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
});

module.exports = {
  geosearch,
  transformPOI,
};
