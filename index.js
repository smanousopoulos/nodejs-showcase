const express = require('express');
const mustacheExpress = require('mustache-express');
const fs = require('fs');

const wiki = require('./api/wikipedia');
const gmaps = require('./api/googlemaps');

const PORT = process.env.NODE_PORT || 3000;

express()
.engine('html', mustacheExpress())
.set('view engine', 'mustache')
.set('views', `${__dirname}/views`)
.use(express.static(`${__dirname}/public`))
.get('/', (req, res) => {
  res.render('index.html', { res: () => (1+1) });
})
.get('/geosearch', (req, res) => {
  if (!req.query.lat || !req.query.lon) {
    res.send('Please provide lat, lon query parameters');
  }
  gmaps.geosearch(req.query.lat, req.query.lon, req.query.radius)
  .then((gres) => {
    wiki.geosearch(req.query.lat, req.query.lon, req.query.radius)
    .then((wres) => {
      res.send({ status: 'ok', results: [...gres, ...wres] });
    })
    .catch((err) => {
      res.send(err);
    });
  })
  .catch((err) => {
    res.send(err);
  });
})
.listen(PORT, () => { console.log(`listening on port ${PORT}`); });
