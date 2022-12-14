import { WebSocket } from "ws";
import { User } from "./User";

export class UserList {
    users: Map<string, User>;

    constructor() {
        this.users = new Map();
    }

    addUser(user: User) {
        this.users.set(user.name, user);
    }

    deleteUser(user: User) {
        this.users.delete(user.name);
    }

    getUserByUsername(username: string) {
        return this.users.get(username);
    }

    getUserByWebSocket(ws: WebSocket) {
        for (const [, user] of this.users) {
            if (user.client === ws) return user;
        }
    }

}