import { DirectMessage, PublicMessage } from "../models/Message";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { DoOnMessageStrategyType, StatusType } from "../types/types";

export interface OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void;
}

export class JoinStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const { responeJson, userList, ws, rooms } = doStrategyType;
        const messageData = responeJson.messageData;

        const user = userList.getUserByWebSocket(ws);
        const room = rooms.get(messageData.roomName);
        if (user && room) {
            user.joinRoom(room);
            ws.send(JSON.stringify({
                status: StatusType.Success, 
                message: "Join room success."
            }));
            return;
        }
        ws.send(JSON.stringify({
            status: StatusType.Error, 
            message: "Join room error."
        }));
    }

}

export class LeaveStategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const { responeJson, userList, ws, rooms } = doStrategyType;
        const messageData = responeJson.messageData;

        const user = userList.getUserByWebSocket(ws);
        const room = rooms.get(messageData.roomName);
        if (user && room) {
            user.leaveRoom(room);
            ws.send({
                status: StatusType.Success, 
                message: "Leave room success."
            });
            return;
        }
        ws.send(JSON.stringify({
            status: StatusType.Error, 
            message: "Leave room error."
        }));
    }
}

export class SendPrivateStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const { responeJson, userList, ws } = doStrategyType;

        const user = userList.getUserByWebSocket(ws);
        const recipient = userList.getUserByUsername(responeJson.messageData.recipientName)

        if (user && recipient) {
            const message = new DirectMessage(responeJson);
            user.sendPrivateMessage(message, recipient);
            return;
        }
        ws.send(JSON.stringify({
            status: StatusType.Error, 
            message: "Send public message error."
        }));
    }

}

export class SendPublicStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const { responeJson, rooms, ws } = doStrategyType;

        const room = rooms.get("Lobby");

        if (room) {
            const message = new PublicMessage(responeJson);
            room.sendMessage(message);
            return;
        }
        ws.send(JSON.stringify({
            status: StatusType.Error, 
            message: "Send public message error."
        }));
    }

}

export class ConnectStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const { responeJson, userList, ws, rooms } = doStrategyType;
        const messageData = responeJson.messageData;

        const user = new User(messageData.username, ws);
        const room = rooms.get("Lobby");
        userList.addUser(user);

        if (room) {
            user.joinRoom(room);
            room.sendMessage(userList);
            return;
        }
        
        ws.send(JSON.stringify({
            status: StatusType.Error, 
            message: "Join room error."
        }));
    }
}

export class CreatePrivateRoomStrategy implements OnMessageStrategy {
    doStrategy(doStrategyType: DoOnMessageStrategyType): void {
        const { responeJson, userList, ws, rooms } = doStrategyType;
        const messageData = responeJson.messageData;

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
            ws.send(JSON.stringify({
                status: StatusType.Success, 
                message: "Join room success."
            }));
            return;
        }
        ws.send(JSON.stringify({
            status: StatusType.Error, 
            message: "Join room error."
        }));
    }
}