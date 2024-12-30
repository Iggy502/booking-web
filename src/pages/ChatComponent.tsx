// import React, {useEffect, useRef, useState} from 'react';
// import {io, Socket} from 'socket.io-client';
// import {Alert, Button, Form} from 'react-bootstrap';
// import {BookingService} from '../services/booking-service.ts';
// import {useAuth} from '../context/auth.context.tsx';
// import './ChatComponent.scss';
//
// interface Message {
//     content: string;
//     from: string;
//     to: string;
//     timestamp: Date;
// }
//
// interface ConversationViewModel {
//     id: string;
//     bookingId: string;
//     messages: Message[];
//     propertyTitle: string;
//     participants: string[];
// }
//
// const EmptyState: React.FC = () => (
//     <div className="chat-footer__empty-state">
//         <div className="text-center">
//             <i className="fa-solid fa-comments fa-3x mb-3"></i>
//             <h5>No Conversations Yet</h5>
//             <p className="text-muted">
//                 Book a property or wait for bookings to start chatting with hosts/guests
//             </p>
//         </div>
//     </div>
// );
//
// const ChatFooter: React.FC = () => {
//     const [show, setShow] = useState(false);
//     const [activeConversation, setActiveConversation] = useState<string | null>(null);
//     const [newMessage, setNewMessage] = useState('');
//     const [conversations, setConversations] = useState<ConversationViewModel[]>([]);
//     const [isTyping, setIsTyping] = useState(false);
//     const [recipientTyping, setRecipientTyping] = useState(false);
//     const [isConnected, setIsConnected] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//
//     const {userInfo, getAccessTokenCurrentUser} = useAuth();
//     const [currentUserId, setCurrentUserId] = useState<string>('');
//     const messagesEndRef = useRef<HTMLDivElement>(null);
//     const socketRef = useRef<Socket | null>(null);
//     const typingTimeoutRef = useRef<NodeJS.Timeout>();
//
//     useEffect(() => {
//         if (userInfo) setCurrentUserId(userInfo.id);
//     }, [userInfo]);
//
//     useEffect(() => {
//         const fetchBookingsForUser = async () => {
//             if (!currentUserId) return;
//
//             try {
//                 const userBookings = await BookingService.fetchBookingsByUser(currentUserId);
//                 const activeConversations: ConversationViewModel[] = userBookings
//                     .map(booking => ({
//                         ...booking.conversation,
//                         bookingId: booking.id,
//                         propertyTitle: booking.propertyTitle,
//                         participants: [booking.guestId, booking.hostId]
//                     }));
//
//                 setConversations(activeConversations);
//             } catch (error) {
//                 console.error('Error fetching user bookings:', error);
//                 setError('Failed to load conversations');
//             }
//         };
//
//         fetchBookingsForUser();
//     }, [currentUserId]);
//
//     useEffect(() => {
//         if (messagesEndRef.current) {
//             messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
//         }
//     }, [activeConversation, conversations]);
//
//     useEffect(() => {
//         if (!activeConversation || !currentUserId) return;
//
//         socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
//             path: '/socket.io',
//             auth: {token: getAccessTokenCurrentUser()}
//         });
//
//         socketRef.current.emit('joinRoom', activeConversation);
//
//         socketRef.current.on('connect', () => {
//             setIsConnected(true);
//             setError(null);
//         });
//
//         socketRef.current.on('disconnect', () => {
//             setIsConnected(false);
//             setError('Connection lost. Trying to reconnect...');
//         });
//
//         socketRef.current.on('messageReceived', (message: Message) => {
//             setConversations(prevConversations => {
//                 return prevConversations.map(conv => {
//                     if (conv.id === activeConversation) {
//                         return {
//                             ...conv,
//                             messages: [...conv.messages, message]
//                         };
//                     }
//                     return conv;
//                 });
//             });
//         });
//
//         socketRef.current.on('typing', (data: { userId: string; isTyping: boolean }) => {
//             if (data.userId !== currentUserId) {
//                 setRecipientTyping(data.isTyping);
//             }
//         });
//
//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.emit('leaveRoom', activeConversation);
//                 socketRef.current.disconnect();
//             }
//         };
//     }, [activeConversation, currentUserId, getAccessTokenCurrentUser]);
//
//     const handleTyping = () => {
//         if (!socketRef.current || !activeConversation) return;
//
//         socketRef.current.emit('typing', {
//             conversationId: activeConversation,
//             isTyping: true
//         });
//
//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);
//         }
//
//         typingTimeoutRef.current = setTimeout(() => {
//             socketRef.current?.emit('typing', {
//                 conversationId: activeConversation,
//                 isTyping: false
//             });
//         }, 2000);
//     };
//
//     const sendMessage = () => {
//         if (!newMessage.trim() || !socketRef.current || !activeConversation) return;
//
//         const activeConv = conversations.find(conv => conv.id === activeConversation);
//         if (!activeConv) return;
//
//         const recipientId = activeConv.participants.find(id => id !== currentUserId);
//         if (!recipientId) return;
//
//         const message = {
//             conversationId: activeConversation,
//             content: newMessage,
//             from: currentUserId,
//             to: recipientId,
//             timestamp: new Date()
//         };
//
//         socketRef.current.emit('sendMessage', message);
//         setNewMessage('');
//     };
//
//     return (
//         <div className="chat-footer">
//             <Button
//                 variant="success"
//                 onClick={() => setShow(!show)}
//                 className="chat-footer__trigger-btn rounded-circle"
//             >
//                 <i className={`fa-solid ${show ? 'fa-xmark' : 'fa-comment'}`}></i>
//             </Button>
//
//             {show && (
//                 <div className="chat-footer__popover">
//                     <div className="popover-header">
//                         <div className="d-flex align-items-center">
//                             <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}/>
//                             <h6 className="mb-0">
//                                 {activeConversation
//                                     ? conversations.find(c => c.id === activeConversation)?.propertyTitle
//                                     : 'Messages'}
//                             </h6>
//                         </div>
//                     </div>
//
//                     {error && (
//                         <Alert variant="danger" className="m-2 mb-0">
//                             {error}
//                         </Alert>
//                     )}
//
//                     {!activeConversation ? (
//                         <div className="chat-footer__messages-container">
//                             {conversations.length === 0 ? (
//                                 <EmptyState/>
//                             ) : (
//                                 conversations.map((conversation) => (
//                                     <div
//                                         key={conversation.id}
//                                         onClick={() => setActiveConversation(conversation.id)}
//                                         className="chat-footer__conversation-item"
//                                     >
//                                         <div className="chat-footer__conversation-item-title">
//                                             {conversation.propertyTitle}
//                                         </div>
//                                         <small className="text-muted">
//                                             {conversation.messages[conversation.messages.length - 1]?.content || 'No messages yet'}
//                                         </small>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     ) : (
//                         <>
//                             <div className="chat-footer__messages-container">
//                                 {conversations
//                                     .find(c => c.id === activeConversation)
//                                     ?.messages.map((message, index) => (
//                                         <div
//                                             key={index}
//                                             className={`chat-footer__message ${
//                                                 message.from === currentUserId
//                                                     ? 'chat-footer__message--outgoing'
//                                                     : 'chat-footer__message--incoming'
//                                             }`}
//                                         >
//                                             {message.content}
//                                             <small className="d-block mt-1 text-muted">
//                                                 {new Date(message.timestamp).toLocaleTimeString()}
//                                             </small>
//                                         </div>
//                                     ))}
//                                 {recipientTyping && (
//                                     <div className="chat-footer__message chat-footer__message--incoming">
//                                         <div className="typing-indicator">
//                                             <span>•</span>
//                                             <span>•</span>
//                                             <span>•</span>
//                                         </div>
//                                     </div>
//                                 )}
//                                 <div ref={messagesEndRef}/>
//                             </div>
//
//                             <div className="input-group">
//                                 <Form.Control
//                                     type="text"
//                                     value={newMessage}
//                                     onChange={(e) => {
//                                         setNewMessage(e.target.value);
//                                         handleTyping();
//                                     }}
//                                     onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//                                     placeholder="Type a message..."
//                                 />
//                                 <Button
//                                     variant="outline-success"
//                                     onClick={sendMessage}
//                                     disabled={!isConnected}
//                                 >
//                                     <i className="fa-solid fa-paper-plane"></i>
//                                 </Button>
//                             </div>
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };
//
// export default ChatFooter;