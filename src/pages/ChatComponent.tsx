import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {Badge, Button} from 'react-bootstrap';
import {useAuth} from '../context/auth.context';
import {BookingChat} from '../models/Booking';
import {Message as ChatMessage} from '../models/Message';
import {FaArrowLeft, FaComments, FaTimes} from 'react-icons/fa';
import {Check, CheckCheck} from 'lucide-react';


import {
    Avatar,
    ChatContainer,
    Conversation,
    ConversationHeader,
    ConversationList,
    MainContainer,
    Message,
    MessageInput,
    MessageList,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

const customStyles: Record<string, CSSProperties> = {
    chatContainer: {
        position: 'fixed' as const,
        bottom: '5rem',
        right: '1rem',
        width: '350px',
        height: '480px',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
    },
    chatButton: {
        position: 'fixed' as const,
        bottom: '1rem',
        right: '1rem',
        zIndex: 1000
    },
    mainContainer: {
        height: '100%'
    }
};

const ChatFooter: React.FC = () => {
    const [show, setShow] = useState(false);
    const [bookingsWithConversations, setBookingsWithConversations] = useState<BookingChat[]>([]);
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [recipientTyping, setRecipientTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const {userInfo, getAccessTokenCurrentUser, isAuthenticated} = useAuth();
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        console.log('Bookings:', bookingsWithConversations);
    }, [bookingsWithConversations]);

    // Socket initialization
    useEffect(() => {
        if (!accessToken) return;

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
            path: '/socket.io',
            auth: {token: accessToken},
            query: {userId: userInfo?.id}
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to socket');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [accessToken]);

    // Socket message handlers
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on('messageReceived', (message: ChatMessage) => {
            setBookingsWithConversations(prev => prev.map(conv => {
                if (conv.conversation.id === message.conversationId) {
                    return {
                        ...conv,
                        conversation: {
                            ...conv.conversation,
                            messages: [...conv.conversation.messages, message]
                        }
                    };
                }
                return conv;
            }));
        });

        socketRef.current.on('bookingsUpdated', (updatedBookings: BookingChat[]) => {
            setBookingsWithConversations(updatedBookings);
        });

        socketRef.current.on('typing', ({userId, isTyping}) => {
            if (userId !== userInfo?.id) {
                setRecipientTyping(isTyping);
            }
        });


        socketRef.current.on('messagesRead', ({conversationId, userId}) => {
            if (userId !== userInfo?.id) {
                setBookingsWithConversations(prev => prev.map(conv => {
                    if (conv.conversation.id === conversationId) {
                        return {
                            ...conv,
                            conversation: {
                                ...conv.conversation,
                                messages: conv.conversation.messages.map(msg => ({
                                    ...msg,
                                    read: msg.read || msg.to === userId
                                }))
                            }
                        };
                    }
                    return conv;
                }));
            }
        });

        return () => {
            socketRef.current?.off('messageReceived');
            socketRef.current?.off('bookingsUpdated');
            socketRef.current?.off('typing');
            socketRef.current?.off('messagesRead');
        };
    }, [socketRef.current, userInfo?.id]);

    // Authentication effect
    useEffect(() => {
        if (!isAuthenticated) return;
        getAccessTokenCurrentUser().then(token => {
            setAccessToken(token);
        });
    }, [getAccessTokenCurrentUser, isAuthenticated]);

    const handleTyping = () => {
        if (!socketRef.current || !activeConversation) return;

        socketRef.current.emit('typing', {
            conversationId: activeConversation,
            isTyping: true
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('typing', {
                conversationId: activeConversation,
                isTyping: false
            });
        }, 2000);
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current || !activeConversation || !userInfo) return;

        const conversation = bookingsWithConversations.find(c => c.conversation.id === activeConversation);
        if (!conversation) return;

        const recipientId = conversation.guest.id === userInfo.id
            ? conversation.property.owner.id
            : conversation.guest.id;

        const message = {
            conversationId: activeConversation,
            content: newMessage,
            from: userInfo.id,
            to: recipientId,
            timestamp: new Date(),
            read: false
        };

        socketRef.current.emit('sendMessage', message, (response: { success: boolean, error?: string }) => {
            if (response.success) {
                // Only update the UI after server confirms message was saved
                setBookingsWithConversations(prev => prev.map(conv => {
                    if (conv.conversation.id === activeConversation) {
                        return {
                            ...conv,
                            conversation: {
                                ...conv.conversation,
                                messages: [...conv.conversation.messages, message]
                            }
                        };
                    }
                    return conv;
                }));
            } else {
                // Handle error - show toast or notification
                console.error('Failed to send message:', response.error);
                // Optionally, you could restore the message to the input
                setNewMessage(message.content);
            }
        });
        setNewMessage('');
    };

    const handleConversationOpen = (conversationId: string) => {
        setActiveConversation(conversationId);
        socketRef.current?.emit('openChat', conversationId);
    };

    const getTotalUnreadCount = (): number => {
        return bookingsWithConversations.reduce((total, conv) => {
            return total + conv.conversation.messages.filter(
                msg => !msg.read && msg.to === userInfo?.id
            ).length;
        }, 0);
    };

    const getConversationTitle = (conversationId: string): string => {
        const conversation = bookingsWithConversations.find(c => c.conversation.id === conversationId);
        return conversation?.property.name || 'Chat';
    };

    const getOtherParticipant = (booking: BookingChat) => {
        return booking.guest.id === userInfo?.id
            ? booking.property.owner
            : booking.guest;
    };

    const getMessageSender = (message: ChatMessage) => {
        const conversation = bookingsWithConversations.find(c => c.conversation.id === message.conversationId);
        if (!conversation) return '';

        return message.from === userInfo?.id
            ? 'You'
            : message.from === conversation.guest.id
                ? `${conversation.guest.firstName} ${conversation.guest.lastName}`
                : `${conversation.property.owner.firstName} ${conversation.property.owner.lastName}`;
    };

    const handleBack = () => {
        setActiveConversation(null);
    };

    return (
        <>
            <div style={customStyles.chatButton}>
                <Button
                    variant="success"
                    onClick={() => setShow(!show)}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative"
                >
                    {show ? <FaTimes size={24}/> : <FaComments size={24}/>}
                    {getTotalUnreadCount() > 0 && (
                        <Badge bg="danger" className="absolute -top-2 -right-2">
                            {getTotalUnreadCount()}
                        </Badge>
                    )}
                </Button>
            </div>

            {show && (
                <div style={customStyles.chatContainer}>
                    <MainContainer style={customStyles.mainContainer} responsive>
                        {!activeConversation ? (
                            <>
                                <ConversationHeader>
                                    <ConversationHeader.Content>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    isConnected ? 'bg-green-500' : 'bg-red-500'
                                                }`}
                                            />
                                            <span>Messages</span>
                                        </div>
                                    </ConversationHeader.Content>
                                </ConversationHeader>
                                <ConversationList>
                                    {bookingsWithConversations.map((booking) => {
                                        const otherParticipant = getOtherParticipant(booking);
                                        const lastMessage = booking.conversation.messages[booking.conversation.messages.length - 1];

                                        return (
                                            <Conversation
                                                key={booking.conversation.id}
                                                name={booking.property.name}
                                                lastSenderName={lastMessage ?
                                                    (lastMessage.from === userInfo?.id ? 'You' : otherParticipant.firstName)
                                                    : ''}
                                                info={lastMessage?.content || 'No messages yet'}
                                                onClick={() => handleConversationOpen(booking.conversation.id)}
                                            >
                                                <Avatar
                                                    src={otherParticipant.profilePicturePath}
                                                    name={otherParticipant.firstName}
                                                />
                                            </Conversation>
                                        );
                                    })}
                                </ConversationList>
                            </>
                        ) : (
                            <ChatContainer>
                                <ConversationHeader>
                                    <ConversationHeader.Back onClick={handleBack}>
                                        <FaArrowLeft/>
                                    </ConversationHeader.Back>
                                    <ConversationHeader.Content>
                                        {getConversationTitle(activeConversation)}
                                    </ConversationHeader.Content>
                                </ConversationHeader>

                                <MessageList>
                                    {bookingsWithConversations
                                        .find(b => b.conversation.id === activeConversation)
                                        ?.conversation.messages.map((msg, idx) => (
                                            <Message
                                                key={`${msg.from}-${msg.timestamp}-${idx}`}
                                                model={{
                                                    message: msg.content,
                                                    sentTime: new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }),
                                                    sender: getMessageSender(msg),
                                                    direction: msg.from === userInfo?.id ? 'outgoing' : 'incoming',
                                                    position: "single"
                                                }}
                                            >
                                                <Message.Footer>
                                                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                                                        {msg.from === userInfo?.id && (
                                                            msg.read ? (
                                                                <CheckCheck className="w-4 h-4 text-blue-500"/>
                                                            ) : (
                                                                <Check className="w-4 h-4 text-gray-400"/>
                                                            )
                                                        )}
                                                    </div>
                                                </Message.Footer>
                                            </Message>
                                        ))}
                                    {recipientTyping && (
                                        <TypingIndicator content="Someone is typing"/>
                                    )}
                                </MessageList>

                                <MessageInput
                                    placeholder="Type message here"
                                    value={newMessage}
                                    onChange={val => {
                                        setNewMessage(val);
                                        handleTyping();
                                    }}
                                    onSend={sendMessage}
                                    attachButton={false}
                                />
                            </ChatContainer>
                        )}
                    </MainContainer>
                </div>
            )}
        </>
    );
};

export default ChatFooter;