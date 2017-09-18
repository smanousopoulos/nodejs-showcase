const util = require('util');
const { Readable } = require('stream');

const { geosearch, transformPOI } = require('../api/gplaces');

const GPlacesStream = function(lat, lon, radius = 1000) {
  Readable.call(this);
  this.lat = lat;
  this.lon = lon;
  this.radius = radius;
  this.token = null;
  this.runLock = false;
  this.hasMore = false;
}
util.inherits(GPlacesStream, Readable);

// need to delay execution before asking for next page
GPlacesStream.prototype.fetch = (lat, lon, radius, token) => new Promise((res, rej) => { 
  setTimeout(() => {
    return res(geosearch(lat, lon, radius, token));
  }, token ? 2000 : 1);
});


GPlacesStream.prototype._read = function(n) {
  if (!this.runLock) {
    this.runLock = true;
    
    this.fetch(this.lat, this.lon, this.radius, this.token)
    .then((res) => {
      if (res && res.status === 'OK') {
        if (res.next_page_token) {
          this.hasMore = true;
          this.token = res.next_page_token;
        } else {
          this.hasMore = false;
          this.token = null;
        }
        return res.results.map(r => transformPOI(r));;
      } 
    })
    .then((pois) => {
      pois.forEach((poi, i) => {
        this.push(JSON.stringify(poi));  

        //unlock when 1 before last
        if (i === pois.length - 2 && this.hasMore) {
          this.runLock = false;
        }
           
        if (i === pois.length - 1 && !this.hasMore) {
          this.push(null);
        }
      });
    })
    .catch((err) => {
      console.error('GPlacesStream error:', err);
      this.push(null);
    });
  }
};

module.exports = GPlacesStream;

