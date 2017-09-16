const wiki = require('wikijs').default;

const wikipedia = wiki({ apiUrl: 'https://el.wikipedia.org/w/api.php' });

const search = query => wikipedia.search(query);

const info = pageId => Promise.all([
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
  url: page.raw.fullurl,
  summary, 
  info, 
  images, 
  coordinates, 
}));
  
const geosearch = (lat, lon, radius = 1000) => wikipedia.geoSearch(lat, lon, radius)
.then((pois) => Promise.all(pois.map(poi => info(poi)))); 

module.exports = {
  search,
  geosearch,
  info,
};


