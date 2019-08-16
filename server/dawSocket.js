const ws = require('ws');

const DawSocket = function(socket) {
  this.socket = socket;
  this.socket.on('message', (message) => {
    console.log(message);
  });
  this.sendNameUpdate = (oldName, newName) => {
    this.socket.send(JSON.stringify({ rename: [oldName, newName ]}));
  };
};

const wss = new ws.Server({
  port: 3001
});

wss.on('listening', () => {
  console.log(`Synth WebSocket Server connected on port 3001`);
});

wss.on('connection', (ws) => {
  console.log(ws.protocol);
  console.log('Handshake completed, daw socket created');
  wss.dawSocket = new DawSocket(ws);
});
  
module.exports = wss;
