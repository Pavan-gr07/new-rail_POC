import {
  Monitor,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";

interface Display {
  id: string;
  location: string;
  type: "AVDB" | "VDB";
  status: "online" | "offline" | "error";
  brightness: number;
  lastUpdate: string;
  resolution: string;
  ip: string;
}

export default function Displays() {
  const [displays] = useState<Display[]>([
    {
      id: "AVDB-01",
      location: "Platform 1",
      type: "AVDB",
      status: "online",
      brightness: 95,
      lastUpdate: "2 sec ago",
      resolution: "1920x1080",
      ip: "192.168.1.101",
    },
    {
      id: "AVDB-02",
      location: "Platform 2",
      type: "AVDB",
      status: "online",
      brightness: 88,
      lastUpdate: "1 sec ago",
      resolution: "1920x1080",
      ip: "192.168.1.102",
    },
    {
      id: "AVDB-03",
      location: "Platform 3",
      type: "AVDB",
      status: "online",
      brightness: 92,
      lastUpdate: "3 sec ago",
      resolution: "1920x1080",
      ip: "192.168.1.103",
    },
    {
      id: "VDB-01",
      location: "Main Concourse",
      type: "VDB",
      status: "offline",
      brightness: 0,
      lastUpdate: "45 sec ago",
      resolution: "4096x2160",
      ip: "192.168.1.201",
    },
    {
      id: "VDB-02",
      location: "Entry Gate",
      type: "VDB",
      status: "error",
      brightness: 50,
      lastUpdate: "15 sec ago",
      resolution: "4096x2160",
      ip: "192.168.1.202",
    },
    {
      id: "AVDB-04",
      location: "Platform 4",
      type: "AVDB",
      status: "online",
      brightness: 85,
      lastUpdate: "5 sec ago",
      resolution: "1920x1080",
      ip: "192.168.1.104",
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success/10 text-success";
      case "offline":
        return "bg-muted text-muted-foreground";
      case "error":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "online" ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <AlertCircle className="w-4 h-4" />
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Display Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage AVDB and VDB display boards across all
            platforms
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          Add Display
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Displays</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {displays.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Online</p>
          <p className="text-3xl font-bold text-success mt-2">
            {displays.filter((d) => d.status === "online").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Offline</p>
          <p className="text-3xl font-bold text-muted-foreground mt-2">
            {displays.filter((d) => d.status === "offline").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Errors</p>
          <p className="text-3xl font-bold text-destructive mt-2">
            {displays.filter((d) => d.status === "error").length}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Display Boards
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Display ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Resolution
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Brightness
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displays.map((display) => (
                <tr
                  key={display.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {display.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {display.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                      {display.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {display.resolution}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {display.brightness}%
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-mono text-xs">
                    {display.ip}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                        getStatusBadge(display.status),
                      )}
                    >
                      {getStatusIcon(display.status)}
                      {display.status.charAt(0).toUpperCase() +
                        display.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="p-2 hover:bg-muted rounded transition-colors text-primary">
                      <Settings className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
