const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});
const rooms = {};
const roomsPokemons = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (room) => {
    
    if (!rooms[room]) {
      rooms[room] = [];
    } 
    console.log(rooms)
    if (rooms[room].length < 2) {
      rooms[room].push(socket.id);
      socket.join(room);
      console.log(`Client joined room: ${room}`);
      const isRoomFull = rooms[room].length === 2;
      io.to(room).emit('roomJoined', { success: true, isRoomFull, pokemons: roomsPokemons[room] });
    } else {
      socket.emit('roomJoined', { success: false, message: 'Room is full' });
    }
  });
  
  socket.on('attack', (data) => {
    const { room, attack } = data;
    io.to(room).emit('attack', attack);
  });

  socket.on('loadPokemon', (data) => {
    const { room, pokemons } = data;
    roomsPokemons[room] = pokemons;
    socket.emit('loadPokemon', { success: true, message: 'Data loaded' })
    console.log(roomsPokemons)
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
