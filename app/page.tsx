"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  Image,
  Globe,
  Music,
  Code,
  Eye,
  Link2,
  HelpCircle,
  FileText,
  BarChart3,
  Brain,
  Plus,
  Send,
  Paperclip,
  Menu,
  LayoutDashboard,
  X,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Enhancement {
  type: 'emotion' | 'technology' | 'style' | 'audience' | 'complexity';
  value: string;
  text: string;
  options: string[];
  color: string;
  pro?: boolean;
  icon: any;
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEnhancement, setSelectedEnhancement] = useState<Enhancement | null>(null);
  const [activeEnhancement, setActiveEnhancement] = useState<Enhancement | null>(null);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const enhancements: Enhancement[] = [
    { 
      type: 'emotion',
      text: "Tone",
      value: '',
      options: ['Professional', 'Friendly', 'Persuasive', 'Empathetic'],
      color: 'blue',
      icon: MessageSquare
    },
    { 
      type: 'technology',
      text: "Tech Stack",
      value: '',
      options: ['React/TS', 'Python', 'Node.js', 'Rust'],
      color: 'purple',
      pro: true,
      icon: Code
    },
    { 
      type: 'style',
      text: "Style",
      value: '',
      options: ['Concise', 'Technical', 'Detailed', 'Simple'],
      color: 'green',
      icon: FileText
    },
    { 
      type: 'complexity',
      text: "Complexity",
      value: '',
      options: ['Basic', 'Intermediate', 'Advanced'],
      color: 'pink',
      icon: BarChart3
    },
    { 
      type: 'audience',
      text: "Audience",
      value: '',
      options: ['Developers', 'Executives', 'Students', 'General'],
      color: 'orange',
      icon: Brain
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const enhancePrompt = (basePrompt: string): string => {
    if (!selectedEnhancement?.value) return basePrompt;
    return `[${selectedEnhancement.text}: ${selectedEnhancement.value}] ${basePrompt}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const enhancedPrompt = enhancePrompt(input);
    const userMessage = { role: "user" as const, content: enhancedPrompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const chat = model.startChat({
        history: messages.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }))
      });

      const result = await chat.sendMessage(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I couldn't process your request. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

    
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-black/40 backdrop-blur-xl p-6 border-r border-zinc-800/50 transition-all duration-300 ease-in-out z-40
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        ${isMobile ? "w-[280px]" : "w-72"}`}
      >
        <div className="flex items-center gap-3 mb-10">
          <Globe className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-semibold tracking-tight">EverAsk</span>
        </div>

        <Button
          variant="secondary"
          className="w-full mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/20 transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" /> Start New Chat
        </Button>

        <div className="space-y-8">
          <div>
            <h3 className="text-zinc-400 text-sm font-medium mb-4 px-2">
              Tools
            </h3>
            <div className="space-y-1">
              {[
                { icon: MessageSquare, text: "AI Chat", active: true },
                { icon: Image, text: "Image Generation" },
                { icon: Globe, text: "AI Search Engine" },
                { icon: Music, text: "Music Generation" },
              ].map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-6 transition-all duration-200 group
                    ${
                      item.active
                        ? "bg-blue-500/10 text-blue-500"
                        : "hover:bg-zinc-800/50"
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110
                    ${
                      item.active
                        ? "text-blue-500"
                        : "text-zinc-400 group-hover:text-blue-400"
                    }`}
                  />
                  {item.text}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-zinc-400 text-sm font-medium mb-4 px-2">
              Others
            </h3>
            <div className="space-y-1">
              {[
                { icon: Link2, text: "Extension" },
                { icon: HelpCircle, text: "Support" },
                { icon: LayoutDashboard, text: "Dashboard" },
              ].map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start px-2 py-6 hover:bg-zinc-800/50 hover:text-zinc-300 transition-all duration-200 group"
                >
                  <Link href="/dashboard" className="flex items-center gap-1">
                    <item.icon className="mr-3 h-5 w-5 text-zinc-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-blue-400" />
                    {item.text}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-72' : 'ml-0'} p-6 md:p-8`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-center mb-12 mt-20 md:mt-32 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent animate-fade-in">
            How can I help you today?
          </h1>
          
          {/* Input Section */}
          <div className="relative mb-12 group">
            <Input 
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 py-6 px-6 pr-28 rounded-xl placeholder:text-zinc-500
                focus:border-blue-500/50 focus:ring-0 transition-all duration-300
                hover:border-zinc-700"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-zinc-400 hover:text-blue-400 transition-colors duration-200"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button 
                size="icon"
                className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20"
                onClick={handleSend}
                disabled={isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Enhancement Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
            {enhancements.map((item, i) => (
              <Card 
                key={i} 
                onClick={() => setActiveEnhancement(item)}
                className={`group relative p-4 flex flex-col items-center gap-3 
                  bg-zinc-900/50 backdrop-blur-sm border-2 ${
                    selectedEnhancement?.type === item.type 
                      ? `border-${item.color}-500/50 bg-${item.color}-500/10`
                      : 'border-zinc-800 hover:border-zinc-700'
                  } 
                  transition-all duration-300 cursor-pointer overflow-hidden
                  hover:shadow-lg hover:shadow-${item.color}-500/10`}
              >
                <div className="relative">
                  <div className={`p-2.5 rounded-lg bg-${item.color}-500/10 mb-2`}>
                    <item.icon className={`h-5 w-5 text-${item.color}-400`} />
                  </div>
                  {item.pro && (
                    <span className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 
                      text-[10px] px-2 py-0.5 rounded-full font-medium shadow-lg">
                      Pro
                    </span>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-zinc-200">{item.text}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {selectedEnhancement?.type === item.type 
                      ? selectedEnhancement.value 
                      : `Select ${item.text}`}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 mb-12">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-500/10 border border-blue-500/20' 
                    : 'bg-zinc-800/30 border border-zinc-700/50'
                }`}>
                  <p className="text-zinc-100 text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating response...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhancement Picker Modal */}
          {activeEnhancement && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Select {activeEnhancement.text}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setActiveEnhancement(null)}
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {activeEnhancement.options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        onClick={() => {
                          setSelectedEnhancement({
                            ...activeEnhancement,
                            value: option
                          });
                          setActiveEnhancement(null);
                        }}
                        className={`justify-start text-left h-12
                          ${selectedEnhancement?.value === option 
                            ? `border-${activeEnhancement.color}-500 bg-${activeEnhancement.color}-500/10`
                            : 'border-zinc-800 hover:border-zinc-700'}
                          transition-colors duration-200`}
                      >
                        <span className="text-zinc-800">{option}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}