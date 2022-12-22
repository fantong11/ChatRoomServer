import { WebSocket } from "ws"
import { Room } from "../models/Room"
import { UserList } from "../models/UserList"

export interface ResponeData {
    command: CommandType,
    messageData: MessageData
}

export interface MessageData {
    username: string,
    message: string,
    roomName: string,
    recipientName: string
}


export enum CommandType {
    Join,
    Leave,
    SendPrivate,
    SendPublic,
    Connect,
    CreatePrivateRoom,
    UpdateUserList
}

export interface DoOnMessageStrategyType {
    responeJson: ResponeData,
    ws: WebSocket,
    userList: UserList,
    rooms: Map<string, Room>,
}

export enum StatusType {
    Success,
    Error,
}

export interface WebSocketRespone {
    status: StatusType,
    message: string,
}