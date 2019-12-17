const WebSocket = require('ws');
const middle = new WebSocket.Server({ port: 8000 });

let clientToMiddleWs = [];
let middleToServerWs = [];
let ips = [''];

middle.on('connection', function connection(fromClientWs, req) {

  if (ips.indexOf(req.url.substr(7)) == -1) {
    ips.push(req.url.substr(7));
    
    var toServerWs = new WebSocket(req.url.substr(7));
    clientToMiddleWs[clientToMiddleWs.length] = fromClientWs;
    middleToServerWs[middleToServerWs.length] = toServerWs;
    console.log('setup websocket proxy connection for: %s', req.url.substr(7));
  
    toServerWs.on('open', function open() {
      console.log('took fucking long enough!');
    
      clientToMiddleEvents();
      middleToServerEvents();
    });
  } else {
    console.log('already have session for current ip');
    console.log('ips: ' + ips);
  }
    
  // fromClientWs.on('message', function incoming(data) {
  //   console.log('recieved data from client: \'' + data + '\' for server ip: ' + toServerWs.url);
  //   console.log('attempting to forward data to intended server...');
  //   toServerWs.send(data);
  // });
  // toServerWs.on('message', function incoming(data) {
  //   console.log('recieved data from server: \'' + data + '\' for client 0');
  //   console.log('attempting to forward to client ip');
  //   fromClientWs.send(data);
  // });
});

function clientToMiddleEvents() {
  for (let i = 0; i < clientToMiddleWs.length; i++) {
    clientToMiddleWs[i].on('message', function incoming(data) {
      console.log('recieved data from client: \'' + data + '\' for server ip: ' + middleToServerWs[i].url);
      console.log('attempting to forward data to intended server...');
      middleToServerWs[i].send(data);
    });
  }
}

function middleToServerEvents() {
  for (let j = 0; j < middleToServerWs.length; j++) {
    middleToServerWs[j].on('message', function incoming(data) {
      console.log('recieved data from server: \'' + data + '\' for client 0');
      console.log('attempting to forward to client ip');
      clientToMiddleWs[j].send(data);
    });
  }
}

const ws = new WebSocket('ws://localhost:8000/proxy/ws://echo.websocket.org');
ws.on('open', function open() {
  console.log('test sock open and sent test msg');
  setTimeout(function() {
    ws.send('test');

    const ws2 = new WebSocket('ws://localhost:8000/proxy/ws://echo.websocket.org');
    ws2.on('open', function open() {
      console.log('test sock open and sent test msg');
      setTimeout(function() {
        ws2.send('test');
      }, 1000);
    });
  }, 1000);
});
