const wiki = require('wikijs').default;

const wikipedia = wiki({ apiUrl: 'https://en.wikipedia.org/w/api.php' });

const WIKI_ICON = 'https://vignette.wikia.nocookie.net/deusex/images/9/96/Wikipedia-logo-v2.svg.png/revision/latest/scale-to-width-down/525?cb=20141229025848&path-prefix=en';

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
  icon: WIKI_ICON,
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

