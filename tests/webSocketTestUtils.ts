import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { User } from "../src/models/User"

let users: User[] = [];
let username = 1;

function createWebSocketServer(server: http.Server) {
    const wss = new WebSocket.Server({ server });
    wss.on("connection", function (webSocket) {
        users.push(new User(`${username++}`, webSocket));
        // webSocket.on("message", function (message) {
        //     webSocket.send(message);
        // });
    });
}

function startServer(port: number) {
    const server = http.createServer();
    createWebSocketServer(server);
    return new Promise<http.Server>((resolve) => {
        server.listen(port, () => resolve(server));
    });
}

function waitForSocketState(socket: WebSocket, state: number) {
    return new Promise<void>(function (resolve) {
        setTimeout(function () {
            if (socket.readyState === state) {
                resolve();
            } else {
                waitForSocketState(socket, state).then(resolve);
            }
        }, 5);
    });
}

function resetUsers() {
    users = [];
    username = 1
}

export { startServer, waitForSocketState, resetUsers, users };