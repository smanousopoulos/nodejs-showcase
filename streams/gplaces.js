const util = require('util');
const { Readable } = require('stream');

const { geosearch, transformPOI } = require('../api/gplaces');

const GPlacesStream = function(lat, lon, radius = 1000) {
  Readable.call(this);
  this.lat = lat;
  this.lon = lon;
  this.radius = radius;
  this.page = 0;
  this.started = false;
  this.hasMore = true;
  this.token = null;
};

util.inherits(GPlacesStream, Readable);

GPlacesStream.prototype._read = function(n) {
  const self = this;
  if (!this.started) {
    this.started = true;
      geosearch(this.lat, this.lon, this.radius, this.token)
      .then((res) => {
        if (res.next_page_token) {
          self.token = res.next_page_token;
        } else {
          self.hasMore = false;
        }
        return res.results.map(r => transformPOI(r));;
      })
      .then((pois) => {
        self.pages = pois.length;
        pois.forEach((poi, i) => {
            this.push(JSON.stringify(poi));  
            //if (!self.hasMore && (self.page === self.pages - 1)) {
            if (self.page === self.pages - 1) {
              this.push(null);
            }
            self.page++;
        });
      })
      .catch((err) => {
        console.error('geosearch error', err);
        self.hasMore = false;
        self.push(null);
      });
    } 
};

module.exports = GPlacesStream;

