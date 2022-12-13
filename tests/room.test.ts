import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { startServer, waitForSocketState, users, resetUsers } from "./webSocketTestUtils";
import { Room } from "../src/models/Room";
import { PublicMessage } from "../src/models/Message";
import { CommandType, MessageType } from "../src/types/types";

const port = 3001;

describe("Room Test", () => {
    let wss: http.Server;

    beforeAll(async () => {
        wss = await startServer(port);
    });

    afterAll(() => {
        wss.close();
    });

    afterEach(() => {
        // reset users array
        resetUsers();
    });

    test("room users set should increase when room addUser", async () => {
        const client = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client, client.OPEN);

        let room = new Room("Lobby");
        room.addUser(users[0]);

        client.close();
        await waitForSocketState(client, client.CLOSED);

        expect(room.users.size).toBe(1);
    });

    test("room users set should increase when room addUser", async () => {
        const client1 = new WebSocket(`ws://localhost:${port}`);
        const client2 = new WebSocket(`ws://localhost:${port}`);
        const client3 = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client1, client1.OPEN);
        await waitForSocketState(client2, client2.OPEN);
        await waitForSocketState(client3, client3.OPEN);

        let room = new Room("Lobby");
        room.addUser(users[0]);
        room.addUser(users[1]);
        room.addUser(users[2]);
        room.removeUser(users[1]);

        client1.close();
        client2.close();
        client3.close();
        await waitForSocketState(client1, client1.CLOSED);
        await waitForSocketState(client2, client2.CLOSED);
        await waitForSocketState(client3, client3.CLOSED);

        expect(room.users.size).toBe(2);
        expect(room.users.has(users[1])).toBe(false);
    });

    test("sendMessage", async () => {
        const client1 = new WebSocket(`ws://localhost:${port}`);
        const client2 = new WebSocket(`ws://localhost:${port}`);
        const client3 = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client1, client1.OPEN);
        await waitForSocketState(client2, client2.OPEN);
        await waitForSocketState(client3, client3.OPEN);

        let responseMessage: string[] = [];

        client1.on("message", data => {
            let response: MessageType = JSON.parse(data.toString());
            responseMessage.push(response.message);
        });
        client2.on("message", data => {
            let response = JSON.parse(data.toString());
            responseMessage.push(response.message);
        });
        client3.on("message", data => {
            let response = JSON.parse(data.toString());
            responseMessage.push(response.message);
        });

        let room = new Room("Lobby");
        room.addUser(users[0]);
        room.addUser(users[1]);
        room.addUser(users[2]);

        room.sendMessage(new PublicMessage({
            username: "",
            command: CommandType.SendPublic,
            message: "This is a test message",
            roomName: "",
            recipientName: ""
        }));

        client1.close();
        client2.close();
        client3.close();
        await waitForSocketState(client1, client1.CLOSED);
        await waitForSocketState(client2, client2.CLOSED);
        await waitForSocketState(client3, client3.CLOSED);

        
        expect(responseMessage[0]).toBe("This is a test message");
        expect(responseMessage[1]).toBe("This is a test message");
        expect(responseMessage[2]).toBe("This is a test message");
    });
});