import express from 'express';
import { ChatRoomServer } from './services/ChatRoomServer';

const PORT = 3000;

const app = express();

app.get('/', (req, res) => {
    res.send('The server is working!');
  });

const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

new ChatRoomServer(server).run();