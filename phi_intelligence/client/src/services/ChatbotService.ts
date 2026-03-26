// ChatbotService.ts - phi_intelligence AI Chat Integration
// Based on phi-intelligence implementation with TypeScript enhancements

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  message: ChatMessage;
  conversationHistory: ChatMessage[];
  error?: string;
}

export interface ServiceStatus {
  available: boolean;
  processing: boolean;
  messageCount: number;
  lastMessage?: ChatMessage;
}

class ChatbotService {
  private conversationHistory: ChatMessage[];
  private isProcessing: boolean;

  constructor() {
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  // Initialize conversation with welcome message
  initializeConversation(): ChatMessage[] {
    if (this.conversationHistory.length === 0) {
      this.conversationHistory.push({
        id: this.generateId(),
        role: 'assistant',
        content: 'Hello! I\'m Phi AI, your intelligent business assistant. I can help you with AI solutions, automation strategies, and business optimization. How can I assist you today?',
        timestamp: new Date()
      });
    }
    return this.conversationHistory;
  }

  // Send message via BACKEND (not directly to OpenAI - CORS/Security fix)
  async sendMessage(userMessage: string): Promise<ChatResponse> {
    if (this.isProcessing) {
      throw new Error('Already processing a message. Please wait.');
    }

    if (!userMessage.trim()) {
      throw new Error('Message cannot be empty.');
    }

    this.isProcessing = true;

    try {
      // Add user message to conversation history
      const userMsg: ChatMessage = {
        id: this.generateId(),
        role: 'user',
        content: userMessage.trim(),
        timestamp: new Date()
      };
      this.conversationHistory.push(userMsg);

      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = this.conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Sending message via backend API:', userMessage);
      
      // Call BACKEND endpoint instead of OpenAI directly (fixes CORS + security)
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.trim(),
          conversationHistory: conversationHistory
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat response received from backend');
        
        // Add AI response to conversation history
        const aiMessage: ChatMessage = {
          id: this.generateId(),
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date()
        };
        this.conversationHistory.push(aiMessage);

        return {
          success: true,
          message: aiMessage,
          conversationHistory: this.conversationHistory
        };

      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Chat API Error:', errorData);
        
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        if (errorData.error) {
          errorMessage = `Error: ${errorData.error}`;
        }
        
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Chatbot service error:', error);
      
      // Add error message to conversation history
      const errorMsg: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      this.conversationHistory.push(errorMsg);

      return {
        success: false,
        message: errorMsg,
        conversationHistory: this.conversationHistory,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

    } finally {
      this.isProcessing = false;
    }
  }

  // Get conversation history
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearConversation(): ChatMessage[] {
    this.conversationHistory = [];
    this.initializeConversation();
    return this.conversationHistory;
  }

  // Get service status
  getStatus(): ServiceStatus {
    return {
      available: true,
      processing: this.isProcessing,
      messageCount: this.conversationHistory.length,
      lastMessage: this.conversationHistory[this.conversationHistory.length - 1]
    };
  }

  // Generate unique ID for messages
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

}

// Export singleton instance
export default new ChatbotService();
