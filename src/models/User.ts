import { WebSocket } from "ws";
import { Message } from "./Message";
import { Room } from "./Room";

export class User {
    avatar: string;
    name: string;
    client: WebSocket;
    rooms: Set<Room>;

    constructor(name: string, client: WebSocket) {
        this.avatar = "";
        this.name = name;
        this.client = client;
        this.rooms = new Set();
    }

    joinRoom(room: Room) {
        room.addUser(this);
        this.rooms.add(room);
    }

    leaveRoom(room: Room) {
        room.removeUser(this);
        this.rooms.delete(room);
    }

    leaveAllRoom() {
        for (let room of Array.from(this.rooms)) {
            this.leaveRoom(room);
        }
    }

    sendPrivateMessage(message: Message, recipient: User) {
        for (let room of Array.from(this.rooms)) {
            if (room.users.has(this) && room.users.has(recipient) && room.name !== "Lobby") {
                room.sendMessage(message);
            }
        }
    }

    toJSON() {
        return {
            avatar: this.avatar,
            name: this.name,
        }
    }
}