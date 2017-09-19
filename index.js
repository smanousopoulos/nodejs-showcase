const express = require('express');
const mustacheExpress = require('mustache-express');
const fs = require('fs');
const httpServer = require('http').Server;
const socketio = require('socket.io');
const ss = require('socket.io-stream');
const mergeStream = require('merge-stream');
const { MongoClient } = require('mongodb');

const WikiStream = require('./streams/wikipedia');
const GPlacesStream = require('./streams/gplaces');

const app = express();
const server = httpServer(app);
const io = socketio(server);


const HOST = process.env.NODE_HOST || 'localhost';
const PORT = process.env.NODE_PORT || 3000;
const DBHOST = process.env.DB_HOST || 'localhost';
const DBPORT = process.env.DB_PORT || 27017;
const DB = 'pois';

const mongoURL = `mongodb://${DBHOST}:${DBPORT}/${DB}`;

MongoClient.connect(mongoURL, (err, db) => {
  if (err) {
    console.error('db error:', error);
    return;
  }
  console.log('connected to db');

  const collection = db.collection('pois');

  io.of('/geosearch').on('connection', (socket) => {
    console.log('new client connected');
    
    socket.on('geosearch', (y, x, r) => {
      
      const clientstream = ss.createStream();                              
      ss(socket).emit('poi', clientstream, {});
 
      // api streams to db      
      mergeStream(
        new WikiStream(y, x, r),
        new GPlacesStream(y, x, r),
      )
      .on('data', (chunk) => {
        const poi = JSON.parse(chunk.toString());
        
        collection.update(poi, poi, { upsert: true })
        .then((r) => {
          console.log('result', r.result);
        })
        .catch((err) => { console.error(err); });
      })
      .on('end', () => {
        console.log('stream ended');
      });
      
      // stream from db to client 
      collection.find({ 'location' : { 
        $near : { 
          $geometry: { type: 'Point', coordinates: [x, y] }, 
          $maxDistance: r,
        }} 
      })
      .stream({ transform: doc => JSON.stringify(doc)})
      .pipe(clientstream);
    });

    socket.on('disconnect', () => {
      console.log('client disconnected');
    });
  });


  app
  .engine('html', mustacheExpress())
  .set('view engine', 'mustache')
  .set('views', `${__dirname}/views`)
  .use(express.static(`${__dirname}/public`))
  .get('/', (req, res) => {
    res.render('index.html', { res: () => (1+1) });
  });

  server.listen(PORT, HOST, () => { console.log(`listening on port ${PORT}`); });
});
