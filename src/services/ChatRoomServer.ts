import { Server } from "http";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { DirectMessage, Message, PublicMessage } from "../models/Message";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { CommandType, MessageType } from "../types/types";

export class ChatRoomServer {
    webSocketServer: WebSocketServer;
    rooms: Map<string, Room>;
    users: User[];

    constructor(server: Server) {
        this.users = [];
        this.rooms = new Map();
        this.webSocketServer = new WebSocketServer({ server });
    }

    createRoom(name: string) {
        let room = new Room(name);
        this.rooms.set(name, room);
    }

    deleteRoom(name: string) {
        this.rooms.delete(name);
    }

    getUserRoom(user: User) {
        for (let room of this.rooms.values()) {
            if (room.users.has(user)) {
                return room;
            }
        }
    }

    getUserByUsername(username: string) {
        for (let user of this.users) {
            if (user.name === username) return user;
        }
    }

    getUserByWebSocket(ws: WebSocket) {
        for (let user of this.users) {
            if (user.client === ws) return user;
        }
    }

    run() {
        this.createRoom("Lobby");
        this.webSocketServer.on('connection', ws => this.onConnection(ws));
    }

    onConnection(ws: WebSocket) {
        console.log("Connected");


        ws.on('message', message => this.onMessage(ws, message));
        ws.on('close', () => this.onClose(ws));
    }

    onMessage(ws: WebSocket, data: RawData) {
        let dataString = data.toString();
        console.log(dataString);

        let messageJson: MessageType = JSON.parse(dataString);
        console.log(messageJson);

        if (messageJson.command === CommandType.Join) {
            let roomName = messageJson.roomName;
            let user = this.getUserByWebSocket(ws);
            if (user) {
                let room = this.rooms.get(roomName);
                if (room) {
                    user.joinRoom(room);
                }
            }
        }
        else if (messageJson.command === CommandType.Leave) {
            let roomName = messageJson.roomName;
            let user = this.getUserByWebSocket(ws);
            if (user) {
                let room = this.rooms.get(roomName);
                if (room) {
                    user.leaveRoom(room);
                }
            }
        }
        else if (messageJson.command === CommandType.SendPrivate) {
            let message = new DirectMessage(messageJson);
            let user = this.getUserByWebSocket(ws);
            let recipient = this.getUserByUsername(messageJson.recipientName);
            if (user && recipient) {
                user.sendPrivateMessage(message, recipient);
            }
        }
        else if (messageJson.command === CommandType.SendPublic) {
            let message = new PublicMessage(messageJson);
            let room = this.rooms.get("Lobby");
            if (room) {
                room.sendMessage(message);
            }
        }
        else if (messageJson.command === CommandType.Connect) {
            let user = new User(messageJson.username, ws);
            this.users.push(user);

            let room = this.rooms.get("Lobby");
            if (room) {
                user.joinRoom(room);
            }
        }
        else if (messageJson.command === CommandType.CreatePrivateRoom) {
            let user = this.getUserByWebSocket(ws);
            let recipient = this.getUserByUsername(messageJson.recipientName);
            
            let room: Room;

            if (this.rooms.has(messageJson.roomName)) {
                room = this.rooms.get(messageJson.roomName)!;
            }
            else {
                room = new Room(`${user?.name}${recipient?.name}`);
            }
            if (room && user && recipient) {
                user.joinRoom(room);
                recipient.joinRoom(room);
            }
        }
    }

    onClose(ws: WebSocket) {
        console.log('Close Connected');
        this.users = this.users.filter(user => user.client !== ws);
    }
}