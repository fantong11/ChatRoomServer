import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { startServer, waitForSocketState, users, resetUsers } from "./webSocketTestUtils";
import { Room } from "../src/models/Room";

const port = 3000;

describe("User Test", () => {
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

    test("Test user client can sendMessage", async () => {
        const client = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client, client.OPEN);
        const client1 = users[0].client;

        client1.on("message", (message) => {
            client1.send(message);
        });

        const testMessage = "This is a test message";
        let responseMessage;
        client.on("message", (data) => {
            responseMessage = data.toString();
            // Close the client after it receives the response
            client.close();
        });
        // Send client message
        client.send(testMessage);
        // Perform assertions on the response
        await waitForSocketState(client, client.CLOSED);
        
        expect(responseMessage).toBe(testMessage);
    });

    test("user params should be correct", async () => {
        const client = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client, client.OPEN);

        client.close();
        await waitForSocketState(client, client.CLOSED);
        
        expect(users[0].avatar).toBe("");
        expect(users[0].name).toBe("1");
    });

    test("users length should increase when client create", async () => {
        const client1 = new WebSocket(`ws://localhost:${port}`);
        const client2 = new WebSocket(`ws://localhost:${port}`);
        const client3 = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client1, client1.OPEN);
        await waitForSocketState(client2, client2.OPEN);
        await waitForSocketState(client3, client3.OPEN);
        client1.close();
        client2.close();
        client3.close();
        await waitForSocketState(client1, client1.CLOSED);
        await waitForSocketState(client2, client2.CLOSED);
        await waitForSocketState(client3, client3.CLOSED);

        expect(users.length).toBe(3);
    })

    test("room users should exist user when user join room", async () => {
        const client = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client, client.OPEN);

        let room = new Room("Lobby");
        users[0].joinRoom(room);

        client.close();
        await waitForSocketState(client, client.CLOSED);

        expect(room.name).toBe("Lobby");
        expect(room.users.has(users[0])).toBe(true);
    });

    test("room users should decrease when user leave room", async () => {
        const client1 = new WebSocket(`ws://localhost:${port}`);
        const client2 = new WebSocket(`ws://localhost:${port}`);
        const client3 = new WebSocket(`ws://localhost:${port}`);
        await waitForSocketState(client1, client1.OPEN);
        await waitForSocketState(client2, client2.OPEN);
        await waitForSocketState(client3, client3.OPEN);

        let room = new Room("Lobby");
        users[0].joinRoom(room);
        users[1].joinRoom(room);
        users[2].joinRoom(room);

        users[0].leaveRoom(room);

        client1.close();
        client2.close();
        client3.close();
        await waitForSocketState(client1, client1.CLOSED);
        await waitForSocketState(client2, client2.CLOSED);
        await waitForSocketState(client3, client3.CLOSED);

        expect(room.users.size).toBe(2);
        expect(room.users.has(users[0])).toBe(false);
    });
});