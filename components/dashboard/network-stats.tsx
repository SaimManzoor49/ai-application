"use client";

import { Card } from "@/components/ui/card";
import { DivideIcon as LucideIcon } from "lucide-react";

interface NetworkStatsProps {
  title: string;
  value?: number;
  upload?: number;
  download?: number;
  unit?: string;
  icon: LucideIcon;
  status?: "success" | "warning" | "error";
}

export function NetworkStats({
  title,
  value,
  upload,
  download,
  unit = "",
  icon: Icon,
  status = "success",
}: NetworkStatsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <Card className="p-6 bg-black/40 backdrop-blur-sm border-zinc-800">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          {upload !== undefined && download !== undefined ? (
            <div className="space-y-1 mt-2">
              <p className="text-2xl font-semibold">
                ↑ {upload.toFixed(1)} Mbps
              </p>
              <p className="text-2xl font-semibold">
                ↓ {download.toFixed(1)} Mbps
              </p>
            </div>
          ) : (
            <p className="text-2xl font-semibold mt-2">
              {value?.toFixed(1)} {unit}
            </p>
          )}
        </div>
        <Icon className={`h-5 w-5 ${getStatusColor(status)}`} />
      </div>
    </Card>
  );
}