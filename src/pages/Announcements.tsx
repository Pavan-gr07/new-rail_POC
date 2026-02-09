import {
  Radio,
  Plus,
  Edit,
  Trash2,
  Loader,
  CheckCircle,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import {
  getAnnouncements,
  getTTSEngine,
  markAnnouncementAnnounced,
} from "../services/announcements";
import type { AnnouncementTemplate, AnnouncementRecord } from "../shared/api";

export default function Announcements() {
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([]);
  const [records, setRecords] = useState<AnnouncementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const ttsEngine = getTTSEngine();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getAnnouncements();
      setTemplates(data.templates);
      setRecords(data.records.slice(0, 20)); // Show recent 20
    } catch (error) {
      console.error("Failed to load announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAnnouncement = async (id: string, message: string) => {
    try {
      setIsSpeaking(id);
      await ttsEngine.speak(message, "en", () => {
        markAnnouncementAnnounced(id);
      });
    } catch (error) {
      console.error("Failed to play announcement:", error);
    } finally {
      setIsSpeaking(null);
    }
  };

  const triggerTypes = [
    { id: "train_delay", label: "Train Delay", color: "warning" },
    {
      id: "train_cancellation",
      label: "Train Cancellation",
      color: "destructive",
    },
    { id: "platform_change", label: "Platform Change", color: "primary" },
    { id: "boarding_started", label: "Boarding Started", color: "success" },
    { id: "health_alert", label: "Health Alert", color: "warning" },
    { id: "custom", label: "Custom", color: "neutral" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Automatic Announcements
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure and manage automatic announcement templates and triggers
        </p>
      </div>

      {/* Templates Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Announcement Templates
            </h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.triggerType.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        template.enabled ? "bg-success" : "bg-muted",
                      )}
                    />
                  </div>

                  <p className="text-sm text-foreground line-clamp-2">
                    {template.textEnglish}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium text-foreground">
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors text-sm font-medium text-destructive">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcement Records */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Recent Announcements
          </h2>
          {isLoading && (
            <Loader className="w-4 h-4 animate-spin ml-auto text-primary" />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Trigger Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((record) => {
                const isCurrentlySpeaking = isSpeaking === record.id;
                return (
                  <tr
                    key={record.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(record.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <p className="line-clamp-2">{record.message}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {record.triggerType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {record.status === "announced" ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : record.status === "pending" ? (
                          <AlertCircle className="w-4 h-4 text-warning" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-medium",
                            record.status === "announced"
                              ? "text-success"
                              : record.status === "pending"
                                ? "text-warning"
                                : "text-destructive",
                          )}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() =>
                          handlePlayAnnouncement(record.id, record.message)
                        }
                        disabled={isCurrentlySpeaking}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-xs font-medium disabled:opacity-50"
                      >
                        {isCurrentlySpeaking ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <PlayCircle className="w-3 h-3" />
                        )}
                        {isCurrentlySpeaking ? "Playing..." : "Play"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {records.length === 0 && !isLoading && (
          <div className="p-6 text-center text-muted-foreground">
            No announcements yet. Automatic announcements will appear here when
            triggered.
          </div>
        )}
      </div>

      {/* Trigger Types Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Trigger Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {triggerTypes.map((type) => (
            <div key={type.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                  type.color === "success"
                    ? "bg-success"
                    : type.color === "destructive"
                      ? "bg-destructive"
                      : type.color === "warning"
                        ? "bg-warning"
                        : "bg-primary",
                )}
              />
              <div>
                <p className="font-medium text-sm text-foreground">
                  {type.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {type.id === "train_delay" &&
                    "Announced when train is delayed"}
                  {type.id === "train_cancellation" &&
                    "Announced when train is cancelled"}
                  {type.id === "platform_change" &&
                    "Announced when platform changes"}
                  {type.id === "boarding_started" &&
                    "Announced when boarding starts"}
                  {type.id === "health_alert" &&
                    "Announced for display health issues"}
                  {type.id === "custom" && "Custom announcements"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
