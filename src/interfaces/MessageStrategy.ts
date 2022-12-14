import { DirectMessage, PublicMessage } from "../models/Message";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { DoOnMessageStrategyType, ResponeData } from "../types/types";

export interface OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void;
}

export class JoinStrategy implements OnMessageStrategy{
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const messageData = doStrategyType.responeJson.messageData;
        const userList = doStrategyType.userList;
        const ws = doStrategyType.ws;
        const rooms = doStrategyType.rooms;
        
        const user = userList.getUserByWebSocket(ws);
        const room = rooms.get(messageData.roomName);
        if (user && room) {
            user.joinRoom(room);
        }
    }

}

export class LeaveStategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const messageData = doStrategyType.responeJson.messageData;
        const userList = doStrategyType.userList;
        const ws = doStrategyType.ws;
        const rooms = doStrategyType.rooms;
        
        const user = userList.getUserByWebSocket(ws);
        const room = rooms.get(messageData.roomName);
        if (user && room) {
            user.leaveRoom(room);
        }
    }
}

export class SendPrivateStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const responeJson = doStrategyType.responeJson;
        const userList = doStrategyType.userList;
        const ws = doStrategyType.ws;

        const message = new DirectMessage(responeJson);
        const user = userList.getUserByWebSocket(ws);
        const recipient = userList.getUserByUsername(responeJson.messageData.recipientName)

        if (user && recipient) {
            user.sendPrivateMessage(message, recipient);
        }
    }

}

export class SendPublicStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const responeJson = doStrategyType.responeJson;
        const rooms = doStrategyType.rooms;

        const message = new PublicMessage(responeJson);
        const room = rooms.get("Lobby");

        if (room) {
            room.sendMessage(message);
        }
    }

}

export class ConnectStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const messageData = doStrategyType.responeJson.messageData;
        const userList = doStrategyType.userList;
        const ws = doStrategyType.ws; 
        const rooms = doStrategyType.rooms;

        const user = new User(messageData.username, ws);
        const room = rooms.get("Lobby");
        userList.addUser(user);

        if (room) {
            user.joinRoom(room);
        }
    }
}

export class CreatePrivateRoomStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const messageData = doStrategyType.responeJson.messageData;
        const userList = doStrategyType.userList;
        const ws = doStrategyType.ws; 
        const rooms = doStrategyType.rooms;

        const user = userList.getUserByWebSocket(ws);
        const recipient = userList.getUserByUsername(messageData.recipientName);

        let room: Room | undefined;

        if (rooms.has(messageData.roomName)) {
            room = rooms.get(messageData.roomName);
        }
        else {
            room = new Room(`${user?.name}${recipient?.name}`);
        }

        if (room && user && recipient) {
            console.log("Private room created");
            user.joinRoom(room);
            recipient.joinRoom(room);
        }
    }
}