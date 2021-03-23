import http from 'http';
import { v4 as uuidv4 } from 'uuid';

import { constants } from './constants.js';

export class SocketServer {
  constructor({ port }) {
    this.port = port;
  }

  async initialize(eventEmitter) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hey There!');
    });

    // fazer o upgrade de http para socket
    server.on('upgrade', (req, socket) => {
      // ja vou criar um id para o socket ja para estabilizar.
      socket.id = uuidv4();

      // quando alguem pedir um upgrade, eu vou mandar esses headers na resposta.
      // toda conexão webSocket, o client e o server tem que ter esse "aperto de mão"
      // agora tanto o client tanto o server podem trocar mensagens.
      const headers = [
        'HTTP/1.1 101 Web Socket Protocol Handshake', // versão padrão
        'Upgrade: WebSocket', // quero fazer upgrade para o WebSocket
        'Connection: Upgrade',
        ''
      ].map(line => line.concat('\r\n')).join('');

      socket.write(headers);
      eventEmitter.emit(constants.event.NEW_USER_CONNECTED, socket);
    });

    return new Promise((resolve, reject) => {
      server.on('error', reject);
      server.listen(this.port, () => resolve(server));
    });
  }
}