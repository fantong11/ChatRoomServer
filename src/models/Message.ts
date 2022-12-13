import { CommandType, MessageType } from "../types/types";

export class Message {
    username: string;
    message: string;
    command: CommandType;

    constructor(messageJson: MessageType) {
        this.username = messageJson.username;
        this.message = messageJson.message;
        this.command = messageJson.command;
    }

    toJSON() {
        throw Error("Invalid call");
    }
}


export class DirectMessage extends Message {
    recipientName: string;
    timeStamp: number;

    constructor(messageJson: MessageType) {
        super(messageJson);
        this.recipientName = messageJson.recipientName;
        this.timeStamp = Date.now();
    }

    toJSON() {
        return {
            username: this.username,
            message: this.message,
            command: this.command,
            recipient: this.recipientName,
            timeStamp: this.timeStamp
        }
    }
}

export class PublicMessage extends Message {
    roomName: string;
    timeStamp: number;

    constructor(messageJson: MessageType) {
        super(messageJson);
        this.roomName = messageJson.roomName;
        this.timeStamp = Date.now();
    }

    toJSON() {
        return {
            username: this.username,
            message: this.message,
            command: this.command,
            roomName: this.roomName,
            timeStamp: this.timeStamp
        }
    }
}
