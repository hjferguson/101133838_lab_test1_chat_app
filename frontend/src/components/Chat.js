// Chat.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Establish connection with socket.io server
const socket = io('http://localhost:3001'); // Adjust this to match your server's address

function Chat() {
    const [room, setRoom] = useState('devops'); // Default room
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    // Effect for handling messages
    useEffect(() => {
        socket.emit('joinRoom', { roomName: room });

        socket.on('message', (message) => {
            setMessages((msgs) => [...msgs, message]);
        });

        return () => {
            socket.off('message');
        };
    }, [room]);

    // Effect for auto-scrolling
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (message) {
            const messageToSend = {
                // from_user: username, // Uncomment and replace with actual sender's username
                text: message
            };
            socket.emit('sendMessage', { roomName: room, message: messageToSend });
            setMessage('');
        }
    };

    const handleRoomChange = (e) => {
        const newRoom = e.target.value;
        if (newRoom !== room) {
            socket.emit('leaveRoom', { roomName: room });
            setRoom(newRoom);
            setMessages([]);
            socket.emit('joinRoom', { roomName: newRoom });
        }
    };

    return (
        <div>
            <select onChange={handleRoomChange} value={room}>
                <option value="devops">DevOps</option>
                <option value="cloud computing">Cloud Computing</option>
                <option value="covid19">COVID-19</option>
                <option value="sports">Sports</option>
                <option value="nodeJS">NodeJS</option>
            </select>
            
            <div style={{ height: '300px', overflowY: 'auto', marginTop: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ backgroundColor: '#f4f4f4', margin: '5px', padding: '10px', borderRadius: '10px' }}>
                        <strong>{msg.from_user || 'Anonymous'}:</strong> {typeof msg.text === 'object' ? msg.text.text : msg.text}
                    </div>
                ))}
                {/* Invisible element for auto-scrolling */}
                <div ref={messagesEndRef} />
            </div>
            
            <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}

export default Chat;
