"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Activity,AlertCircle, ArrowDown, ArrowUp, Download, Upload, 
  Wifi, WifiOff } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger,
  
} from "../../components/ui/tabs";
import { NetworkStats } from "@/components/dashboard/network-stats";

interface Message {
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
}

function ChatInterface({ messages, isLoading, onSend }: { 
  messages: Message[]; 
  isLoading: boolean; 
  onSend: (input: string) => void 
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[800px] bg-black/40 backdrop-blur-sm border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xl font-semibold">Network Assistant</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.filter(msg => !msg.hidden).map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-800 text-zinc-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-100 rounded-lg p-3">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about network performance..."
            onKeyDown={e => e.key === "Enter" && handleSend()}
            className="bg-zinc-900 border-zinc-700"
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [networkData, setNetworkData] = useState({
    bandwidth: { upload: 0, download: 0, history: [] as any[] },
    latency: { current: 0, average: 45, min: 20, max: 150, history: [] as any[] },
    packetLoss: { current: 0, history: [] as any[] }
  });
  const networkDataRef = useRef(networkData);

  useEffect(() => {
    networkDataRef.current = networkData;
  }, [networkData]);

  // Real-time network data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData(prev => ({
        bandwidth: {
          upload: Math.random() * 100,
          download: Math.random() * 200,
          history: [...prev.bandwidth.history, {
            time: new Date().toISOString(),
            upload: Math.random() * 100,
            download: Math.random() * 200
          }].slice(-50)
        },
        latency: {
          current: Math.random() * 100,
          average: 45,
          min: 20,
          max: 150,
          history: [...prev.latency.history, {
            time: new Date().toISOString(),
            value: Math.random() * 100
          }].slice(-50)
        },
        packetLoss: {
          current: Math.random() * 2,
          history: [...prev.packetLoss.history, {
            time: new Date().toISOString(),
            value: Math.random() * 2
          }].slice(-50)
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Automated network predictions
  useEffect(() => {
    const generatePrediction = async () => {
      const currentData = networkDataRef.current;
      const predictionPrompt = `Current network metrics:
- Bandwidth: Upload ${currentData.bandwidth.upload.toFixed(2)}Mbps, Download ${currentData.bandwidth.download.toFixed(2)}Mbps
- Latency: ${currentData.latency.current.toFixed(2)}ms
- Packet Loss: ${currentData.packetLoss.current.toFixed(2)}%
Provide a brief network performance prediction and recommendations.`;

      try {
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const chat = model.startChat({
          systemInstruction: {
            role: "model",
            parts: [{
              text: "You are a network analysis expert. Provide concise predictions (2-3 sentences) " +
                    "based on provided metrics. Focus on performance trends and maintenance recommendations. " +
                    "Use simple language and bullet points when possible."
            }]
          }
        });

        const result = await chat.sendMessage(predictionPrompt);
        const response = await result.response;
        
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `📡 Network Prediction:\n${response.text()}`
        }]);
      } catch (error) {
        console.error("Prediction error:", error);
      }
    };

    const interval = setInterval(generatePrediction, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (input: string) => {
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const history = messages
        .filter(msg => !msg.hidden)
        .map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }));

      const chat = model.startChat({
        history,
        systemInstruction: {
          role: "model",
          parts: [{
            text: "You are a network specialist. Only answer networking questions. " +
                  "For non-network questions, respond: 'I specialize in network analysis only.' " +
                  "Keep responses technical but clear. Use bullet points for complex answers."
          }]
        }
      });

      const stream = await chat.sendMessageStream(input);
      let responseText = '';
      
      // Add initial assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        responseText += chunkText;
        
        // Update last message with streaming text
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === "assistant") {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: responseText
            };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "⚠️ Error processing request. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Network Monitoring</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NetworkStats 
                title="Bandwidth"
                upload={networkData.bandwidth.upload}
                download={networkData.bandwidth.download}
                icon={Activity}
              />
              <NetworkStats 
                title="Latency"
                value={networkData.latency.current}
                unit="ms"
                icon={Wifi}
                status={networkData.latency.current > 100 ? "warning" : "success"}
              />
              <NetworkStats 
                title="Packet Loss"
                value={networkData.packetLoss.current}
                unit="%"
                icon={networkData.packetLoss.current > 1 ? WifiOff : Wifi}
                status={networkData.packetLoss.current > 1 ? "error" : "success"}
              />
            </div>

            {/* Charts */}
            <Card className="p-6 bg-black/40 backdrop-blur-sm border-zinc-800">
              <Tabs defaultValue="bandwidth" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
                  <TabsTrigger value="latency">Latency</TabsTrigger>
                  <TabsTrigger value="packetLoss">Packet Loss</TabsTrigger>
                </TabsList>

                <TabsContent value="bandwidth" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={networkData.bandwidth.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid #374151"
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="upload" 
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.1}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="download" 
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="latency" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={networkData.latency.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid #374151"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="packetLoss" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={networkData.packetLoss.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid #374151"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#EF4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Chat Interface Section */}
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}