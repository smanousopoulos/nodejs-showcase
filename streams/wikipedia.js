const util = require('util');
const { Readable } = require('stream');

const { geosearch, fetchPage } = require('../api/wikipedia');

const WikiStream = function(lat, lon, radius = 1000) {
  Readable.call(this);
  this.lat = lat;
  this.lon = lon;
  this.radius = radius;
  this.page = 0;
  this.started = false;
};

util.inherits(WikiStream, Readable);

WikiStream.prototype._read = function(n) {
  const self = this;
  if (!self.started) {
    self.started = true;
    geosearch(this.lat, this.lon, this.radius)
    .then((pages) => {
      self.pages = pages.length;
      pages.forEach((page, i) => {
        fetchPage(page).then((poi) => {
          this.push(JSON.stringify(poi));  
          if (self.page === self.pages - 1) {
            this.push(null);
          }
          self.page++;
        })
        .catch((err) => {
          console.error('page error', err);
          if (self.page === self.pages - 1) {
            this.push(null);
          }
          self.page++;
        });
      });
    })
    .catch((err) => {
      console.error('geosearch error', err);
    });
  } 
};

module.exports = WikiStream;

