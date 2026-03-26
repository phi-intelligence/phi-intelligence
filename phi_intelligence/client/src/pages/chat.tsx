import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  Plus,
  Search,
  PanelLeft,
  ChevronDown,
  Send,
  Copy,
  Share2,
  MoreHorizontal,
  Globe,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import ChatbotService, { type ChatMessage } from "@/services/ChatbotService";

/** Matches phi-blue (#00A3FF) treatment used in ServiceAnimations for logophi.png */
const PHI_LOGO_BLUE_FILTER =
  "brightness(0) saturate(100%) invert(44%) sepia(100%) saturate(1500%) hue-rotate(189deg)";

function PhiLogoMark({
  className,
  alt = "",
}: {
  className?: string;
  /** When set, image is exposed to assistive tech (e.g. sidebar home link). */
  alt?: string;
}) {
  return (
    <img
      src="/assets/logophi.png"
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("object-contain shrink-0", className)}
      style={{ filter: PHI_LOGO_BLUE_FILTER }}
    />
  );
}

function ChatSidebarContent({
  onNavigate,
  onNewChat,
}: {
  onNavigate?: () => void;
  onNewChat: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-phi-black text-white border-r border-white/8">
      <div className="p-3 border-b border-white/8 bg-black/40">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-phi-blue/[0.06] transition-colors"
        >
          <PhiLogoMark className="h-8 w-8 shrink-0" alt="Phi Intelligence" />
          <span className="text-sm font-bold tracking-tighter text-white leading-tight min-w-0">
            PHI{" "}
            <span className="text-phi-blue">INTELLIGENCE</span>
          </span>
        </Link>
      </div>

      <div className="p-2 space-y-2 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-phi-blue/[0.08] hover:border-phi-blue/30 text-sm font-medium h-10 px-3 text-white/90"
          onClick={() => {
            onNewChat();
            onNavigate?.();
          }}
        >
          <Plus className="h-4 w-4 shrink-0 text-phi-blue" />
          New chat
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            type="search"
            placeholder="Search chats"
            disabled
            className="w-full rounded-xl bg-white/[0.03] border border-white/8 pl-9 pr-3 py-2 text-sm text-white/35 placeholder:text-white/25 cursor-not-allowed"
            title="Coming soon"
          />
        </div>
      </div>

      <div className="px-3 pt-2 pb-1">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-phi-blue/50 px-2">
          Your chats
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="rounded-xl border border-phi-blue/25 bg-phi-blue/[0.06] px-3 py-2.5 text-sm text-white/90 truncate">
          Current conversation
        </div>
      </div>

      <div className="mt-auto border-t border-white/8 p-3 space-y-1 bg-black/30">
        <Link
          href="/contact"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-white/50 hover:text-phi-blue hover:bg-phi-blue/[0.06] transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Contact team
        </Link>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initRef = useRef(false);
  const processingInitialMessage = useRef(false);
  const lastProcessedMessage = useRef<string>("");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInitialMessage = useCallback(async (message: string) => {
    if (processingInitialMessage.current || lastProcessedMessage.current === message) {
      return;
    }

    processingInitialMessage.current = true;
    lastProcessedMessage.current = message;

    setIsTyping(true);

    try {
      const response = await ChatbotService.sendMessage(message);

      if (response.success && response.message) {
        setMessages(response.conversationHistory);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: response.error || "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Initial message error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      processingInitialMessage.current = false;
    }
  }, []);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      const initialMessages = ChatbotService.initializeConversation();
      setMessages(initialMessages);

      const urlParams = new URLSearchParams(window.location.search);
      const initialMessage = urlParams.get("message");

      if (initialMessage && initialMessage.trim()) {
        setTimeout(() => {
          handleInitialMessage(initialMessage);
        }, 100);
      }
    }
  }, [handleInitialMessage]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const messageText = inputValue.trim();
      if (!messageText || isSubmitting) return;

      setInputValue("");
      setIsSubmitting(true);
      setIsTyping(true);

      try {
        const response = await ChatbotService.sendMessage(messageText);

        if (response.success && response.message) {
          setMessages(response.conversationHistory);
        } else {
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: response.error || "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsSubmitting(false);
        setIsTyping(false);
      }
    },
    [inputValue, isSubmitting]
  );

  const handleNewChat = useCallback(() => {
    ChatbotService.clearConversation();
    const newMessages = ChatbotService.initializeConversation();
    setMessages(newMessages);
    lastProcessedMessage.current = "";
    inputRef.current?.focus();
    toast({ title: "New chat started" });
  }, [toast]);

  const visibleMessages = messages.filter((m) => m.role !== "system");

  const handleCopyMessage = useCallback(
    async (content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        toast({ title: "Copied to clipboard" });
      } catch {
        toast({ title: "Could not copy", variant: "destructive" });
      }
    },
    [toast]
  );

  const handleShareConversation = useCallback(async () => {
    const visible = messages.filter((m) => m.role !== "system");
    const text = visible
      .map((m) => `${m.role === "user" ? "You" : "Phi AI"}: ${m.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`${window.location.href}\n\n${text}`);
      toast({ title: "Link and transcript copied" });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  }, [messages, toast]);

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-black text-white selection:bg-phi-blue selection:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.06),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,rgba(0,163,255,0.04),transparent_40%)]" />

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isTyping && "Phi AI is typing..."}
      </div>

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden md:flex w-[260px] flex-shrink-0 flex-col">
        <ChatSidebarContent onNewChat={handleNewChat} />
      </aside>

      {/* Main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col bg-black/20 backdrop-blur-[2px]">
        {/* Top bar — left: menu · center: logo · right: actions */}
        <header className="grid h-12 flex-shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-white/8 px-2 sm:px-3 bg-black/60 backdrop-blur-md">
          <div className="flex items-center justify-start gap-1 min-w-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 text-white/60 hover:text-white hover:bg-phi-blue/10"
                  aria-label="Open sidebar"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 border-white/10 bg-phi-black">
                <ChatSidebarContent
                  onNavigate={() => setMobileOpen(false)}
                  onNewChat={handleNewChat}
                />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center justify-center gap-2 px-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg py-1 hover:opacity-90 transition-opacity"
            >
              <PhiLogoMark className="h-7 w-7 sm:h-8 sm:w-8" alt="Phi Intelligence" />
              <span className="hidden sm:inline text-sm font-bold tracking-tighter text-white">
                PHI <span className="text-phi-blue">AI</span>
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-white/50 hover:text-phi-blue hover:bg-phi-blue/10 rounded-lg"
                  aria-label="Assistant options"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-56 bg-[#0A0A0F] border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              >
                <DropdownMenuItem
                  disabled
                  className="text-white/45 focus:bg-phi-blue/10 focus:text-white"
                >
                  Default assistant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-end gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-white/50 hover:text-phi-blue hover:bg-phi-blue/10 text-xs gap-1.5 hidden sm:inline-flex"
              onClick={handleShareConversation}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white/50 hover:text-white hover:bg-phi-blue/10"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#0A0A0F] border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              >
                <DropdownMenuItem
                  className="focus:bg-phi-blue/10 focus:text-white cursor-pointer"
                  onClick={handleShareConversation}
                >
                  <Share2 className="h-4 w-4 mr-2 text-phi-blue/80" />
                  Copy transcript
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-phi-blue/10 focus:text-white cursor-pointer"
                  onClick={handleNewChat}
                >
                  <Plus className="h-4 w-4 mr-2 text-phi-blue/80" />
                  New chat
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="focus:bg-phi-blue/10 focus:text-white cursor-pointer">
                  <Link href="/contact">Contact team</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-phi-blue/10 focus:text-white cursor-pointer">
                  <Link href="/">Back to website</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="focus:bg-red-500/15 focus:text-red-300 cursor-pointer"
                  onClick={handleNewChat}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages — centered readable column */}
        <main
          className="flex-1 overflow-y-auto"
          role="log"
          aria-label="Chat messages"
        >
          <div className="mx-auto max-w-[768px] px-4 py-6">
            {visibleMessages.map((message) =>
              message.role === "assistant" ? (
                <div
                  key={message.id}
                  className="group border-b border-white/5 py-5 last:border-0"
                  role="article"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-phi-blue/10 border border-phi-blue/20">
                      <PhiLogoMark className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-[15px] leading-[1.65] text-white/85 font-light">
                        {message.content}
                      </p>
                      <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/35 hover:text-phi-blue hover:bg-phi-blue/10"
                          aria-label="Copy message"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={message.id}
                  className="flex justify-end py-4"
                  role="article"
                >
                  <div className="max-w-[85%] rounded-2xl border border-phi-blue/25 bg-phi-blue/[0.1] px-4 py-2.5 text-[15px] leading-[1.55] text-white/95">
                    <p className="whitespace-pre-wrap font-light">{message.content}</p>
                  </div>
                </div>
              )
            )}

            {isTyping && (
              <div className="flex gap-3 border-b border-white/5 py-5" role="status">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-phi-blue/10 border border-phi-blue/20">
                  <PhiLogoMark className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="flex gap-1">
                    {[0, 0.15, 0.3].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-phi-blue/60 animate-bounce"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Composer — matches home hero chat bar + pill-button send */}
        <div className="flex-shrink-0 border-t border-white/8 bg-black/60 backdrop-blur-md px-3 pb-4 pt-3">
          <form onSubmit={handleSubmit} className="mx-auto max-w-[768px]">
            <div className="flex min-h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 transition-all duration-300 hover:border-phi-blue/25 focus-within:border-phi-blue/50 focus-within:shadow-[0_0_40px_rgba(0,163,255,0.08)]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                className="h-9 w-9 shrink-0 rounded-full text-white/20"
                aria-hidden
                tabIndex={-1}
              >
                <Plus className="h-5 w-5" />
              </Button>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-phi-blue/50 shrink-0">
                <Globe className="h-3.5 w-3.5 text-phi-blue/40" />
                Phi AI
              </span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-white/85 placeholder:text-white/25 outline-none font-light"
                disabled={isSubmitting}
                aria-label="Message input"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !inputValue.trim()}
                className="pill-button h-9 shrink-0 rounded-full bg-phi-blue px-4 text-white hover:bg-phi-blue/90 shadow-[0_0_24px_rgba(0,163,255,0.2)] disabled:opacity-30 disabled:shadow-none"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-white/30 font-light px-2">
              Phi AI can make mistakes. Check important information.{" "}
              <Link
                href="/contact"
                className="text-phi-blue/70 underline-offset-2 hover:text-phi-blue hover:underline"
              >
                Contact us
              </Link>{" "}
              for business enquiries.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
