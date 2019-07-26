const ws = require('ws');

const wss = new ws.Server({
  port: 3001
}, () => {
  console.log(`WebSocket Server connected on port ${wss.port}`);
  wss.on('connection', (connection) => {
    connection.on('message', (message) => {
      console.log(message);
    });
  });
});

module.exports = wss;
