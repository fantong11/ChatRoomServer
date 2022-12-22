import { Server } from "http";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { ConnectStrategy, CreatePrivateRoomStrategy, GetUserListStrategy, JoinStrategy, LeaveStategy, OnMessageStrategy, SendPrivateStrategy, SendPublicStrategy } from "../interfaces/MessageStrategy";
import { Room } from "../models/Room";
import { UserList } from "../models/UserList";
import { CommandType, ResponeData } from "../types/types";

export class ChatRoomServer {
    webSocketServer: WebSocketServer;
    rooms: Map<string, Room>;
    users: UserList;
    onMessageStrategyTest: Map<CommandType, OnMessageStrategy>;

    constructor(server: Server) {
        this.webSocketServer = new WebSocketServer({ server });
        this.users = new UserList();
        this.rooms = new Map();
        this.onMessageStrategyTest = new Map();
        this.initStrategy();
    }

    initStrategy() {
        this.onMessageStrategyTest.set(CommandType.Join, new JoinStrategy());
        this.onMessageStrategyTest.set(CommandType.Leave, new LeaveStategy());
        this.onMessageStrategyTest.set(CommandType.SendPrivate, new SendPrivateStrategy());
        this.onMessageStrategyTest.set(CommandType.SendPublic, new SendPublicStrategy());
        this.onMessageStrategyTest.set(CommandType.Connect, new ConnectStrategy());
        this.onMessageStrategyTest.set(CommandType.CreatePrivateRoom, new CreatePrivateRoomStrategy());
        this.onMessageStrategyTest.set(CommandType.GetUserList, new GetUserListStrategy());
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

        const onMessageStrategy = this.onMessageStrategyTest.get(responeJson.command);
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
        const user = this.users.getUserByWebSocket(ws)
        if (user) {
            user.leaveAllRoom();
            this.users.deleteUser(user)
        }

    }
}