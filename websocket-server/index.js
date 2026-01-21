import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import {notifyUser, handlePayload } from './src/handler.js';
import asyncHandler from "express-async-handler"

dotenv.config()

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}))

const port = process.env.PORT || 3000;

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {

  ws.on('message', (data) => {
  try {
    let decodedData;
    if (Buffer.isBuffer(data)) {
      decodedData = data.toString('utf8');
    } else {
      decodedData = data;
    }
    const parsed = JSON.parse(decodedData);
    console.log("Parsed Message:", parsed);
    handlePayload(ws, parsed)
  } catch (error) {
    console.error("Failed to parse WebSocket message:", error);
  }
});

    ws.send("Welcome to the WebSocket server!");
});

app.get("/", (req,res)=>{
    res.send("hi ther i am ws backend")
})

app.post('/notify', asyncHandler(notifyUser));

server.listen(port, ()=>{
    console.log(`server is listening on http://localhost:${port}`)
})