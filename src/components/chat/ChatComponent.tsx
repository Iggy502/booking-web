import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {Button} from 'react-bootstrap';
import {useAuth} from '../../context/auth.context.tsx';
import {BookingChat} from '../../models/Booking.ts';
import {Message as ChatMessage} from '../../models/Message.ts';
import {FaArrowLeft, FaComments} from 'react-icons/fa';
import {Check, CheckCheck} from 'lucide-react';
import './ChatComponent.scss';

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
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import SocketService from "../../services/socket.service.ts";

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

    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);


    const messageListRef = useRef<HTMLDivElement>(null);
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

        SocketService.initialize(socketRef.current);

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
    }, [accessToken, userInfo?.id]);

    // Socket message handlers
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on('messageReceived', (message: ChatMessage) => {
            if (message.to === userInfo?.id && (!show || message.conversationId !== activeConversation)) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [message.conversationId]: (prev[message.conversationId] || 0) + 1
                }));

                setTotalUnreadCount(prev => prev + 1);
            }

            setBookingsWithConversations(prev => {
                const conversationExists = prev.some(conv => conv.conversation.id === message.conversationId);
                if (!conversationExists) return prev;

                return prev.map(conv => {
                    if (conv.conversation.id === message.conversationId) {
                        if (activeConversation === message.conversationId && message.to === userInfo?.id) {
                            socketRef.current?.emit('openChat', message.conversationId);
                        }

                        return {
                            ...conv,
                            conversation: {
                                ...conv.conversation,
                                messages: [...conv.conversation.messages, {
                                    ...message,
                                    read: activeConversation === message.conversationId && message.to === userInfo?.id
                                }]
                            }
                        };
                    }
                    return conv;
                });
            });
        });


        socketRef.current.on('bookingsUpdated', (updatedBookings: BookingChat[]) => {
            setBookingsWithConversations(updatedBookings);

            // Calculate unread count using updatedBookings directly
            const newTotalUnread = updatedBookings.reduce((total, booking) => {
                return total + booking.conversation.messages.filter(msg =>
                    !msg.read && msg.to === userInfo?.id
                ).length;
            }, 0);

            console.log('Updated Bookings:', updatedBookings);
            console.log('Calculating unread messages for user:', userInfo?.id);
            console.log('New total unread:', newTotalUnread);

            setTotalUnreadCount(newTotalUnread);

            // Update individual conversation unread counts
            const newUnreadCounts = updatedBookings.reduce((counts, booking) => {
                counts[booking.conversation.id] = booking.conversation.messages.filter(
                    msg => !msg.read && msg.to === userInfo?.id
                ).length;
                return counts;
            }, {} as Record<string, number>);

            setUnreadCounts(newUnreadCounts);
        });

        // In your socket message handlers useEffect
        socketRef.current.on('typing', ({userId, isTyping}) => {
            // Only show typing indicator if the other person is typing
            if (userId !== userInfo?.id) {
                setRecipientTyping(isTyping);
                // Add a safety timeout to ensure the typing indicator disappears
                if (isTyping) {
                    setTimeout(() => {
                        setRecipientTyping(false);
                    }, 3000);
                }
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
                                    read: msg.read || msg.to === userId    // Mark all messages to the other user as read
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
    }, [userInfo?.id, show, activeConversation, bookingsWithConversations]);

    useEffect(() => {
        console.log('Bookings with conversations:', bookingsWithConversations);
        console.log(`totalUnreadCount: ${totalUnreadCount}`);

    }, [bookingsWithConversations]);

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
            if (!response.success) {
                console.error('Failed to send message:', response.error);
                setNewMessage(message.content);
            }
        });
    };

    const handleConversationOpen = (conversationId: string) => {
        setActiveConversation(conversationId);

        socketRef.current?.emit('openChat', conversationId);

        setTotalUnreadCount(prev => prev - (unreadCounts[conversationId] || 0));
        setUnreadCounts(prev => ({...prev, [conversationId]: 0}));
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
            <div className="chat-button-wrapper">
                <Button
                    variant="success"
                    onClick={() => setShow(!show)}
                >
                    <FaComments size={24}/>
                </Button>
                {totalUnreadCount > 0 && (
                    <div className="unread-badge">
                        {totalUnreadCount}
                    </div>
                )}
            </div>

            {show && (
                <div style={customStyles.chatContainer}>
                    <MainContainer style={customStyles.mainContainer} responsive>
                        {!activeConversation ? (
                            <>
                                <div className="chat-list-container">
                                    <div className="chat-header">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className={`connection-indicator ${isConnected ? 'connected' : ''}`}/>
                                            <span className="header-title">Booking Chats</span>
                                        </div>
                                    </div>
                                </div>
                                <ConversationList>
                                    {bookingsWithConversations.map((booking) => {
                                        const otherParticipant = getOtherParticipant(booking);
                                        const lastMessage = booking.conversation.messages[booking.conversation.messages.length - 1];

                                        return (
                                            <Conversation
                                                key={booking.conversation.id}
                                                name={
                                                    <>
                                                        <span>{booking.property.name}</span>
                                                        {unreadCounts[booking.conversation.id] > 0 && (
                                                            <span
                                                                className="unread-dot">{unreadCounts[booking.conversation.id]}</span>
                                                        )}
                                                    </>
                                                }
                                                lastSenderName={lastMessage ?
                                                    (lastMessage.from === userInfo?.id ? 'You' : otherParticipant.firstName)
                                                    : ''}
                                                info={
                                                    <span
                                                        className={`${unreadCounts[booking.conversation.id] > 0 ? 'fw-bold' : ''} conv-prev-text`}>
                                                          {lastMessage?.content || 'No messages yet'}
                                                    </span>
                                                }
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
                                    <ConversationHeader.Back>
                                        <Button variant="link" className={"d-flex"} onClick={handleBack}>
                                            <FaArrowLeft/>
                                        </Button>
                                    </ConversationHeader.Back>
                                    <ConversationHeader.Content>
                                        {getConversationTitle(activeConversation)}
                                    </ConversationHeader.Content>
                                </ConversationHeader>

                                <MessageList ref={messageListRef}>
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
                                        <div className="typing-indicator-container">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
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