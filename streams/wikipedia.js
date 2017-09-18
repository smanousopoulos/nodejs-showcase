const util = require('util');
const { Readable } = require('stream');

const { geosearch, fetchPage } = require('../api/wikipedia');

const WikiStream = function(lat, lon, radius = 1000) {
  Readable.call(this);
  this.lat = lat;
  this.lon = lon;
  this.radius = radius;
  this.page = 0;
  this.runLock = false;
};

util.inherits(WikiStream, Readable);

WikiStream.prototype._read = function(n) {
  if (!this.runLock) {
    this.runLock = true;
    geosearch(this.lat, this.lon, this.radius)
    .then((pages) => {
      this.pages = pages.length;
      pages.forEach((page, i) => {
        fetchPage(page).then((poi) => {
          this.push(JSON.stringify(poi));  
          if (this.page === this.pages - 1) {
            this.push(null);
          }
          this.page++;
        })
        .catch((err) => {
          console.error('WikiStream page error:', err);
          if (this.page === this.pages - 1) {
            this.push(null);
          }
          this.page++;
        });
      });
    })
    .catch((err) => {
      console.error('WikiStream error:', err);
    });
  } 
};

module.exports = WikiStream;

