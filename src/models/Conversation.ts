// Represents a conversation between property owner and guest
import {Message} from "./Message.ts";

export interface Conversation {
    id: string;           // Unique identifier for the conversation
    active: boolean;      // Whether the conversation is active
    messages: Message[];  // Array of messages in the conversation
}