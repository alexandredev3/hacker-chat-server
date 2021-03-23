import Event from 'events';

import { SocketServer } from './socket.js';
import { constants } from './constants.js';
import { Controller } from './controller.js';

const eventEmitter = new Event();

// aqui estamos simulando o client;
// async function testServer() {
//   const options = {
//     port: 9898,
//     host: 'localhost',
//     headers: {
//       // temos que enviar um header parecido com que o server espera.
//       Connection: 'Upgrade',
//       Upgrade: 'websocket' // um upgrate de protocolo
//     }
//   }

//   const http = await import('http');
//   const req = http.request(options);
//   req.end();

//   req.on('upgrade', (res, socket) => {
//     // 'data' quando chegar a mensagem para o client.
//     socket.on('data', (data) => {
//       console.log('client received >>', String(data));
//     });

//      // eviando mensagens para o servidor.
//      setInterval(() => {
//        socket.write('Hello!!');
//      }, 1000);
//   });
// }

const port = process.env.PORT || 9898;
const socketServer = new SocketServer({ port });

const server = await socketServer.initialize(eventEmitter);

console.log("Server is running at:", server.address().port);

const controller = new Controller({ socketServer });

eventEmitter.on(
  constants.event.NEW_USER_CONNECTED,
  // estou passando o contexto this do controller para dentro do onNewConnnection pelo bind.
  controller.onNewConnection.bind(controller)  
)

// // ouvindo o evento emitido la no socket.js;
// eventEmitter.on(constants.event.NEW_USER_CONNECTED, (socket) => {
//   console.log("New user connected", socket.id);

//   // ele vai ficar ouvindo as mensagens que recebe do client,
//   // e mandar um World, toda vez que uma mensagem do client chegar.
//   socket.on('data', data => {
//     console.log('Server received', String(data));
//     socket.write('World');
//   })
// });