/**
 * responsavel por mapear os eventos que estão vindo do socket 
 * e fazer a gerencia da regra de negocio de todos eles
 */
import { constants } from './constants.js';

export class Controller {
  #users = new Map();
  #rooms = new Map();

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

  async joinRoom(socketId, data) {
    const userData = data;
    const { roomId } = data;
    console.log(`${userData.username} joined! ${[socketId]}`);
    const user = this.#updateGlobalUserData(socketId, userData);

    const users = this.#joinUserOnRoom(roomId, user);

    // A CHAVE E O ID DO SOCKET.
    const currentUsers = Array.from(users.values())
      .map(({ id, username }) => ({ id, username }))

    // listar usuarios na sala.
    this.socketServer.sendMessage(
      user.socket, 
      constants.event.UPDATE_USERS, 
      currentUsers
    );
  }

  #joinUserOnRoom(roomId, user) {
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
    usersOnRoom.set(user.id, user);
    this.#rooms.set(roomId, usersOnRoom);

    return usersOnRoom;
  }

  #onSocketClosed(id) {
    return (data) => {
      console.log("onSocketClosed >>", id)
    }
  }  
  
  #onSocketData(id) {
    return (data) => {
      try {
        const { event, message } = JSON.parse(data);
        
        // o event tem o mesmo nome da função joinRoom.
        // vamos manda a posição do evento no this.
        // todos os nossos eventos vai receber um id e uma mensagem.
        this[event](id, message);
      } catch (error) {
        console.error(`event format invalid ${String(data)}`);          
      }


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