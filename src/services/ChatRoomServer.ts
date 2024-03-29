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
    onMessageStrategy: Map<CommandType, OnMessageStrategy>;

    constructor(server: Server) {
        this.webSocketServer = new WebSocketServer({ server });
        this.users = new UserList();
        this.rooms = new Map();
        this.onMessageStrategy = new Map();
        this.initStrategy();
    }

    initStrategy() {
        this.onMessageStrategy.set(CommandType.Join, new JoinStrategy());
        this.onMessageStrategy.set(CommandType.Leave, new LeaveStategy());
        this.onMessageStrategy.set(CommandType.SendPrivate, new SendPrivateStrategy());
        this.onMessageStrategy.set(CommandType.SendPublic, new SendPublicStrategy());
        this.onMessageStrategy.set(CommandType.Connect, new ConnectStrategy());
        this.onMessageStrategy.set(CommandType.CreatePrivateRoom, new CreatePrivateRoomStrategy());
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

        const onMessageStrategy = this.onMessageStrategy.get(responeJson.command);
        if (onMessageStrategy) {
            onMessageStrategy.doStrategy({
                responeJson: responeJson,
                ws: ws,
                userList: this.users,
                rooms: this.rooms
            });
        }
    }

    onClose(ws: WebSocket) {
        console.log('Close Connected');
        const user = this.users.getUserByWebSocket(ws);
        const lobby = this.rooms.get("Lobby");
        if (user && lobby) {
            user.leaveAllRoom();
            this.users.deleteUser(user);
            lobby.sendMessage({
                command: CommandType.UpdateUserList,
                users: this.users
            });
        }

    }
}