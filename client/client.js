const socket = io('http://localhost:3000');

// DOM Elements
const nicknameInput = document.getElementById('nickname-input');
const nicknameForm = document.getElementById('nickname-form');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');
const userDisplay = document.getElementById('users');
const rollButton = document.getElementById('roll-button');
const diceDisplay = document.getElementById('dice-display');
const resultDisplay = document.getElementById('result-display');

// State
let nickname = '';

// Helper functions
function addMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateUsers(users = []) {
    userDisplay.innerHTML = users.map(user => `<div>${user}</div>`).join('');
}

function updateDiceDisplay(roll) {
    diceDisplay.textContent = roll ? `주사위: ${roll}` : '주사위를 굴려주세요';
}

function updateResultDisplay(results, winner) {
    if (winner) {
        resultDisplay.innerHTML = `
            <div>게임 결과:</div>
            <div>승리자: ${winner}</div>
            <div>결과: ${Object.entries(results)
                .map(([player, roll]) => `${player}: ${roll}`).join(', ')}</div>
        `;
    } else {
        resultDisplay.textContent = '';
    }
}

// Socket.IO event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('error', (message) => {
    console.error('Error:', message);
    alert(message);
});

socket.on('user_joined', (nickname) => {
    console.log('User joined:', nickname);
    updateUsers();
    addMessage(`${nickname}님이 입장했습니다.`);
});

socket.on('user_left', (nickname) => {
    console.log('User left:', nickname);
    updateUsers();
    addMessage(`${nickname}님이 퇴장했습니다.`);
});

socket.on('chat_message', (data) => {
    console.log('Chat message:', data);
    addMessage(`${data.sender}: ${data.message}`);
});

socket.on('user_list', (users) => {
    console.log('User list:', users);
    updateUsers(users);
});

socket.on('game_started', (data) => {
    console.log('Game started:', data);
    rollButton.style.display = 'block';
    updateDiceDisplay(null);
    updateResultDisplay(null, null);
});

socket.on('dice_rolled', (data) => {
    console.log('Dice rolled:', data);
    updateDiceDisplay(data.roll);
    addMessage(`${data.player}님이 주사위를 굴렸습니다: ${data.roll}`);
});

socket.on('next_player', (data) => {
    console.log('Next player:', data);
    if (data.player === nickname) {
        rollButton.textContent = '주사위 굴리기';
        rollButton.disabled = false;
    } else {
        rollButton.textContent = '다음 차례를 기다리는 중...';
        rollButton.disabled = true;
    }
});

socket.on('game_over', (data) => {
    console.log('Game over:', data);
    updateResultDisplay(data.results, data.winner);
    addMessage(`게임 종료! 승리자: ${data.winner}`);
    rollButton.style.display = 'none';
});

// UI event handlers
nicknameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    nickname = nicknameInput.value.trim();
    if (nickname) {
        socket.emit('set_nickname', nickname);
        nicknameForm.style.display = 'none';
        chatInput.disabled = false;
        chatSend.disabled = false;
    }
});

chatSend.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message && nickname) {
        socket.emit('chat_message', message);
        chatInput.value = '';
    }
});

rollButton.addEventListener('click', () => {
    socket.emit('roll_dice');
});
