// Represents a single message in a conversation
export interface Message {
    timestamp: Date;   // Time message was sent
    read: boolean;     // Whether the message has been read
    conversationId: string; // ID of conversation
    from: string;      // User ID of sender
    to: string;        // User ID of recipient
    content: string;   // Message content
}

export interface MessageResponse extends Message {

}