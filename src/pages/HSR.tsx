import { Activity, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";

interface DisplayHealth {
  id: string;
  location: string;
  overallHealth: number;
  led1: number;
  led2: number;
  led3: number;
  temperature: number;
  powerStatus: "good" | "warning" | "critical";
  lastSync: string;
}

export default function HSR() {
  const [displays] = useState<DisplayHealth[]>([
    {
      id: "AVDB-01",
      location: "Platform 1",
      overallHealth: 98,
      led1: 99,
      led2: 98,
      led3: 97,
      temperature: 45,
      powerStatus: "good",
      lastSync: "2 sec ago",
    },
    {
      id: "AVDB-02",
      location: "Platform 2",
      overallHealth: 95,
      led1: 96,
      led2: 95,
      led3: 94,
      temperature: 48,
      powerStatus: "good",
      lastSync: "1 sec ago",
    },
    {
      id: "AVDB-03",
      location: "Platform 3",
      overallHealth: 100,
      led1: 100,
      led2: 100,
      led3: 100,
      temperature: 42,
      powerStatus: "good",
      lastSync: "3 sec ago",
    },
    {
      id: "VDB-01",
      location: "Main Concourse",
      overallHealth: 42,
      led1: 40,
      led2: 45,
      led3: 41,
      temperature: 72,
      powerStatus: "critical",
      lastSync: "45 sec ago",
    },
    {
      id: "VDB-02",
      location: "Entry Gate",
      overallHealth: 65,
      led1: 68,
      led2: 62,
      led3: 65,
      temperature: 58,
      powerStatus: "warning",
      lastSync: "15 sec ago",
    },
    {
      id: "AVDB-04",
      location: "Platform 4",
      overallHealth: 92,
      led1: 93,
      led2: 91,
      led3: 92,
      temperature: 46,
      powerStatus: "good",
      lastSync: "5 sec ago",
    },
  ]);

  const getPowerStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-success/10 text-success";
      case "warning":
        return "bg-warning/10 text-warning";
      case "critical":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "text-success";
    if (health >= 70) return "text-warning";
    return "text-destructive";
  };

  const getHealthBg = (health: number) => {
    if (health >= 90) return "bg-success";
    if (health >= 70) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Health Status Report (HSR)
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor LED health status and diagnostic data for all display boards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Displays</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {displays.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Healthy</p>
          <p className="text-3xl font-bold text-success mt-2">
            {displays.filter((d) => d.overallHealth >= 90).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Warning</p>
          <p className="text-3xl font-bold text-warning mt-2">
            {
              displays.filter(
                (d) => d.overallHealth >= 70 && d.overallHealth < 90,
              ).length
            }
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Critical</p>
          <p className="text-3xl font-bold text-destructive mt-2">
            {displays.filter((d) => d.overallHealth < 70).length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {displays.map((display) => (
          <div
            key={display.id}
            className={cn(
              "bg-card border rounded-lg p-6",
              display.overallHealth >= 90
                ? "border-success/20 bg-success/5"
                : display.overallHealth >= 70
                  ? "border-warning/20 bg-warning/5"
                  : "border-destructive/20 bg-destructive/5",
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {display.id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {display.location}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      getHealthColor(display.overallHealth),
                    )}
                  >
                    {display.overallHealth}%
                  </span>
                </div>

                {/* Health Bar */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Overall Health
                  </p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        getHealthBg(display.overallHealth),
                      )}
                      style={{ width: `${display.overallHealth}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                      getPowerStatusColor(display.powerStatus),
                    )}
                  >
                    {display.powerStatus === "good" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    Power:{" "}
                    {display.powerStatus.charAt(0).toUpperCase() +
                      display.powerStatus.slice(1)}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Last sync: {display.lastSync}
                  </p>
                </div>
              </div>

              {/* LED Components */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    LED Panel 1
                  </p>
                  <div className="flex justify-center mb-2">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        getHealthBg(display.led1) === "bg-success"
                          ? "bg-success/20"
                          : getHealthBg(display.led1) === "bg-warning"
                            ? "bg-warning/20"
                            : "bg-destructive/20",
                      )}
                    >
                      <span
                        className={cn(
                          "text-lg font-bold",
                          getHealthColor(display.led1),
                        )}
                      >
                        {display.led1}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Health</p>
                </div>

                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    LED Panel 2
                  </p>
                  <div className="flex justify-center mb-2">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        getHealthBg(display.led2) === "bg-success"
                          ? "bg-success/20"
                          : getHealthBg(display.led2) === "bg-warning"
                            ? "bg-warning/20"
                            : "bg-destructive/20",
                      )}
                    >
                      <span
                        className={cn(
                          "text-lg font-bold",
                          getHealthColor(display.led2),
                        )}
                      >
                        {display.led2}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Health</p>
                </div>

                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    LED Panel 3
                  </p>
                  <div className="flex justify-center mb-2">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        getHealthBg(display.led3) === "bg-success"
                          ? "bg-success/20"
                          : getHealthBg(display.led3) === "bg-warning"
                            ? "bg-warning/20"
                            : "bg-destructive/20",
                      )}
                    >
                      <span
                        className={cn(
                          "text-lg font-bold",
                          getHealthColor(display.led3),
                        )}
                      >
                        {display.led3}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Health</p>
                </div>
              </div>

              {/* Temperature */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Temperature
                  </p>
                  <span
                    className={cn(
                      "font-semibold",
                      display.temperature <= 50
                        ? "text-success"
                        : display.temperature <= 60
                          ? "text-warning"
                          : "text-destructive",
                    )}
                  >
                    {display.temperature}°C
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      display.temperature <= 50
                        ? "bg-success"
                        : display.temperature <= 60
                          ? "bg-warning"
                          : "bg-destructive",
                    )}
                    style={{
                      width: `${Math.min((display.temperature / 80) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
