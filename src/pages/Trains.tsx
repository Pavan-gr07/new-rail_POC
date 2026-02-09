import { Train, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";

interface Train {
  id: string;
  number: string;
  name: string;
  source: string;
  destination: string;
  platform: number;
  eta: string;
  etd: string;
  status: "on-time" | "delayed" | "cancelled" | "boarding";
  coach: string;
}

export default function Trains() {
  const [trains] = useState<Train[]>([
    {
      id: "1",
      number: "12345",
      name: "Express Delhi",
      source: "Mumbai Central",
      destination: "New Delhi",
      platform: 1,
      eta: "14:30",
      etd: "14:45",
      status: "on-time",
      coach: "A1-A10",
    },
    {
      id: "2",
      number: "12346",
      name: "Shatabdi Express",
      source: "Mumbai Central",
      destination: "Pune",
      platform: 2,
      eta: "15:00",
      etd: "15:15",
      status: "delayed",
      coach: "B1-B8",
    },
    {
      id: "3",
      number: "12347",
      name: "Rajdhani Express",
      source: "Mumbai Central",
      destination: "Bangalore",
      platform: 3,
      eta: "16:30",
      etd: "16:45",
      status: "boarding",
      coach: "C1-C12",
    },
    {
      id: "4",
      number: "12348",
      name: "Premier Express",
      source: "Mumbai Central",
      destination: "Hyderabad",
      platform: 4,
      eta: "17:00",
      etd: "17:15",
      status: "on-time",
      coach: "D1-D10",
    },
    {
      id: "5",
      number: "12349",
      name: "Intercity Express",
      source: "Mumbai Central",
      destination: "Ahmedabad",
      platform: 5,
      eta: "18:30",
      etd: "18:45",
      status: "cancelled",
      coach: "E1-E8",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time":
        return "bg-success/10 text-success";
      case "delayed":
        return "bg-warning/10 text-warning";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      case "boarding":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Train Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage train schedules, platforms, and real-time updates
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          Add Train
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Trains</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {trains.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">On Time</p>
          <p className="text-3xl font-bold text-success mt-2">
            {trains.filter((t) => t.status === "on-time").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Delayed</p>
          <p className="text-3xl font-bold text-warning mt-2">
            {trains.filter((t) => t.status === "delayed").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Cancelled</p>
          <p className="text-3xl font-bold text-destructive mt-2">
            {trains.filter((t) => t.status === "cancelled").length}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Train className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">All Trains</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Train No
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Train Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  ETD
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
              {trains.map((train) => (
                <tr
                  key={train.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {train.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {train.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex flex-col">
                      <span>{train.source}</span>
                      <span className="text-xs text-muted-foreground">
                        → {train.destination}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {train.platform}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {train.eta}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {train.etd}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        getStatusColor(train.status),
                      )}
                    >
                      {getStatusLabel(train.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button className="p-2 hover:bg-muted rounded transition-colors text-primary">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded transition-colors text-destructive">
                      <Trash2 className="w-4 h-4" />
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
