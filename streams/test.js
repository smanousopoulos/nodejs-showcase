const util = require('util');
const { Readable } = require('stream');

const examplePOI = {
  title: 'Test',
  url: null, 
  images: [],
  info: {},
  summary: 'test',
  coordinates: {
    lon: 23.7459,
    lat: 37.9849,
  },
  icon: null,
  id: 'id',
};

const TestStream = function(count, interval, xDiff, yDiff) {
  Readable.call(this);
  this.counter = count;
  this.total = count;
  this.interval = interval;
  this.xDiff = xDiff;
  this.yDiff = yDiff;
};

util.inherits(TestStream, Readable);

TestStream.prototype._read = function(n) {
  setTimeout(() => {
    if (this.counter-- > 0) {
      this.push(JSON.stringify({ 
        ...examplePOI, 
        coordinates: { 
          lat: examplePOI.coordinates.lat + this.xDiff * (this.total - this.counter), 
          lon: examplePOI.coordinates.lon + this.yDiff * (this.total - this.counter), 
        } 
      }));
    } else {
      this.push(null);
    }
  }, this.interval);
};

module.exports = TestStream;


