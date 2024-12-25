// src/components/chat/ChatFooter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Conversation } from '../models/Conversation.ts';
import { useAuth } from '../context/auth.context.tsx';
import { bookings } from '../util/TestData.ts';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { ChatDotsFill, ArrowLeft, X } from 'react-bootstrap-icons';
import './Footer.scss';

const ChatFooter: React.FC = () => {
    const [show, setShow] = useState(false);
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const { getUserInfo } = useAuth();
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const target = useRef(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const userInfo = await getUserInfo();
            if (userInfo) setCurrentUserId(userInfo.id);
        };
        fetchUserInfo();
    }, [getUserInfo]);

    useEffect(() => {
        const activeConversations = bookings
            .filter(booking => booking.conversation)
            .map(booking => booking.conversation) as Conversation[];
        setConversations(activeConversations);
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeConversation, conversations]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeConversation) {
            // This will be replaced with WebSocket emit
            console.log('Sending message:', {
                conversationId: activeConversation,
                content: newMessage,
                from: currentUserId
            });

            // Temporary local message addition
            const updatedConversations = conversations.map(conv => {
                if (conv.id === activeConversation) {
                    return {
                        ...conv,
                        messages: [
                            ...conv.messages,
                            {
                                from: currentUserId,
                                to: 'placeholder',
                                content: newMessage,
                            }
                        ]
                    };
                }
                return conv;
            });

            setConversations(updatedConversations);
            setNewMessage('');
        }
    };

    const popover = (
        <Popover id="chat-popover" className="chat-footer__popover shadow border-0">
            <Popover.Header className="bg-success text-white border-bottom d-flex justify-content-between align-items-center py-2">
                <span className="fw-bold">{activeConversation ? 'Chat' : 'Conversations'}</span>
                <Button
                    variant="link"
                    className="p-0 text-white"
                    onClick={() => setShow(false)}
                >
                    <X size={20} />
                </Button>
            </Popover.Header>
            <Popover.Body className="p-0" style={{ height: '400px' }}>
                {!activeConversation ? (
                    <div className="list-group list-group-flush overflow-auto h-100">
                        {conversations.filter(conv => conv.active).map(conversation => (
                            <Button
                                key={conversation.id}
                                variant="light"
                                className="chat-footer__conversation-item list-group-item list-group-item-action border-0 py-3 text-start rounded-0"
                                onClick={() => setActiveConversation(conversation.id)}
                            >
                                <div className="d-flex flex-column">
                                    <strong className="chat-footer__conversation-item-title">
                                        Booking {conversation.id}
                                    </strong>
                                    {conversation.messages.length > 0 && (
                                        <small className="text-muted text-truncate">
                                            {conversation.messages[conversation.messages.length - 1].content}
                                        </small>
                                    )}
                                </div>
                            </Button>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="d-flex align-items-center p-2 border-bottom bg-light">
                            <Button
                                variant="link"
                                className="text-success p-0 me-2"
                                onClick={() => setActiveConversation(null)}
                            >
                                <ArrowLeft size={20} />
                            </Button>
                            <span className="text-muted">Back to Conversations</span>
                        </div>
                        <div className="chat-footer__messages-container overflow-auto p-3">
                            {conversations
                                .find(conv => conv.id === activeConversation)
                                ?.messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`d-flex mb-2 ${
                                            message.from === currentUserId ? 'justify-content-end' : 'justify-content-start'
                                        }`}
                                    >
                                        <div
                                            className={`chat-footer__message p-2 rounded-3 ${
                                                message.from === currentUserId
                                                    ? 'chat-footer__message--outgoing'
                                                    : 'chat-footer__message--incoming border'
                                            }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSend} className="p-2 border-top bg-white">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control border-end-0"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                />
                                <Button
                                    type="submit"
                                    variant="outline-success"
                                    className="border-start-0"
                                    disabled={!newMessage.trim()}
                                >
                                    Send
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </Popover.Body>
        </Popover>
    );

    return (
        <div className="fixed-bottom d-flex justify-content-end me-4 mb-4">
            <OverlayTrigger
                trigger="click"
                placement="top-end"
                show={show}
                onToggle={setShow}
                overlay={popover}
                rootClose
            >
                <Button
                    variant="success"
                    className="chat-footer__trigger-btn rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                >
                    <ChatDotsFill size={20} />
                </Button>
            </OverlayTrigger>
        </div>
    );
};

export default ChatFooter;