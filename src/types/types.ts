export interface MessageType {
    username: string,
    command: CommandType,
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
}