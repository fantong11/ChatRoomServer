import { Server } from "http";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { ConnectStrategy, CreatePrivateRoomStrategy, JoinStrategy, LeaveStategy, OnMessageStrategy, SendPrivateStrategy, SendPublicStrategy } from "../interfaces/MessageStrategy";
import { Room } from "../models/Room";
import { UserList } from "../models/UserList";
import { CommandType, ResponeData } from "../types/types";

export class ChatRoomServer {
    webSocketServer: WebSocketServer;
    rooms: Map<string, Room>;
    users: UserList;
    onMessageStrategy: OnMessageStrategy | undefined;

    constructor(server: Server) {
        this.users = new UserList();
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
        let responeJson: ResponeData = JSON.parse(dataString);
        console.log(responeJson);

        switch (responeJson.command) {
            case CommandType.Join:
                this.onMessageStrategy = new JoinStrategy();
                break;

            case CommandType.Leave:
                this.onMessageStrategy = new LeaveStategy();
                break;

            case CommandType.Connect:
                this.onMessageStrategy = new ConnectStrategy();
                break;

            case CommandType.SendPrivate:
                this.onMessageStrategy = new SendPrivateStrategy();
                break;

            case CommandType.SendPublic:
                this.onMessageStrategy = new SendPublicStrategy();
                break;

            case CommandType.CreatePrivateRoom:
                this.onMessageStrategy = new CreatePrivateRoomStrategy();
                break;
        }

        this.onMessageStrategy.doStrategy({
            responeJson: responeJson,
            ws: ws,
            userList: this.users,
            rooms: this.rooms
        });
    }

    onClose(ws: WebSocket) {
        console.log('Close Connected');
        const user = this.users.getUserByWebSocket(ws)
        if (user) {
            user.leaveAllRoom();
            this.users.deleteUser(user)
        }

    }
}