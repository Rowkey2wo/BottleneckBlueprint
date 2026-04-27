"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function AIChatBot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [specs, setSpecs] = useState<any>(null);
  const [conversationState, setConversationState] = useState<any>({});
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const noSpeechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stores the finalized words so interim words can be appended on top
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const initSpeechRecognition = () => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsBrowserSupported(false);
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;   // keep listening until user stops
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setMicError(null);
          finalTranscriptRef.current = "";

          if (noSpeechTimeoutRef.current)
            clearTimeout(noSpeechTimeoutRef.current);

          noSpeechTimeoutRef.current = setTimeout(() => {
            recognition.stop();
          }, 15000);
        };

        recognition.onresult = (event: any) => {
          // Reset the no-speech timeout on every result
          if (noSpeechTimeoutRef.current)
            clearTimeout(noSpeechTimeoutRef.current);
          noSpeechTimeoutRef.current = setTimeout(() => {
            recognition.stop();
          }, 5000);

          let interimText = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              // Add finalized words to the ref
              finalTranscriptRef.current += transcript + " ";
            } else {
              interimText += transcript;
            }
          }

          // Show final + interim words live in the input box
          setInput((finalTranscriptRef.current + interimText).trim());
        };

        recognition.onerror = (event: any) => {
          let errorMessage = `Error: ${event.error}`;
          if (event.error === "network")
            errorMessage = "Mic needs internet to work. Please check your connection.";
          else if (event.error === "no-speech")
            errorMessage = "No speech detected. Please speak clearly.";
          else if (event.error === "audio-capture")
            errorMessage = "Microphone not found or not accessible.";
          else if (event.error === "not-allowed")
            errorMessage = "Microphone permission denied. Allow it in your browser settings.";

          setMicError(errorMessage);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          // Keep whatever was transcribed in the input box
        };

        recognitionRef.current = recognition;
      } catch (error) {
        setIsBrowserSupported(false);
      }
    };

    initSpeechRecognition();

    const savedSpecs = sessionStorage.getItem("selectedSpecs");
    if (savedSpecs) {
      const parsedSpecs = JSON.parse(savedSpecs);
      setSpecs(parsedSpecs);

      const initialMessage: Message = {
        id: "1",
        type: "bot",
        content: `Great! I have your specs:\n• CPU: ${parsedSpecs.cpu}\n• GPU: ${parsedSpecs.gpu}\n• Resolution: ${parsedSpecs.resolution}\n\nNow, which game would you like to check FPS for?\n\n💡 Tip: You can say "change my GPU" anytime to update your specs!`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }

    return () => {
      if (noSpeechTimeoutRef.current)
        clearTimeout(noSpeechTimeoutRef.current);
      if (recognitionRef.current)
        recognitionRef.current.abort();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (specs) {
      sessionStorage.setItem("selectedSpecs", JSON.stringify(specs));
    }
  }, [specs]);

  const toggleMicrophone = () => {
    if (!isBrowserSupported) {
      setMicError("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }
    if (!recognitionRef.current) {
      setMicError("Speech recognition not initialized. Refresh the page.");
      return;
    }

    if (isListening) {
      // Stop listening — keep text in input
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMicError(null);
      finalTranscriptRef.current = input ? input + " " : ""; // keep existing text
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log("Recognition already started");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Stop mic if active before sending
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const sentInput = input;
    setInput("");
    finalTranscriptRef.current = "";
    setIsLoading(true);

    try {
      const response = await fetch('https://bottleneckblueprint.onrender.com/api/chat', {
      // const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sentInput,
          specs: specs,
          conversation_state: conversationState,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        if (data.updated_specs) setSpecs(data.updated_specs);
        if (data.conversation_state !== undefined)
          setConversationState(data.conversation_state);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: data.bot_response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: "Connection error. Make sure the backend server is running on port 5000.",
          timestamp: new Date(),
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleBackToSpecs = () => {
    sessionStorage.removeItem("selectedSpecs");
    if (isListening && recognitionRef.current) recognitionRef.current.abort();
    router.push("/service");
  };

  const clearError = () => setMicError(null);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1E293B] bg-slate-950 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">FPS Calculator</h1>
            <p className="text-xs text-[#64748B] mt-1">
              {specs && `${specs.cpu} • ${specs.gpu} • ${specs.resolution}`}
            </p>
          </div>
          <button
            onClick={handleBackToSpecs}
            className="px-4 py-2 text-sm font-semibold text-[#00D4FF] border border-[#1E293B] hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-6 py-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00D4FF" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md lg:max-w-lg px-5 py-4 rounded-xl ${
                  message.type === "user"
                    ? "bg-linear-to-r from-[#00D4FF] to-[#0096FF] text-slate-950 rounded-br-none shadow-lg shadow-[#00D4FF]/20"
                    : "border border-[#1E293B] bg-slate-800/50 text-[#CBD5E1] rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-3 font-semibold ${message.type === "user" ? "text-slate-900/70" : "text-[#64748B]"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="border border-[#1E293B] bg-slate-800/50 px-5 py-4 rounded-xl rounded-bl-none flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#FF6B35] animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-[#00FF87] animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#1E293B] bg-slate-950 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-6 py-6 w-full">

          {/* Mic error */}
          {micError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start justify-between gap-3">
              <p className="text-xs text-red-400 font-semibold flex-1">{micError}</p>
              <button onClick={clearError} className="text-red-400/60 hover:text-red-400 text-xl">✕</button>
            </div>
          )}

          {/* Listening indicator */}
          {isListening && (
            <div className="mb-3 flex items-center gap-2 px-1">
              <div className="flex gap-0.75 items-end h-4">
                <div className="w-1 rounded-full bg-[#FF6B35] animate-bounce" style={{ height: "60%", animationDelay: "0s" }}></div>
                <div className="w-1 rounded-full bg-[#FF6B35] animate-bounce" style={{ height: "100%", animationDelay: "0.15s" }}></div>
                <div className="w-1 rounded-full bg-[#FF6B35] animate-bounce" style={{ height: "70%", animationDelay: "0.3s" }}></div>
                <div className="w-1 rounded-full bg-[#FF6B35] animate-bounce" style={{ height: "90%", animationDelay: "0.1s" }}></div>
                <div className="w-1 rounded-full bg-[#FF6B35] animate-bounce" style={{ height: "50%", animationDelay: "0.25s" }}></div>
              </div>
              <p className="text-xs text-[#FF6B35] font-semibold">Listening — speak now</p>
              <button
                onClick={() => { recognitionRef.current?.stop(); setIsListening(false); }}
                className="ml-auto px-3 py-1 text-xs font-semibold text-[#FF6B35] border border-[#FF6B35] hover:bg-[#FF6B35]/10 rounded"
              >
                Stop
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // If user manually types, update the final ref too so mic appends correctly
                finalTranscriptRef.current = e.target.value ? e.target.value + " " : "";
              }}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && input.trim() && handleSendMessage()}
              placeholder={
                isListening
                  ? "Listening... speak now"
                  : conversationState?.state === "awaiting_spec_category"
                  ? "Type CPU, GPU, or Resolution..."
                  : conversationState?.state?.includes("awaiting") && conversationState?.state?.includes("pick")
                  ? "Type 1, 2, or 3 to pick..."
                  : "Ask about FPS, games, or say 'change my GPU'..."
              }
              className="flex-1 px-4 py-3 bg-slate-900 border border-[#1E293B] rounded-lg text-white placeholder-[#64748B] focus:border-[#00D4FF] focus:outline-none transition-colors"
              disabled={isLoading}
              autoFocus
            />

            {/* Mic button with SVG icon */}
            <button
              onClick={toggleMicrophone}
              disabled={isLoading || !isBrowserSupported}
              title={isListening ? "Stop listening" : "Start voice input"}
              className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                  : isBrowserSupported
                  ? "bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 hover:scale-105"
                  : "bg-[#1E293B] text-[#64748B] cursor-not-allowed"
              }`}
            >
              {isListening ? (
                /* Stop icon when listening */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                /* Mic icon when not listening */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 16.93A8.001 8.001 0 0 1 4 10H6a6 6 0 0 0 12 0h2a8.001 8.001 0 0 1-7 7.93V21h3v2H8v-2h3v-3.07z"/>
                </svg>
              )}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isLoading || !input.trim()
                  ? "bg-[#1E293B] text-[#64748B]"
                  : "bg-[#00D4FF] text-slate-950 hover:bg-white hover:scale-105"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}