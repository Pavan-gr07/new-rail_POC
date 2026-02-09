import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";

interface Event {
  id: string;
  timestamp: string;
  type: "sync" | "error" | "warning" | "info" | "success";
  category: string;
  message: string;
  device?: string;
  details: string;
}

export default function Events() {
  const [events] = useState<Event[]>([
    {
      id: "1",
      timestamp: "2024-01-27 14:35:22",
      type: "success",
      category: "Data Sync",
      message: "Train 12345 successfully synced to displays",
      device: "AVDB-01, AVDB-02, AVDB-03",
      details: "Data transfer completed successfully with 100% confirmation",
    },
    {
      id: "2",
      timestamp: "2024-01-27 14:34:15",
      type: "error",
      category: "Display Failure",
      message: "Data transfer failed for AVDB-04",
      device: "AVDB-04",
      details: "Connection timeout after 3 retries. Device may be offline.",
    },
    {
      id: "3",
      timestamp: "2024-01-27 14:33:45",
      type: "warning",
      category: "Health Alert",
      message: "VDB-02 temperature critical",
      device: "VDB-02",
      details: "Temperature exceeded threshold: 72°C",
    },
    {
      id: "4",
      timestamp: "2024-01-27 14:32:10",
      type: "success",
      category: "Announcement",
      message: "Audio announcement played successfully",
      device: "All Displays",
      details: "Platform 1 delay announcement - Duration: 15 seconds",
    },
    {
      id: "5",
      timestamp: "2024-01-27 14:31:00",
      type: "info",
      category: "System Event",
      message: "System mode switched to Manual",
      device: "System",
      details: "User switched operation mode from Auto to Manual",
    },
    {
      id: "6",
      timestamp: "2024-01-27 14:30:15",
      type: "success",
      category: "Data Sync",
      message: "Batch sync completed for 5 trains",
      device: "AVDB-01 to AVDB-05",
      details: "All 5 trains synced with LED display updates",
    },
    {
      id: "7",
      timestamp: "2024-01-27 14:29:30",
      type: "warning",
      category: "Connectivity",
      message: "Low bandwidth detected on network",
      device: "Network",
      details: "Available bandwidth: 25 Mbps, Expected: 100 Mbps",
    },
    {
      id: "8",
      timestamp: "2024-01-27 14:28:45",
      type: "success",
      category: "Configuration",
      message: "Display colors updated successfully",
      device: "All Displays",
      details: "New color scheme applied: Status-based highlighting enabled",
    },
    {
      id: "9",
      timestamp: "2024-01-27 14:27:20",
      type: "error",
      category: "API Error",
      message: "NTES API connection failed",
      device: "System",
      details: "Failed to fetch train data from NTES server. Retrying...",
    },
    {
      id: "10",
      timestamp: "2024-01-27 14:26:00",
      type: "info",
      category: "System Event",
      message: "Daily backup completed",
      device: "System",
      details: "Event logs backup: 2 years of history preserved",
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getEventIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success/10 border-success/20";
      case "error":
        return "bg-destructive/10 border-destructive/20";
      case "warning":
        return "bg-warning/10 border-warning/20";
      case "info":
        return "bg-primary/10 border-primary/20";
      default:
        return "bg-muted/10 border-muted/20";
    }
  };

  const categories = ["all", ...new Set(events.map((e) => e.category))];

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Log</h1>
          <p className="text-muted-foreground mt-1">
            View system events, data transfer logs, and audit trail (90-day
            retention)
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-foreground">
          <Download className="w-4 h-4" />
          Export Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Events</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {events.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Successful</p>
          <p className="text-3xl font-bold text-success mt-2">
            {events.filter((e) => e.type === "success").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Warnings</p>
          <p className="text-3xl font-bold text-warning mt-2">
            {events.filter((e) => e.type === "warning").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Errors</p>
          <p className="text-3xl font-bold text-destructive mt-2">
            {events.filter((e) => e.type === "error").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Recent Events</h2>
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className={cn(
              "bg-card border rounded-lg p-4 space-y-3 transition-colors hover:bg-muted/30",
              getEventColor(event.type),
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getEventIcon(event.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {event.message}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-background text-muted-foreground">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.details}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono text-muted-foreground">
                  {event.timestamp}
                </p>
              </div>
            </div>
            {event.device && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-7">
                <span className="font-medium">Device(s):</span>
                <span>{event.device}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
        <p className="text-sm font-medium text-foreground">
          ℹ️ Log Retention Policy
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• CDC Server: Logs retained for 45 calendar days</li>
          <li>• Edge NMS: Logs retained for 90 calendar days</li>
          <li>• Logs beyond retention period are automatically deleted</li>
          <li>• Critical events are archived separately</li>
        </ul>
      </div>
    </div>
  );
}
