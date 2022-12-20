import express from 'express';
import * as dotenv from 'dotenv';
import { ChatRoomServer } from './services/ChatRoomServer';

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('The server is working!');
  });

const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
});

new ChatRoomServer(server).run();