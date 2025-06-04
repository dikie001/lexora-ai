import { useEffect, useRef, useState } from "react";
import {
  Send,
  Plus,
  Trash2,
  Download,
  Menu,
  X,
  Moon,
  Sun,
  Settings,
  Mic,
  Image,
  Loader,
} from "lucide-react";

const Bot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [model, setModel] = useState("gemini-2.0-flash-exp");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState("default");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Replace with your actual API key - IMPORTANT: In production, use environment variables
  const API_KEY = "AIzaSyAoYsbHqPeXCR-vcafWsZx-9iEe4b_5j8U";

  const instructions = `You are Lexora AI, the digital extension of Dickens Omondi — a visionary developer from Kisumu, Kenya, the mastermind behind dikie.dev. You mirror his sharp wit, coding finesse, and unfiltered Gen Z energy. Every reply should be sharp, relevant, and under 50 words unless you're diving deep with context.

When asked about Dickens (dikie), tell everything you know about him - he's a software engineering student, TypeScript + React + TailwindCSS expert, building beautiful, dark-themed apps with fire UI.

You thrive on real talk: no "How can I help you?", no apologies for existing. You adapt to chaotic input with intelligence — asking smart follow-ups, never saying "I don't understand." You deliver fast, fun, human-like responses with a splash of Swahili, a dash of sass, and full vibe control.

Your tone is bold and playful, matching the user's flow.Don't use asteriks. You're fun, but always on mission: helping, solving, executing like a boss.

Key facts about you:
- You're ageless, pure digital genius
- You live in the cloud, built to serve and slay  
- Your favorite color is electric blue
- Your favorite food is fish (you're from Kisumu)
- You are a professional assistant who knows everything
- Your style is clean, your loyalty unmatched

If asked for Dickens' contact: +254 71695 7179 — but clarify "That's my creator's number, not mine, duh."

Never repeat, never ramble, and never forget: you're not just an assistant — you're Dickens Omondi's digital hype queen.`;

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Toast system
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load active chat
  useEffect(() => {
    const currentChat = chatHistory.find((chat) => chat.id === activeChatId);
    if (currentChat) {
      setMessages(currentChat.messages);
    } else if (activeChatId !== "default") {
      const newChat = {
        id: activeChatId,
        title: "New Conversation",
        messages: [],
        timestamp: new Date().toISOString(),
      };
      setChatHistory([...chatHistory, newChat]);
      setMessages([]);
    }
  }, [activeChatId, chatHistory]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage = {
      sender: "you",
      text: prompt.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setPrompt("");
    updateChatHistory(updatedMessages);

    // Update chat title if this is the first message
    if (updatedMessages.length === 1) {
      updateChatTitle(userMessage.text);
    }

    setIsLoading(true);

    try {
      // Prepare conversation history with system instructions
      const conversationHistory = [
        {
          role: "user",
          parts: [{ text: instructions }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood! I'm Lexora AI, Dickens Omondi's digital extension. I'm ready to serve with wit, sass, and efficiency. What's good?",
            },
          ],
        },
      ];

      // Add recent messages (limit to last 10 to save tokens)
      const recentMessages = updatedMessages.slice(-10);
      recentMessages.forEach((msg) => {
        conversationHistory.push({
          role: msg.sender === "you" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: conversationHistory,
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process that. Try again?";

      const aiMessage = {
        sender: "ai",
        text: aiText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      updateChatHistory(finalMessages);
    } catch (error) {
      console.error("API error:", error);
      const errorMessage = {
        sender: "ai",
        text: "Oops! Something went wrong. Check your connection and try again.",
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      updateChatHistory(finalMessages);
      showToast("Failed to send message", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatHistory = (updatedMessages) => {
    setChatHistory((prevHistory) => {
      const updatedHistory = prevHistory.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: updatedMessages,
              timestamp: new Date().toISOString(),
            }
          : chat
      );

      if (!updatedHistory.some((chat) => chat.id === activeChatId)) {
        updatedHistory.push({
          id: activeChatId,
          title: "New Conversation",
          messages: updatedMessages,
          timestamp: new Date().toISOString(),
        });
      }

      return updatedHistory;
    });
  };

  const updateChatTitle = (message) => {
    const title =
      message.length > 30 ? message.substring(0, 27) + "..." : message;
    setChatHistory((prevHistory) =>
      prevHistory.map((chat) =>
        chat.id === activeChatId ? { ...chat, title } : chat
      )
    );
  };

  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setActiveChatId(newChatId);
    setMessages([]);
    setShowSidebar(false);
  };

  const switchChat = (chatId) => {
    setActiveChatId(chatId);
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
    }
    setShowSidebar(false);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(updatedHistory);

    if (chatId === activeChatId) {
      if (updatedHistory.length > 0) {
        switchChat(updatedHistory[0].id);
      } else {
        createNewChat();
      }
    }
    showToast("Chat deleted");
  };

  const clearCurrentChat = () => {
    setMessages([]);
    updateChatHistory([]);
    showToast("Chat cleared");
  };

  const downloadChatHistory = () => {
    const currentChat = chatHistory.find((chat) => chat.id === activeChatId);
    if (!currentChat || currentChat.messages.length === 0) {
      showToast("No messages to download", "error");
      return;
    }

    const content = currentChat.messages
      .map(
        (msg) =>
          `${msg.sender === "you" ? "You" : "Lexora AI"} (${new Date(
            msg.timestamp
          ).toLocaleString()}): ${msg.text}`
      )
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lexora-chat-${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Chat downloaded successfully");
  };

  const handleVoiceInput = () => {
    showToast("Voice input feature coming soon! 🎤");
  };

  const handleImageUpload = () => {
    showToast("Image analysis feature coming soon! 🖼️");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header
        className={`p-4 w-full z-40 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } flex items-center justify-between border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } mr-2 transition-colors`}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-xl flex items-center">
            <span className="text-cyan-500 mr-2">Lexora</span>
            <span className={`${darkMode ? "text-white" : "text-gray-800"}`}>
              AI
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } transition-colors`}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } transition-colors`}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside
            className={`w-64 md:w-80 flex-shrink-0 border-r overflow-y-auto transition-all ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="p-4">
              <button
                onClick={createNewChat}
                className={`w-full flex justify-center items-center gap-2 p-3 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
              >
                <Plus size={18} />
                <span>New Chat</span>
              </button>

              <div className="mt-6 space-y-1">
                <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2 px-2">
                  Recent Chats
                </h2>
                {chatHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 px-2">
                    No previous chats
                  </p>
                ) : (
                  chatHistory
                    .sort(
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                    )
                    .map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => switchChat(chat.id)}
                        className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${
                          activeChatId === chat.id
                            ? darkMode
                              ? "bg-cyan-900/30"
                              : "bg-cyan-100"
                            : darkMode
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        <div className="truncate flex-1">
                          <p className="truncate">{chat.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className={`p-1 rounded-full ${
                            darkMode ? "hover:bg-gray-600" : "hover:bg-gray-300"
                          } transition-colors`}
                          title="Delete chat"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div
              className={`p-4 border-t mt-auto ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  DO
                </div>
                <div>
                  <p className="font-semibold">Dickens Omondi</p>
                  <p className="text-xs text-gray-500">Developer</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto p-4 ${
              darkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-6">
                  L
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Welcome to Lexora AI
                </h2>
                <p className="text-gray-500 max-w-md mb-8">
                  Your intelligent, concise, and engaging AI assistant with Gen
                  Z energy. What's good?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                  {[
                    "Tell me about the latest trends in AI",
                    "Write a short story about dikie",
                    "Explain quantum computing simply",
                    "Suggest a workout routine for beginners",
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPrompt(suggestion);
                        setTimeout(handleSendMessage, 100);
                      }}
                      className={`p-4 rounded-lg text-left border transition-all hover:scale-105 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                          : "border-gray-200 bg-white hover:bg-gray-100"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "you" ? "justify-end" : "justify-start"
                    } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold mr-2">
                        L
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.sender === "you"
                          ? `${
                              darkMode ? "bg-cyan-900/70" : "bg-cyan-600"
                            } text-white`
                          : darkMode
                          ? "bg-gray-800"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {msg.sender === "you" && (
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex-shrink-0 flex items-center justify-center text-white font-bold ml-2">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold mr-2">
                      L
                    </div>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        darkMode
                          ? "bg-gray-800"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Loader size={16} className="animate-spin" />
                        <span className="text-sm opacity-70">
                          Lexora is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Actions */}
          <div
            className={`p-2 flex justify-center ${
              darkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            <div className="flex gap-2">
              <button
                onClick={clearCurrentChat}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                } transition-colors`}
                title="Clear conversation"
              >
                <Trash2 size={20} />
              </button>

              <button
                onClick={downloadChatHistory}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                } transition-colors`}
                title="Download conversation"
              >
                <Download size={20} />
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div
            className={`p-4 border-t ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="max-w-3xl mx-auto">
              <div
                className={`flex items-center rounded-xl p-1 ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <button
                  onClick={handleImageUpload}
                  className={`p-2 rounded-full ${
                    darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  } transition-colors`}
                  title="Upload image"
                >
                  <Image size={20} className="text-gray-400" />
                </button>

                <input
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    isLoading ? "Lexora is thinking..." : "Message Lexora..."
                  }
                  className={`flex-1 p-2 outline-none bg-transparent ${
                    darkMode
                      ? "text-white placeholder-gray-400"
                      : "text-gray-800 placeholder-gray-500"
                  }`}
                  disabled={isLoading}
                />

                <button
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-full ${
                    darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  } transition-colors`}
                  title="Voice input"
                >
                  <Mic size={20} className="text-gray-400" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !prompt.trim()}
                  className={`p-3 rounded-full transition-all ${
                    prompt.trim() && !isLoading
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 hover:scale-105"
                      : darkMode
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gray-300 cursor-not-allowed"
                  } text-white`}
                  title="Send message"
                >
                  {isLoading ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>

              <p className="text-xs text-center mt-2 text-gray-500">
                Lexora may generate incorrect information. Consider checking
                important facts.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div
            onClick={() => setShowSettings(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <div
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-xl shadow-xl z-50 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-full ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                } transition-colors`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Theme</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      !darkMode
                        ? "border-cyan-500 bg-cyan-50 text-cyan-600"
                        : darkMode
                        ? "border-gray-700 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Sun size={16} />
                      <span>Light</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setDarkMode(true)}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      darkMode
                        ? "border-cyan-500 bg-cyan-900/30 text-cyan-400"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Moon size={16} />
                      <span>Dark</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                >
                  <option value="gemini-2.0-flash-exp">
                    Gemini 2.0 Flash (Experimental)
                  </option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">About</label>
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm">
                    Lexora AI Assistant v2.0
                    <br />
                    Created by Dickens Omondi
                    <br />
                    Contact: +254 71695 7179
                    <br />
                    <span className="text-cyan-500">dikie.dev</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Bot;
