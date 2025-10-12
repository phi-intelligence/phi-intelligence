import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from "wouter";
import { ArrowLeft, Send, Mic, Settings, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatbotService, { type ChatMessage } from "@/services/ChatbotService";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [location] = useLocation();
  
  // Use refs to track initialization and prevent double execution
  const initRef = useRef(false);
  const processingInitialMessage = useRef(false);
  const lastProcessedMessage = useRef<string>('');

  // Normalize timestamp helper
  const normalizeTimestamp = (timestamp: Date | string): Date => {
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) return timestamp;
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date;
    }
    return new Date();
  };

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize conversation only once
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      const initialMessages = ChatbotService.initializeConversation();
      setMessages(initialMessages);
      
      // Process URL parameter after initialization
      const urlParams = new URLSearchParams(window.location.search);
      const initialMessage = urlParams.get('message');
      
      if (initialMessage && initialMessage.trim()) {
        // Small delay to ensure state is settled
        setTimeout(() => {
          handleInitialMessage(initialMessage);
        }, 100);
      }
    }
  }, []);

  // Handle initial message from URL
  const handleInitialMessage = useCallback(async (message: string) => {
    // Prevent double processing
    if (processingInitialMessage.current || lastProcessedMessage.current === message) {
      return;
    }
    
    processingInitialMessage.current = true;
    lastProcessedMessage.current = message;
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get AI response (ChatbotService will handle adding user message to conversation history)
      const response = await ChatbotService.sendMessage(message);
      
      if (response.success && response.message) {
        // Update messages with the complete conversation history from the service
        setMessages(response.conversationHistory);
      } else {
        // Handle error
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: response.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Initial message error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      processingInitialMessage.current = false;
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const messageText = inputValue.trim();
    if (!messageText || isSubmitting) return;
    
    // Clear input immediately
    setInputValue('');
    setIsSubmitting(true);
    setIsTyping(true);
    
    try {
      // Get AI response (ChatbotService will handle adding user message to conversation history)
      const response = await ChatbotService.sendMessage(messageText);
      
      if (response.success && response.message) {
        // Update messages with the complete conversation history from the service
        setMessages(response.conversationHistory);
      } else {
        // Handle error
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: response.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSubmitting(false);
      setIsTyping(false);
    }
  }, [inputValue, isSubmitting]);

  // Format time helper
  const formatTime = (date: Date | string) => {
    const normalizedDate = normalizeTimestamp(date);
    return normalizedDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Clear chat handler
  const handleClearChat = useCallback(() => {
    ChatbotService.clearConversation();
    const newMessages = ChatbotService.initializeConversation();
    setMessages(newMessages);
    lastProcessedMessage.current = '';
    inputRef.current?.focus();
  }, []);

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {isTyping && "Phi AI is typing..."}
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/95 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Phi AI Chat</h1>
                  <p className="text-sm text-white/60">Intelligent AI Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={handleClearChat}
                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
                title="Clear Chat"
                aria-label="Clear chat history"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
                title="Voice Chat (Coming Soon)"
                aria-label="Voice chat"
                disabled
              >
                <Mic className="h-5 w-5 opacity-50" />
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
                title="Settings (Coming Soon)"
                aria-label="Settings"
                disabled
              >
                <Settings className="h-5 w-5 opacity-50" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto" role="log" aria-label="Chat messages">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              role="article"
              aria-label={`${message.role === 'user' ? 'You' : 'Phi AI'}: ${message.content.substring(0, 50)}...`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col space-y-1 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-white/40" aria-label="Message time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start" role="status" aria-label="Phi AI is typing">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="bg-white/10 text-white px-4 py-3 rounded-2xl border border-white/20">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white/80 mr-2">Phi AI is typing</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" 
                          style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" 
                          style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <div className="border-t border-white/10 bg-black/95 backdrop-blur-sm sticky bottom-0 z-50 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message Phi AI..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-colors duration-200"
                disabled={isSubmitting}
                aria-label="Type your message"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !inputValue.trim()}
              className="bg-white text-black px-6 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}