import { Server } from "http";
import { RawData, WebSocket, WebSocketServer } from "ws";

export class ChatRoomServer {
    webSocketServer: WebSocketServer;
    clients: WebSocket[];

    constructor(server: Server) {
        this.clients = [];
        this.webSocketServer = new WebSocketServer({ server });
    }

    run() {
        this.webSocketServer.on('connection', ws => this.onConnection(ws));
    }

    onConnection(ws: WebSocket) {
        console.log("Connected");
        this.clients.push(ws);
        ws.on('message', message => this.onMessage(message));
        ws.on('close', () => this.onClose(ws));
    }

    onMessage(data: RawData) {
        let dataString = data.toString();
        console.log(dataString);

        this.clients.forEach(client => {
            client.send(dataString);
        });
    }

    onClose(ws: WebSocket) {
        console.log('Close Connected');
        this.clients = this.clients.filter(client => client !== ws);
    }
}