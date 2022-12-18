import { CommandType, ResponeData } from "../types/types";

export class Message  {
    username: string;
    message: string;
    command: CommandType;

    constructor(responeJson: ResponeData) {
        this.username = responeJson.messageData.username;
        this.message = responeJson.messageData.message;
        this.command = responeJson.command;
    }

    toJSON() {
        throw Error("Invalid call");
    }
}

export class DirectMessage extends Message {
    recipientName: string;
    timeStamp: number;

    constructor(responeJson: ResponeData) {
        super(responeJson);
        this.recipientName = responeJson.messageData.recipientName;
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

    constructor(responeJson: ResponeData) {
        super(responeJson);
        this.roomName = responeJson.messageData.roomName;
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
