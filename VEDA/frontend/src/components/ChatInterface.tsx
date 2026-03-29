"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { useTheme } from "@/components/ThemeContext";
import ThreeScene from "./ThreeScene";
import MarkdownRenderer from "./MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

// Memoized message bubble component
const MessageBubble = memo(function MessageBubble({
  msg,
}: {
  msg: Message;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
          style={{
            background: isUser
              ? "var(--veda-avatar-user-bg)"
              : "var(--veda-avatar-ai-bg)",
            border: isUser ? "none" : "1px solid var(--veda-avatar-ai-border)",
            fontSize: "12px",
            fontWeight: 600,
            color: isUser ? "#fff" : "var(--veda-avatar-ai-color)",
          }}
        >
          {isUser ? "Y" : "V"}
        </div>

        {/* Message content */}
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: isUser
              ? "var(--veda-msg-user-bg)"
              : "var(--veda-msg-ai-bg)",
            border: `1px solid ${isUser ? "var(--veda-msg-user-border)" : "var(--veda-msg-ai-border)"}`,
            borderTopRightRadius: isUser ? "4px" : "16px",
            borderTopLeftRadius: isUser ? "16px" : "4px",
          }}
        >
          {isUser ? (
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: "var(--veda-text)" }}>
              {msg.content}
            </p>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}
          <div
            className="mt-1.5 text-right"
            style={{ fontSize: "10px", color: "var(--veda-text-dim)" }}
          >
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Theme toggle button component
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-200"
      style={{ color: "var(--veda-text-muted)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--veda-accent-soft)";
        e.currentTarget.style.color = "var(--veda-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--veda-text-muted)";
      }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        /* Sun icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function ChatInterface() {
  const { user, logout } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "default",
      title: "New Chat",
      messages: [
        {
          role: "assistant",
          content: "Hello! I'm **VEDA**, your autonomous AI assistant. How can I help you today?\n\nI can help with:\n- 💡 Answering questions\n- 🧮 Math calculations\n- 🔍 Web searches\n- 💻 Code generation",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ]);
  const [activeConvId, setActiveConvId] = useState("default");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const messages = activeConv?.messages || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const createNewChat = useCallback(() => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id,
      title: "New Chat",
      messages: [
        {
          role: "assistant",
          content: "Hello! How can I assist you?",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(id);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isThinking) return;

      const userMsg: Message = { role: "user", content: input.trim(), timestamp: new Date() };
      const currentInput = input.trim();
      setInput("");

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvId) return c;
          const updated = { ...c, messages: [...c.messages, userMsg] };
          if (c.title === "New Chat") {
            updated.title = currentInput.slice(0, 40) + (currentInput.length > 40 ? "..." : "");
          }
          return updated;
        })
      );

      setIsThinking(true);

      try {
        const response = await api.sendMessage(currentInput);
        const assistantMsg: Message = {
          role: "assistant",
          content: response.output,
          timestamp: new Date(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId ? { ...c, messages: [...c.messages, assistantMsg] } : c
          )
        );
      } catch {
        const errorMsg: Message = {
          role: "assistant",
          content: "⚠️ I encountered an error while processing your request. Please check that the backend is running and try again.",
          timestamp: new Date(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId ? { ...c, messages: [...c.messages, errorMsg] } : c
          )
        );
      } finally {
        setIsThinking(false);
      }
    },
    [input, isThinking, activeConvId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--veda-bg)", transition: "background 0.3s ease" }}>
      {/* ═══ Sidebar ═══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full flex-shrink-0 overflow-hidden"
            style={{
              background: "var(--veda-sidebar-bg)",
              borderRight: "1px solid var(--veda-border)",
              transition: "background 0.3s ease",
            }}
          >
            {/* Sidebar header */}
            <div className="p-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--veda-border)" }}>
              <button
                onClick={createNewChat}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--veda-accent-soft)",
                  border: "1px solid rgba(108,92,231,0.15)",
                  color: "#a29bfe",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(108,92,231,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--veda-accent-soft)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-all duration-150"
                  style={{
                    background: conv.id === activeConvId ? "var(--veda-accent-soft)" : "transparent",
                    color: conv.id === activeConvId ? "var(--veda-text)" : "var(--veda-text-muted)",
                    border: conv.id === activeConvId ? "1px solid rgba(108,92,231,0.12)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (conv.id !== activeConvId) {
                      e.currentTarget.style.background = "var(--veda-msg-ai-bg)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (conv.id !== activeConvId) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.5 }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="truncate">{conv.title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* User info */}
            <div
              className="p-3 flex items-center gap-3"
              style={{ borderTop: "1px solid var(--veda-border)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--veda-avatar-user-bg)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--veda-text)" }}>
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] truncate" style={{ color: "var(--veda-text-dim)" }}>
                  {user?.email || ""}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md transition-all"
                style={{ color: "var(--veda-text-dim)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--veda-rose)";
                  e.currentTarget.style.background = "rgba(253,121,168,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--veda-text-dim)";
                  e.currentTarget.style.background = "transparent";
                }}
                title="Sign out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══ Main Area ═══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{
            height: "56px",
            borderBottom: "1px solid var(--veda-border)",
            background: "var(--veda-header-bg)",
            backdropFilter: "blur(12px)",
            transition: "background 0.3s ease",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-all duration-150"
            style={{ color: "var(--veda-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--veda-msg-ai-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: isThinking ? "var(--veda-cyan)" : "var(--veda-green)",
                boxShadow: `0 0 6px ${isThinking ? "var(--veda-cyan-soft)" : "rgba(0,184,148,0.3)"}`,
              }}
            />
            <h1
              className="text-sm font-semibold tracking-wide truncate"
              style={{ color: "var(--veda-text)" }}
            >
              VEDA AI
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,184,148,0.1)", color: "var(--veda-green)" }}>
              {isThinking ? "Thinking..." : "Online"}
            </span>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />
        </header>

        {/* 3D Orb */}
        <ThreeScene isThinking={isThinking} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} msg={msg} />
          ))}

          {isThinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3 items-start">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--veda-avatar-ai-bg)",
                    border: "1px solid var(--veda-avatar-ai-border)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--veda-avatar-ai-color)",
                  }}
                >
                  V
                </div>
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: "var(--veda-msg-ai-bg)",
                    border: "1px solid var(--veda-msg-ai-border)",
                    borderTopLeftRadius: "4px",
                  }}
                >
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 flex justify-center" style={{ borderTop: "1px solid var(--veda-border)" }}>
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-3xl"
          >
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: "var(--veda-input-bg)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--veda-border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                transition: "background 0.3s ease, border-color 0.3s ease",
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VEDA anything... (Shift+Enter for new line)"
                rows={1}
                className="w-full bg-transparent px-5 py-3.5 pr-14 text-[0.9375rem] resize-none focus:outline-none"
                style={{
                  color: "var(--veda-text)",
                  maxHeight: "160px",
                  lineHeight: "1.5",
                }}
              />
              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-xl transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !isThinking
                    ? "linear-gradient(135deg, #6c5ce7, #a29bfe)"
                    : "var(--veda-input-field-bg)",
                  boxShadow: input.trim() && !isThinking ? "0 2px 8px var(--veda-accent-glow)" : "none",
                }}
              >
                {isThinking ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center mt-2" style={{ fontSize: "10px", color: "var(--veda-text-dim)" }}>
              VEDA may produce inaccurate information. Verify important outputs.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
