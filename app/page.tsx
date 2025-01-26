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
  Loader2,
  Infinity,
  Rocket,
  Shield,
  Languages,
  InfinityIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Enhancement {
  type: "primaryEmotions" | "secondaryEmotions";
  value: string;
  text: string;
  options: string[];
  color: string;
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
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const enhancements: Enhancement[] = [
    {
      type: "primaryEmotions",
      text: "Primary Emotions",
      value: "",
      options: ["Anger", "Anxiety", "Fear", "Frustration"],
      color: "red",
      icon: FileText,
    },
    {
      type: "secondaryEmotions",
      text: "Secondary Emotions",
      value: "",
      options: ["Shame", "Jealousy", "Loneliness", "Disappointment"],
      color: "purple",
      icon: Brain,
    },
  ];

  const languages = [
    "English", "Spanish", "French", "German",
    "Chinese", "Japanese", "Arabic", "Hindi"
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const enhancePrompt = (basePrompt: string): string => {
    let enhanced = basePrompt;
    if (selectedEnhancement?.value) {
      enhanced = `[${selectedEnhancement.text}: ${selectedEnhancement.value}] ${enhanced}`;
    }
    return `[Language: ${selectedLanguage}] ${enhanced}`;
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
        history: messages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
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
          className={`fixed top-4 left-4 z-50 md:hidden transition-all duration-300  ${sidebarOpen && 'ml-52'}`}
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
          <span className="text-xl font-semibold tracking-tight">Myndful Mind</span>
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
                        : "hover:bg-zinc-800/50 hover:text-zinc-100"
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
                  <Link href="/" className="flex items-center gap-1">
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
          {/* Language Dropdown */}
          <div className="flex justify-end mb-6">
            <div className="relative w-40">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 py-2 px-3 rounded-lg
                  text-sm text-zinc-300 appearance-none focus:outline-none focus:border-blue-500/50
                  transition-all duration-300 hover:border-zinc-700"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-zinc-900 text-zinc-300">
                    {lang}
                  </option>
                ))}
              </select>
              <Languages className="h-4 w-4 absolute right-3 top-3 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Updated Input Section with Language Indicator */}
          <div className="relative mb-12 ">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 py-6 px-6 pl-4 pr-28 rounded-xl
                placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-0 transition-all duration-300
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

           {/* Updated Enhancement Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
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
                    <item.icon className={`h-5 w-5 text-white`} />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-zinc-200">{item.text}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {selectedEnhancement?.type === item.type 
                      ? selectedEnhancement.value 
                      : `Select ${item.text.toLowerCase()}`}
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
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : "bg-zinc-800/30 border border-zinc-700/50"
                  }`}
                >
                  <p className="text-zinc-100 text-sm leading-relaxed">
                    {message.content}
                  </p>
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
                    <h3 className="text-lg font-semibold">
                      Select {activeEnhancement.text}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveEnhancement(null)}
                      className="text-zinc-400 hover:text-zinc-800"
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
                            value: option,
                          });
                          setActiveEnhancement(null);
                        }}
                        className={`justify-start text-left h-12
                          ${
                            selectedEnhancement?.value === option
                              ? `border-${activeEnhancement.color}-500 bg-gray-100`
                              : "border-zinc-800 hover:border-zinc-700"
                          }
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

          {/* Why Choose Us Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {/* Card 1 */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-400">
                  Enterprise-Grade Security
                </h3>
              </div>
              <p className="text-zinc-400 text-sm">
                Military-grade encryption and SOC2 compliance ensure your data
                remains protected with zero-third-party access. Sleep easy
                knowing your information is safe.
              </p>
            </Card>

            {/* Card 2 */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Rocket className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-400">
                  Blazing Fast Performance
                </h3>
              </div>
              <p className="text-zinc-400 text-sm">
                Leverage our global edge network with{" "}
                <span className="text-purple-400">≤12ms</span> response times.
                Handle millions of requests seamlessly with our auto-scaling
                infrastructure.
              </p>
            </Card>

            {/* Card 3 */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <InfinityIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-400">Unlimited Scalability</h3>
              </div>
              <p className="text-zinc-400 text-sm">
                From startups to Fortune 500s, our platform scales effortlessly.
                Get <span className="text-emerald-400">99.99% uptime</span> SLA
                and 24/7 expert support for mission-critical operations.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
