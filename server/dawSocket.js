const ws = require('ws');

const DawSocket = (socket) => {
  this.socket = socket;
  this.socket.on('message', (message) => {
    console.log(message);
  });
  this.sendNameUpdate = (oldName, newName) => {
    this.socket.send({ rename: [oldName, newName ]});
  };
};

const wss = new ws.Server({
  port: 3001
}, () => {
  console.log(`WebSocket Server connected on port ${wss.port}`);
  wss.on('connection', (socket) => {
    wss.dawSocket = new DawSocket(socket);
  });
});

module.exports = DawSocket;
