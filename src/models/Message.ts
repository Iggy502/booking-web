// Represents a single message in a conversation
export interface Message {
    from: string;      // User ID of sender
    to: string;        // User ID of recipient
    content: string;   // Message content
}

export interface MessageResponse extends Message {
    
}