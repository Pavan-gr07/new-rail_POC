import {
  BarChart3,
  Train,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Radio,
  TrendingUp,
  Activity,
  Send,
  Pause,
  Volume2,
  Mic,
  Square,
  Trash2,
  // PlayCircle,
  // Loader,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useRef } from "react";
// import {
//   getAnnouncements,
//   triggerAnnouncement,
//   getTTSEngine,
//   markAnnouncementAnnounced,
// } from "@/services/announcements";
// import type { AnnouncementRecord } from "../shared/api";

interface StatusCard {
  label: string;
  value: string | number;
  status: "success" | "warning" | "error" | "neutral";
  icon: React.ReactNode;
}

interface TrainRecord {
  trainNo: string;
  destination: string;
  platform: number;
  eta: string;
  displayStatus: "sent" | "pending";
  lastUpdate: string;
}

interface DisplayBoard {
  id: string;
  location: string;
  status: "online" | "offline" | "error";
  lastSync: string;
  healthScore: number;
}

interface Announcement {
  id: string;
  audioUrl: string;
  language: "english" | "hindi" | "regional";
  duration: number;
  color: string;
  isPlaying: boolean;
  mode: "manual" | "auto";
  createdAt: string;
}

export default function Dashboard() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  // const [autoAnnouncements, setAutoAnnouncements] = useState<
  //   AnnouncementRecord[]
  // >([]);
  const [operationMode, setOperationMode] = useState<"auto" | "manual">(
    "manual",
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<
    "english" | "hindi" | "regional"
  >("english");
  const [selectedColor, setSelectedColor] = useState("#FF6B6B");
  // const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  // const [isSpeaking, setIsSpeaking] = useState(false);
  const recordingIntervalRef = useRef<number | null>(null);
  // const ttsEngine = getTTSEngine();

  // Load announcements on mount
  // useEffect(() => {
  //   // loadAnnouncements();
  //   const interval = setInterval(loadAnnouncements, 5000); // Refresh every 5 seconds
  //   return () => clearInterval(interval);
  // }, []);

  // const loadAnnouncements = async () => {
  //   try {
  //     setIsLoadingAnnouncements(true);
  //     const data = await getAnnouncements();
  //     setAutoAnnouncements(data.records.slice(0, 10)); // Show recent 10
  //   } catch (error) {
  //     console.error("Failed to load announcements:", error);
  //   } finally {
  //     setIsLoadingAnnouncements(false);
  //   }
  // };

  // const handleTriggerDemo = async () => {
  //   try {
  //     setIsSpeaking(true);
  //     const record = await triggerAnnouncement(
  //       "tpl_delay_1",
  //       "en",
  //       { trainNumber: "12345", minutes: "15" },
  //       "12345",
  //     );

  //     // Speak the announcement
  //     await ttsEngine.speak(record.message, "en", () => {
  //       markAnnouncementAnnounced(record.id);
  //     });

  //     await loadAnnouncements();
  //   } catch (error) {
  //     console.error("Failed to trigger announcement:", error);
  //   } finally {
  //     setIsSpeaking(false);
  //   }
  // };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        const announcement: Announcement = {
          id: Date.now().toString(),
          audioUrl: audioUrl,
          language: selectedLanguage,
          duration: recordingTime,
          color: selectedColor,
          isPlaying: false,
          mode: operationMode,
          createdAt: "Just now",
        };

        setAnnouncements([announcement, ...announcements]);
        setRecordingTime(0);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer for recording duration
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handlePlayAnnouncement = (id: string) => {
    const announcement = announcements.find((ann) => ann.id === id);
    if (!announcement) return;

    if (announcement.isPlaying) {
      // Stop playback
      setAnnouncements(
        announcements.map((ann) =>
          ann.id === id ? { ...ann, isPlaying: false } : ann,
        ),
      );
    } else {
      // Start playback - stop all other playing announcements
      setAnnouncements((prevAnns) =>
        prevAnns.map((ann) =>
          ann.id === id
            ? { ...ann, isPlaying: true }
            : { ...ann, isPlaying: false },
        ),
      );

      const audio = new Audio(announcement.audioUrl);
      audio.onended = () => {
        setAnnouncements((prevAnns) =>
          prevAnns.map((ann) =>
            ann.id === id ? { ...ann, isPlaying: false } : ann,
          ),
        );
      };
      audio.play();
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((ann) => ann.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Mock data
  const statusCards: StatusCard[] = [
    {
      label: "System Status",
      value: "Online",
      status: "success",
      icon: <Activity className="w-6 h-6" />,
    },
    {
      label: "Active Trains",
      value: "24",
      status: "neutral",
      icon: <Train className="w-6 h-6" />,
    },
    {
      label: "Pending Syncs",
      value: "3",
      status: "warning",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      label: "Display Boards",
      value: "42/42",
      status: "success",
      icon: <Radio className="w-6 h-6" />,
    },
  ];

  const recentTrains: TrainRecord[] = [
    {
      trainNo: "12345",
      destination: "New Delhi",
      platform: 1,
      eta: "14:30",
      displayStatus: "sent",
      lastUpdate: "2 min ago",
    },
    {
      trainNo: "12346",
      destination: "Mumbai",
      platform: 2,
      eta: "14:45",
      displayStatus: "sent",
      lastUpdate: "5 min ago",
    },
    {
      trainNo: "12347",
      destination: "Bangalore",
      platform: 3,
      eta: "15:00",
      displayStatus: "pending",
      lastUpdate: "1 min ago",
    },
    {
      trainNo: "12348",
      destination: "Hyderabad",
      platform: 4,
      eta: "15:15",
      displayStatus: "pending",
      lastUpdate: "Just now",
    },
  ];

  const displayBoards: DisplayBoard[] = [
    {
      id: "AVDB-01",
      location: "Platform 1",
      status: "online",
      lastSync: "2 sec ago",
      healthScore: 98,
    },
    {
      id: "AVDB-02",
      location: "Platform 2",
      status: "online",
      lastSync: "1 sec ago",
      healthScore: 95,
    },
    {
      id: "AVDB-03",
      location: "Platform 3",
      status: "online",
      lastSync: "3 sec ago",
      healthScore: 100,
    },
    {
      id: "AVDB-04",
      location: "Main Concourse",
      status: "error",
      lastSync: "45 sec ago",
      healthScore: 42,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Integrated Passenger Information System
        </h1>
        <p className="text-muted-foreground mt-1">
          Central Display Center (CDC) Dashboard
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-lg p-4 border",
              card.status === "success"
                ? "bg-success/5 border-success/20 text-foreground"
                : card.status === "warning"
                  ? "bg-warning/5 border-warning/20 text-foreground"
                  : card.status === "error"
                    ? "bg-destructive/5 border-destructive/20 text-foreground"
                    : "bg-card border-border text-foreground",
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <div
                className={cn(
                  "p-2 rounded-lg",
                  card.status === "success"
                    ? "bg-success/10 text-success"
                    : card.status === "warning"
                      ? "bg-warning/10 text-warning"
                      : card.status === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-foreground",
                )}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mode Toggle & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Operation Mode
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setOperationMode("auto")}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-medium",
                operationMode === "auto"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80",
              )}
            >
              <span>Auto Mode</span>
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOperationMode("manual")}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-medium",
                operationMode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80",
              )}
            >
              <span>Manual Mode</span>
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-foreground">
              <span>Send to Displays</span>
              <Send className="w-4 h-4" />
            </button>
            <button
              // onClick={handleTriggerDemo}
              // disabled={isSpeaking}
              disabled={true}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors font-medium text-primary disabled:opacity-50"
            >
              <span>Test Auto Announcement</span>
              {/* {isSpeaking ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )} */}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            System Health
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-success">94%</span>
            <span className="text-sm text-muted-foreground pb-1">healthy</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div
              className="bg-success h-full rounded-full"
              style={{ width: "94%" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trains */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Train className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Recent Trains
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Train No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                    ETA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Display Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTrains.map((train, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {train.trainNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {train.destination}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {train.platform}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {train.eta}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          train.displayStatus === "sent"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning",
                        )}
                      >
                        {train.displayStatus === "sent" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {train.displayStatus === "sent" ? "Sent" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
              <p className="text-sm font-medium text-foreground">
                Display Board Offline
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                AVDB-04 (Main Concourse) offline
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
              <p className="text-sm font-medium text-foreground">Sync Failed</p>
              <p className="text-xs text-muted-foreground mt-1">
                3 trains pending sync to displays
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/20">
              <p className="text-sm font-medium text-foreground">API Healthy</p>
              <p className="text-xs text-muted-foreground mt-1">
                All REST API endpoints responding
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Automatic Announcements - Ready for future implementation */}
      {operationMode === "auto" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Automatic Announcements
            </h2>
            {/* {isLoadingAnnouncements && (
              <Loader className="w-4 h-4 animate-spin ml-auto" />
            )} */}
          </div>
          <div className="p-6">
            {/* Future implementation: Display auto announcements here */}
            <p className="text-sm text-muted-foreground text-center py-4">
              No automatic announcements triggered yet. Train updates will be
              announced automatically.
            </p>
            {/* {autoAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No automatic announcements triggered yet. Train updates will be
                announced automatically.
              </p>
            ) : (
              <div className="space-y-3">
                {autoAnnouncements.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      record.status === "announced"
                        ? "bg-success/5 border-success/20"
                        : record.status === "pending"
                          ? "bg-warning/5 border-warning/20"
                          : "bg-destructive/5 border-destructive/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {record.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {record.triggerType.replace(/_/g, " ")}
                          </span>
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded",
                              record.status === "announced"
                                ? "bg-success/10 text-success"
                                : record.status === "pending"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive",
                            )}
                          >
                            {record.status.charAt(0).toUpperCase() +
                              record.status.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(record.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        </div>
      )}

      {/* Audio Announcements Management */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Voice Announcements
          </h2>
          <span
            className={cn(
              "ml-auto text-xs font-semibold px-3 py-1 rounded-full",
              operationMode === "auto"
                ? "bg-primary/10 text-primary"
                : "bg-secondary/10 text-secondary",
            )}
          >
            {operationMode.toUpperCase()} MODE
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Record New Announcement */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Record New Announcement
            </h3>
            <div className="space-y-3">
              {/* Recording Control */}
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isRecording
                        ? "Recording in progress..."
                        : "Ready to record"}
                    </p>
                    {isRecording && (
                      <p className="text-sm text-primary font-semibold mt-1">
                        {formatTime(recordingTime)}
                      </p>
                    )}
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-destructive">
                        RECORDING
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={startRecording}
                    disabled={isRecording || operationMode === "auto"}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </button>
                  <button
                    onClick={stopRecording}
                    disabled={!isRecording || operationMode === "auto"}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </button>
                </div>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) =>
                      setSelectedLanguage(
                        e.target.value as "english" | "hindi" | "regional",
                      )
                    }
                    disabled={isRecording || operationMode === "auto"}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="regional">Regional Language</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Display Color
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    disabled={isRecording || operationMode === "auto"}
                    className="w-full h-10 rounded-lg border border-border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recorded Announcements */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Recorded Announcements ({announcements.length})
            </h3>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No announcements recorded yet. Click "Start Recording" to create
                one.
              </p>
            ) : (
              <div className="space-y-2">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-lg border border-border bg-muted/50 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: announcement.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">
                            Audio Recording
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {announcement.language.charAt(0).toUpperCase() +
                              announcement.language.slice(1)}
                          </span>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            {formatTime(announcement.duration)}
                          </span>
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded",
                              announcement.isPlaying
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {announcement.isPlaying ? "Playing" : "Stopped"}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {announcement.createdAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            handlePlayAnnouncement(announcement.id)
                          }
                          disabled={operationMode === "auto"}
                          className={cn(
                            "p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            announcement.isPlaying
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-muted text-foreground hover:bg-muted/80",
                          )}
                          title={
                            announcement.isPlaying
                              ? "Stop Playback"
                              : "Play Announcement"
                          }
                        >
                          {announcement.isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
                          disabled={operationMode === "auto"}
                          className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Recording"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {operationMode === "auto" && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-sm font-medium text-foreground">
                ℹ️ Auto Mode Active
              </p>
              <p className="text-xs text-muted-foreground">
                In auto mode, announcements are triggered automatically based on
                NTES data and configured time-based rules. Manual recording and
                playback controls are disabled.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Display Boards Health */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Display Board Health
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayBoards.map((board) => (
              <div
                key={board.id}
                className={cn(
                  "p-4 rounded-lg border",
                  board.status === "online"
                    ? "bg-success/5 border-success/20"
                    : board.status === "error"
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-muted/5 border-border",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{board.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {board.location}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      board.status === "online"
                        ? "bg-success animate-pulse"
                        : board.status === "error"
                          ? "bg-destructive"
                          : "bg-muted",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Health Score
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-foreground">
                        {board.healthScore}%
                      </span>
                      {board.healthScore >= 90 && (
                        <TrendingUp className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last sync: {board.lastSync}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}