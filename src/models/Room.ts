import { Message } from "./Message";
import { WebSocket } from "ws";
import { User } from "./User";

export class Room {
    name: string;
    users: Set<User>;

    constructor(name: string) {
        this.name = name;
        this.users = new Set();
    }

    addUser(user: User) {
        this.users.add(user);
    }

    removeUser(user: User) {
        this.users.delete(user);
    }

    sendMessage<T>(message: T) {
        let jsonString = JSON.stringify(message);

        this.users.forEach(user => {
            user.client.send(jsonString);
        });
    }
}