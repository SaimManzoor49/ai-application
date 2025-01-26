"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  Activity, AlertCircle, ArrowDown, ArrowUp, Download, Upload, 
  Wifi, WifiOff 
} from "lucide-react";
import { NetworkStats } from "@/components/dashboard/network-stats";
import { ChatInterface } from "@/components/dashboard/chat-interface";

export default function DashboardPage() {
  const [networkData, setNetworkData] = useState({
    bandwidth: {
      upload: 0,
      download: 0,
      history: []
    },
    latency: {
      current: 0,
      average: 0,
      min: 0,
      max: 0,
      history: []
    },
    packetLoss: {
      current: 0,
      history: []
    }
  });

  // Simulate real-time data updates
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Monitoring Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Network Monitoring</h2>
            
            {/* Network Stats Cards */}
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