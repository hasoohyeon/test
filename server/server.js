const express = require('express');
const { Server } = require('socket.io');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../client/public')));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Create HTTP server
const httpServer = app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Store connected users and their scores
const users = new Map();
const game = {
    started: false,
    currentRoller: null,
    results: new Map()
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('set_nickname', (nickname) => {
        if (!users.has(nickname)) {
            users.set(nickname, { socket: socket, score: 0 });
            socket.nickname = nickname;
            
            // Broadcast new user joined
            io.emit('user_joined', nickname);
            
            // Send user list to all connected clients
            const userList = Array.from(users.keys());
            io.emit('user_list', userList);
            
            // Start game automatically when first user joins
            if (users.size === 1) {
                game.started = true;
                game.currentRoller = nickname;
                io.emit('game_started', {
                    roller: nickname
                });
            }
        } else {
            socket.emit('error', 'Nickname already in use');
        }
    });

    socket.on('roll_dice', () => {
        if (socket.nickname && game.started && game.currentRoller === socket.nickname) {
            const roll = Math.floor(Math.random() * 6) + 1;
            game.results.set(socket.nickname, roll);
            
            io.emit('dice_rolled', {
                player: socket.nickname,
                roll: roll
            });
            
            // Find next player
            const userArray = Array.from(users.keys());
            const currentIndex = userArray.indexOf(socket.nickname);
            const nextIndex = (currentIndex + 1) % userArray.length;
            game.currentRoller = userArray[nextIndex];
            
            if (game.currentRoller) {
                io.emit('next_player', {
                    player: game.currentRoller
                });
            } else {
                // Game over - determine winner
                const winner = Array.from(game.results.entries())
                    .reduce((max, entry) => entry[1] > max[1] ? entry : max, ['', 0])[0];
                
                io.emit('game_over', {
                    winner: winner,
                    results: Object.fromEntries(game.results)
                });
                
                // Reset game
                game.started = false;
                game.currentRoller = null;
                game.results.clear();
            }
        }
    });

    socket.on('chat_message', (message) => {
        if (socket.nickname) {
            io.emit('chat_message', {
                sender: socket.nickname,
                message: message
            });
        }
    });

    socket.on('disconnect', () => {
        if (socket.nickname) {
            users.delete(socket.nickname);
            // Notify all clients about user leaving
            io.emit('user_left', socket.nickname);
            // Update user list for all clients
            const userList = Array.from(users.keys());
            io.emit('user_list', userList);
            
            // If no users left, reset game state
            if (users.size === 0) {
                game.started = false;
                game.currentRoller = null;
                game.results.clear();
            }
        }
        console.log('Client disconnected');
    });
});
