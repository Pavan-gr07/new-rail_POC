import { Link, useLocation } from "react-router-dom";
import {
    BarChart3,
    Settings,
    Train,
    Monitor,
    AlertCircle,
    Activity,
    Menu,
    ChevronRight,
    LogOut,
    Radio,
    LocateFixed,
    Network,
    ClipboardMinus,
    Video
} from "lucide-react";
import { useState } from "react";
import { cn } from "./lib/utils";

interface MainLayoutProps {
    children: React.ReactNode;
}

const navigationItems = [
    { label: "Dashboard", path: "/", icon: BarChart3 },
    { label: "Train Management", path: "/trains", icon: Train },
    { label: "Display Management", path: "/displays", icon: Monitor },
    { label: "Health Status", path: "/hsr", icon: Activity },
    { label: "Event Log", path: "/events", icon: AlertCircle },
    { label: "Announcements", path: "/announcements", icon: Radio },
    { label: "Configuration", path: "/config", icon: Settings },
    { label: "Network Topology", path: "/network", icon: Network },
    { label: "Edge NMS", path: "/gis", icon: LocateFixed },
    { label: "Central NMS", path: "/central", icon: LocateFixed },
    { label: "Reports", path: "/reports", icon: ClipboardMinus },
    { label: "Videos", path: "/videos", icon: Video },
];

export function MainLayout({ children }: MainLayoutProps) {
    // Desktop collapse state
    const [collapsed, setCollapsed] = useState(false);
    // Mobile drawer state
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        if (window.innerWidth >= 1024) {
            setCollapsed(!collapsed);
        } else {
            setMobileOpen(!mobileOpen);
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out lg:relative lg:z-0",
                    collapsed ? "lg:w-20" : "lg:w-64",
                    mobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-[40px] flex justify-center">
                            <Train className="w-6 h-6 text-sidebar-primary" />
                        </div>
                        {!collapsed && (
                            <span className="font-bold text-lg text-sidebar-foreground truncate tracking-tight">
                                IPIS Admin
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                    <ul className="space-y-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={cn(
                                            "flex items-center h-10 rounded-md transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent",
                                            collapsed ? "justify-center px-0" : "px-3 gap-3"
                                        )}
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 shrink-0">
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {!collapsed && (
                                            <span className="text-sm font-medium truncate animate-in fade-in duration-300">
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-sidebar-border">
                    <button className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-medium overflow-hidden",
                        collapsed && "justify-center"
                    )}>
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border"
                            aria-label="Toggle Sidebar"
                        >
                            {collapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <h1 className="text-sm font-semibold hidden md:block text-muted-foreground uppercase tracking-wider">
                            Station Management Console
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            SYSTEM ONLINE
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto bg-background/50 p-4 lg:p-8">
                    <div className="max-w-9xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}