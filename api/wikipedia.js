const wiki = require('wikijs').default;

const wikipedia = wiki({ apiUrl: 'https://el.wikipedia.org/w/api.php' });

const fetchPage = pageId => Promise.all([
  wikipedia.page(pageId).then(page => page),
  wikipedia.page(pageId).then(page => page.summary()),
  wikipedia.page(pageId).then(page => page.info()),
  wikipedia.page(pageId).then(page => page.images()),
  wikipedia.page(pageId).then(page => page.coordinates()),
])
.then(([
  page,
  summary, 
  info, 
  images, 
  coordinates, 
]) => ({
  title: page.raw.title,
  id: page.raw.title,
  url: page.raw.fullurl,
  summary, 
  info, 
  images, 
  location: {
    type: 'Point',
    coordinates: [coordinates.lon, coordinates.lat],
  },
}));
  
const geosearch = (lat, lon, radius = 1000) => wikipedia.geoSearch(lat, lon, radius);

module.exports = {
  geosearch,
  fetchPage,
};

