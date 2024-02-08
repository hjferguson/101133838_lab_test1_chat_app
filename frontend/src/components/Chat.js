import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

function Chat() {
    const [room, setRoom] = useState('devops'); // Default room
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const socket = useRef(null); // Use useRef to keep the socket instance

    useEffect(() => {
        // Retrieve the token from local storage (browser)
        const token = localStorage.getItem('token'); // Assuming the token is stored with the key 'token'
        
        // Initialize socket connection and store it in the useRef
        socket.current = io('http://localhost:3001', { 
            transports: ['websocket'], 
            query: { token } 
        });

        socket.current.on('chatHistory', (history) => {
            console.log('Received chat history:', history);
            // Directly map over the history if it's already in the expected format
            const formattedHistory = history.map(msg => ({
                from_user: msg.from_user,
                text: msg.text
            }));
            setMessages(formattedHistory);
        });
        

        socket.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socket.current.onAny((event, ...args) => {
            console.log(`Received event: ${event}`, args);
          });
          

        socket.current.emit('joinRoom', { roomName: room });

        socket.current.on('message', (message) => {
            console.log('Received message:', message);
            setMessages((msgs) => [...msgs, message]);
        });

        return () => {
            socket.current.off('message');
            socket.current.disconnect();
        };
    }, [room]);

    const sendMessage = () => {
        if (message) {
            const messageToSend = {
                text: message
            };
            console.log('Sending message:', messageToSend);
            socket.current.emit('sendMessage', { roomName: room, message: messageToSend });
            setMessage('');
        }
    };

    const handleRoomChange = (e) => {
        const newRoom = e.target.value;
        if (newRoom !== room) {
            socket.current.emit('leaveRoom', { roomName: room });
            setRoom(newRoom);
            setMessages([]);
            socket.current.emit('joinRoom', { roomName: newRoom });
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
            
            <div className="messageContainer">
                {messages.map((msg, index) => (
                    <div key={index} className="messageBubble">
                        <strong>{msg.from_user || 'Anonymous'}:</strong> {typeof msg.text === 'object' ? msg.text.text : msg.text}
                    </div>
                ))}
                
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
