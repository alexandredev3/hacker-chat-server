/**
 * responsavel por mapear os eventos que estão vindo do socket 
 * e fazer a gerencia da regra de negocio de todos eles
 */

export class Controller {
  #users = new Map();

  constructor({ socketServer }) {
    this.socketServer = socketServer;
  }

  onNewConnection(socket) {
    // quando ele receber uma conexão.

    const { id } = socket;

    console.log("connection stablished with", id);

    const userData = {
      id,
      socket
    };

    this.#updateGlobalUserData(id, userData);

    socket.on('data', this.#onSocketData(id))
    socket.on('error', this.#onSocketClosed(id))
    socket.on('end', this.#onSocketClosed(id))
  }

  #onSocketClosed(id) {
    return (data) => {
      console.log("onSocketClosed >>", String(data))
    }
  }  
  
  #onSocketData(id) {
    return (data) => {
      console.log("SocketData >>", String(data))
    }
  }

  #updateGlobalUserData(socketId, userData) {
    const users = this.#users;
    const user = users.get(socketId) ?? {};

    const updatedUserData = {
      ...user,
      ...userData,
    }

    users.set(socketId, updatedUserData);

    return users.get(socketId);
  }
}