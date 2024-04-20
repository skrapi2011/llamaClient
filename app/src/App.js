import React, { useState } from 'react';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentMessage, setCurrentMessage] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            setMessages(prevMessages => [...prevMessages, { id: Date.now(), text: input, isUser: true }]);

            const data = {
                model: "llama3",
                prompt: input
            };

            fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    const reader = response.body.getReader();
                    let completeMessage = '';

                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                setMessages(prevMessages => [...prevMessages, { id: Date.now(), text: completeMessage, isUser: false }]);
                                setCurrentMessage('');
                                return;
                            }
                            const string = new TextDecoder("utf-8").decode(value);
                            try {
                                const json = JSON.parse(string);
                                console.log("Received:", json.response);
                                completeMessage += json.response;
                                setCurrentMessage(completeMessage);
                            } catch (e) {

                            }
                            push();
                        }).catch(error => {
                            console.error('Error while reading the stream', error);
                        });
                    }
                    push();
                })
                .catch(error => {
                    console.error('Error during data streaming', error);
                });

            setInput('');
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    return (
        <div className="App">
            <div className="chat-container">
                <div className="messages">
                    {messages.map((message) => (
                        <div key={message.id}
                             className={`message ${message.isUser ? 'user-message' : 'server-message'}`}>
                            {message.text}
                        </div>
                    ))}
                    {currentMessage && <div className="message server-message">{currentMessage}</div>}
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="input-field"
                />
                <button onClick={handleSend} className="send-button">Send</button>
            </div>
        </div>
    );
}

export default App;
