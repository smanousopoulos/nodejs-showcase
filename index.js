const express = require('express');
const mustacheExpress = require('mustache-express');
const fs = require('fs');
const httpServer = require('http').Server;
const socketio = require('socket.io');
const ss = require('socket.io-stream');
const mergeStream = require('merge-stream');

const WikiStream = require('./streams/wikipedia');
const GPlacesStream = require('./streams/gplaces');

const app = express();
const server = httpServer(app);
const io = socketio(server);

const HOST = process.env.NODE_HOST || 'localhost';
const PORT = process.env.NODE_PORT || 3000;

io.of('/geosearch').on('connection', (socket) => {
  console.log('new client connected');
  
  socket.on('geosearch', (y, x, r) => {
    const mergedStream = mergeStream(
      new WikiStream(y, x, r),
      new GPlacesStream(y, x, r),
    );
                              
    const stream = ss.createStream();                              
    ss(socket).emit('poi', stream, {});
    mergedStream.pipe(stream);
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
