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
  private apiUrl: string;
  private model: string;
  private apiKey: string;
  private conversationHistory: ChatMessage[];
  private isProcessing: boolean;

  constructor() {
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini';
    this.apiKey = ''; // Will be loaded from API
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  // Initialize API key from backend
  async initializeApiKey(): Promise<void> {
    try {
      const response = await fetch('/api/openai/key');
      const data = await response.json();
      this.apiKey = data.apiKey;
      console.log('✅ OpenAI API key loaded from Key Vault');
    } catch (error) {
      console.warn('Failed to load API key from Key Vault, using environment variable');
      this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    }
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

  // Send message to OpenAI and get response
  async sendMessage(userMessage: string): Promise<ChatResponse> {
    if (this.isProcessing) {
      throw new Error('Already processing a message. Please wait.');
    }

    if (!userMessage.trim()) {
      throw new Error('Message cannot be empty.');
    }

    // Initialize API key if not already done
    if (!this.apiKey) {
      await this.initializeApiKey();
    }

    if (!this.isAvailable()) {
      throw new Error('Chatbot service is not available. Please check your configuration.');
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

      // Prepare messages for OpenAI API
      const messages = [
        {
          role: 'system' as const,
          content: 'You are Phi Intelligence, a professional AI assistant specializing in AI solutions, business automation, workforce management, and industrial automation. You help businesses optimize operations, reduce costs, and implement AI solutions. Provide helpful, accurate, and concise responses. Use a friendly but professional tone. Keep responses under 150 words unless the user asks for detailed information. Focus on practical business applications and ROI.'
        },
        // Include recent conversation history (last 10 messages for context)
        ...this.conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      console.log('Sending message to OpenAI:', userMessage);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500, // Reduced for live chat
          stream: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('OpenAI response received:', data);
        
        // Add AI response to conversation history
        const aiMessage: ChatMessage = {
          id: this.generateId(),
          role: 'assistant',
          content: data.choices[0].message.content,
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
        console.error('OpenAI API Error:', errorData);
        
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        if (errorData.error?.type === 'insufficient_quota') {
          errorMessage = 'API quota exceeded. Please check your OpenAI account.';
        } else if (errorData.error?.type === 'invalid_api_key') {
          errorMessage = 'Invalid API key. Please check your configuration.';
        } else if (errorData.error?.message) {
          errorMessage = `Error: ${errorData.error.message}`;
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

  // Check if service is available
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== '' && this.apiKey !== 'your-api-key-here';
  }

  // Get service status
  getStatus(): ServiceStatus {
    return {
      available: this.isAvailable(),
      processing: this.isProcessing,
      messageCount: this.conversationHistory.length,
      lastMessage: this.conversationHistory[this.conversationHistory.length - 1]
    };
  }

  // Generate unique ID for messages
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Update API configuration (for development/testing)
  updateConfig(config: { apiKey?: string; model?: string; apiUrl?: string }): void {
    if (config.apiKey !== undefined) this.apiKey = config.apiKey;
    if (config.model !== undefined) this.model = config.model;
    if (config.apiUrl !== undefined) this.apiUrl = config.apiUrl;
  }
}

// Export singleton instance
export default new ChatbotService();
