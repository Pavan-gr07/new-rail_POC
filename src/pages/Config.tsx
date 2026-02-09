import {
  Users,
  Palette,
  Server,
  Save,
  RefreshCw,
  Lock,
  Plus,
} from "lucide-react";
import { useState } from "react";

interface UserCategory {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
}

interface ColorConfig {
  status: string;
  color: string;
}

export default function Config() {
  const [userCategories] = useState<UserCategory[]>([
    {
      id: "1",
      name: "Administrator",
      permissions: [
        "Full Access",
        "User Management",
        "System Settings",
        "Report Generation",
      ],
      userCount: 3,
    },
    {
      id: "2",
      name: "Operator",
      permissions: [
        "Manual Announcements",
        "Train Updates",
        "Display Management",
      ],
      userCount: 12,
    },
    {
      id: "3",
      name: "Supervisor",
      permissions: ["Viewing Only", "Report Access", "Health Monitoring"],
      userCount: 5,
    },
    {
      id: "4",
      name: "Technician",
      permissions: ["Display Maintenance", "Configuration", "Diagnostics"],
      userCount: 8,
    },
  ]);

  const [colorConfigs] = useState<ColorConfig[]>([
    { status: "On Time", color: "#22c55e" },
    { status: "Delayed", color: "#f59e0b" },
    { status: "Cancelled", color: "#ef4444" },
    { status: "Boarding", color: "#3b82f6" },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    autoSyncInterval: "30",
    logRetentionCDC: "45",
    logRetentionEdge: "90",
    ntesSyncEnabled: true,
    audioEnabled: true,
    brightnessControl: "automatic",
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuration</h1>
        <p className="text-muted-foreground mt-1">
          System settings, user management, and display customization
        </p>
      </div>

      {/* System Settings */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            System Settings
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Auto Sync Interval (seconds)
              </label>
              <input
                type="number"
                value={systemSettings.autoSyncInterval}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    autoSyncInterval: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                CDC Log Retention (days)
              </label>
              <input
                type="number"
                value={systemSettings.logRetentionCDC}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    logRetentionCDC: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Edge NMS Log Retention (days)
              </label>
              <input
                type="number"
                value={systemSettings.logRetentionEdge}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    logRetentionEdge: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Brightness
              </label>
              <select
                value={systemSettings.brightnessControl}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    brightnessControl: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="automatic">Automatic (Light Sensor)</option>
                <option value="manual">Manual Control</option>
                <option value="schedule">Schedule-Based</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  NTES Server Integration
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable automatic train data fetching from NTES
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.ntesSyncEnabled}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      ntesSyncEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-checked:bg-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Audio Announcements
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable speaker announcements on display boards
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.audioEnabled}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      audioEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-checked:bg-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
              <Save className="w-4 h-4" />
              Save Settings
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-foreground">
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* User Categories */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            User Categories
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {category.userCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex flex-wrap gap-2">
                      {category.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button className="px-3 py-1 rounded-lg border border-border hover:bg-muted transition-colors text-foreground font-medium text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 rounded-lg border border-border hover:bg-muted transition-colors text-destructive font-medium text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Create New Category
          </button>
        </div>
      </div>

      {/* Display Colors */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Display Colors Configuration
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {colorConfigs.map((config, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {config.status}
                </p>
              </div>
              <input
                type="color"
                defaultValue={config.color}
                className="w-20 h-12 rounded-lg border-2 border-border cursor-pointer"
              />
              <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground font-medium text-sm">
                Reset
              </button>
            </div>
          ))}
          <div className="pt-4 border-t border-border">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
              <Save className="w-4 h-4" />
              Save Colors
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Security & Access
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Session Timeout
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Automatically logout inactive users
            </p>
            <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option>5 minutes</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>Never</option>
            </select>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              API Access Control
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Manage which systems can access the REST API
            </p>
            <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground font-medium text-sm">
              Manage API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
