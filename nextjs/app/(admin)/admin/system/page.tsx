"use client";

import { useState, useEffect } from "react";
import { Activity, Database, Server, Cpu, Clock, Zap, AlertCircle } from "lucide-react";

interface SystemHealth {
  status: "operational" | "degraded" | "down";
  uptime: number;
  database: { status: string; latency: number };
  memory: { used: number; total: number; percentage: number };
  server: { platform: string; cpus: number; load: number };
  responseTime: number;
}

export default function SystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/admin/system");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setHealth(data);
        setConnected(true);
        setError(false);
      } catch (err) {
        console.error("Stream Parse Error", err);
      }
    };

    eventSource.onerror = (err) => {
      setConnected(false);
      setError(true);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const getStatusColor = (status: string) => {
    if (status === "healthy" || status === "operational") return "bg-green-500";
    if (status === "degraded") return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-500 text-sm">Real-time infrastructure monitoring.</p>
        </div>
        
        {/* Live Indicator Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            connected 
                ? "bg-green-50 border-green-200 text-green-700" 
                : "bg-red-50 border-red-200 text-red-700"
        }`}>
            <span className="relative flex h-2.5 w-2.5">
              {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? "bg-green-500" : "bg-red-500"}`}></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
                {connected ? "Live" : error ? "Disconnected" : "Connecting..."}
            </span>
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#2f2b27] via-[#23211f] to-[#1a1918] relative rounded-2xl p-8 text-white shadow-xl shadow-black/5 overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 ${
                    health?.status === "operational" ? "bg-green-500/10" : "bg-red-500/10"
                }`}>
                    <Activity className={`w-8 h-8 transition-colors duration-500 ${
                        health?.status === "operational" ? "text-green-500" : "text-red-500"
                    }`} />
                </div>
                <div>
                    <h2 className="text-sm text-white/60 font-medium uppercase tracking-wider mb-1">Overall Health</h2>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {health?.status === "operational" ? "All Systems Operational" : health ? "System Issues Detected" : "Initializing..."}
                    </h1>
                </div>
            </div>

            {/* Response Time Badge */}
            <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-xs text-white/50 mb-1 font-medium">API Latency</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{health?.responseTime || 0}</p>
                    <span className="text-sm text-white/60">ms</span>
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Database Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl">
                        <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-900">Database</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.database.status || "unknown")}`} />
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="font-semibold capitalize text-gray-900">{health?.database.status || "..."}</span>
                </div>
                <div className="w-full bg-gray-100 h-px" />
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Query Latency</span>
                    <span className="font-mono font-medium text-gray-900">{health?.database.latency || 0}ms</span>
                </div>
            </div>
        </div>

        {/* Server Specs */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl">
                        <Server className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-bold text-gray-900">Server</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
                    <Zap className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-bold text-gray-600">{health?.server.load.toFixed(2) || "0.00"} Load</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Platform</span>
                    <span className="font-semibold capitalize text-gray-900">{health?.server.platform || "Linux"}</span>
                </div>
                <div className="w-full bg-gray-100 h-px" />
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Uptime</span>
                    <span className="font-mono font-medium text-gray-900">{health ? formatUptime(health.uptime) : "-"}</span>
                </div>
            </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-50 rounded-xl">
                        <Cpu className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="font-bold text-gray-900">Memory</span>
                </div>
                <span className="text-xs font-bold bg-gray-900 text-white px-2 py-1 rounded-lg">
                    {health?.memory.percentage || 0}%
                </span>
            </div>
            
            <div className="mt-2 mb-6">
                 <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-in-out ${
                            (health?.memory.percentage || 0) > 85 ? "bg-red-500" : "bg-orange-500"
                        }`}
                        style={{ width: `${health?.memory.percentage || 0}%` }} 
                    />
                 </div>
            </div>

            <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>{health?.memory.used || 0} MB Used</span>
                <span>{health?.memory.total || 0} MB Total</span>
            </div>
        </div>

      </div>

      {/* Disconnect Warning */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-800 animate-pulse">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Connection lost. Attempting to reconnect...</span>
        </div>
      )}

    </div>
  );
}