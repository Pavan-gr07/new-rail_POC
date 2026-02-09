import { useState, useRef, } from "react";
import type { CSSProperties } from "react";

// Type Definitions
interface Device {
    name: string;
    type: "MLDB" | "PFD" | "AGDB" | "CGDB" | "Video Display";
    status: "online" | "warning" | "down";
    health: number;
}

interface Station {
    id: string;
    name: string;
    status: "online" | "warning" | "critical";
    location: string;
    devices: Device[];
}

type DeviceStatus = "online" | "warning" | "down" | "critical";

interface ViewportState {
    x: number;
    y: number;
    scale: number;
}

export default function NetworkTopology() {

    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [transitioning, setTransitioning] = useState<boolean>(false);

    // Viewport state for pan and zoom
    const [viewport, setViewport] = useState<ViewportState>({
        x: -332, y: 103, scale: 0.6
    });
    console.log(viewport, "viewport")
    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const generateDevices = (): Device[] => [
        { name: "MLDB-01", type: "MLDB", status: "online", health: 98 },
        { name: "PFD-01", type: "PFD", status: "online", health: 95 },
        { name: "AGDB-01", type: "AGDB", status: "warning", health: 72 },
        { name: "CGDB-01", type: "CGDB", status: "online", health: 100 },
        { name: "VDU-Display-01", type: "Video Display", status: "online", health: 88 },
        { name: "VDU-Display-02", type: "Video Display", status: "online", health: 92 },
        { name: "MLDB-02", type: "MLDB", status: "online", health: 97 },
        { name: "PFD-02", type: "PFD", status: "warning", health: 68 },
        { name: "AGDB-02", type: "AGDB", status: "online", health: 94 },
        { name: "CGDB-02", type: "CGDB", status: "online", health: 96 },
    ];

    const generateStations = (count: number): Station[] => {
        return Array.from({ length: count }, (_, index) => {
            const stationName = `Station ${index + 1}`;
            const statusRandom = Math.random();
            const status = statusRandom > 0.9 ? "critical" : statusRandom > 0.8 ? "warning" : "online";

            return {
                id: `st${index}`,
                name: stationName,
                status: status as "online" | "warning" | "critical",
                location: `Terminal ${index + 1}`,
                devices: generateDevices(),
            };
        });
    };

    // Change this number to test with different station counts
    const stations = generateStations(200);

    // Tree layout algorithm - improved to prevent overlapping
    const buildTreeLayout = (stations: Station[]): {
        nodes: { station: Station; x: number; y: number }[],
        root: { x: number; y: number },
        svgWidth: number,
        svgHeight: number,
        bounds: { minX: number, maxX: number, minY: number, maxY: number }
    } => {
        const horizontalSpacing = 250;
        const verticalSpacing = 300;
        const nodesPerLevel = 8; // Nodes per row in the tree

        const nodes: { station: Station; x: number; y: number }[] = [];

        // Calculate tree structure
        let currentLevel = 0;
        let nodeIndex = 0;

        const rootX = 2000; // Center horizontally in a large SVG
        const rootY = 100;   // Start from top

        while (nodeIndex < stations.length) {
            const nodesInThisLevel = Math.min(nodesPerLevel, stations.length - nodeIndex);
            const levelWidth = (nodesInThisLevel - 1) * horizontalSpacing;
            const startX = rootX - (levelWidth / 2);

            for (let i = 0; i < nodesInThisLevel; i++) {
                if (nodeIndex >= stations.length) break;

                nodes.push({
                    station: stations[nodeIndex],
                    x: startX + (i * horizontalSpacing),
                    y: rootY + ((currentLevel + 1) * verticalSpacing),
                });

                nodeIndex++;
            }

            currentLevel++;
        }

        // Calculate bounds based on actual node positions
        const allX = nodes.map(n => n.x).concat(rootX);
        const allY = nodes.map(n => n.y).concat(rootY);

        const minX = Math.min(...allX) - 200;
        const maxX = Math.max(...allX) + 200;
        const minY = Math.min(...allY) - 200;
        const maxY = Math.max(...allY) + 200;

        const svgWidth = maxX - minX;
        const svgHeight = maxY - minY;

        return {
            nodes,
            root: { x: rootX, y: rootY },
            svgWidth,
            svgHeight,
            bounds: { minX, maxX, minY, maxY }
        };
    };

    const treeLayout = buildTreeLayout(stations);

    const getStatusColor = (status: DeviceStatus): string => {
        switch (status) {
            case "online":
                return "#10b981";
            case "warning":
                return "#f59e0b";
            case "down":
            case "critical":
                return "#ef4444";
            default:
                return "#6b7280";
        }
    };

    const getStationOverallStatus = (station: Station): DeviceStatus => {
        const downDevices = station.devices.filter((d) => d.status === "down").length;
        const warningDevices = station.devices.filter((d) => d.status === "warning").length;

        if (downDevices >= 3) return "critical";
        if (downDevices > 0 || warningDevices >= 3) return "warning";
        return "online";
    };

    const handleStationClick = (station: Station): void => {
        setTransitioning(true);
        setTimeout(() => {
            setSelectedStation(station);
            setTransitioning(false);
        }, 600);
    };

    const handleBackToTopology = (): void => {
        setTransitioning(true);
        setTimeout(() => {
            setSelectedStation(null);
            setSelectedDevice(null);
            setTransitioning(false);
        }, 600);
    };

    const handleDeviceClick = (device: Device): void => {
        setSelectedDevice(device);
    };

    const getDeviceIcon = (type: Device["type"]): string => {
        switch (type) {
            case "MLDB":
                return "🔌";
            case "PFD":
                return "⚡";
            case "AGDB":
                return "🎛️";
            case "CGDB":
                return "🖥️";
            case "Video Display":
                return "📺";
            default:
                return "📡";
        }
    };
    // 1. Add a clamp helper to keep the canvas in view
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));


    const getPanBoundaries = (scale: number) => {
        if (!canvasRef.current) return { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };

        const containerWidth = canvasRef.current.clientWidth;
        const containerHeight = canvasRef.current.clientHeight;

        // Content dimensions at current scale
        const contentWidth = treeLayout.svgWidth * scale;
        const contentHeight = treeLayout.svgHeight * scale;

        // Calculate boundaries to keep content visible
        // Allow panning only within content bounds with some padding
        const padding = 100;

        return {
            minX: -(contentWidth - containerWidth / 2) - padding,
            maxX: containerWidth / 2 + padding,
            minY: -padding,
            maxY: contentHeight - containerHeight + padding
        };
    };
    // 2. Refined Wheel Handler (Smooth Zoom)
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();

        if (!canvasRef.current) return;

        const container = canvasRef.current;
        const rect = container.getBoundingClientRect();

        // Mouse position relative to container
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Container center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Use center as zoom point instead of mouse position
        const zoomPointX = centerX;
        const zoomPointY = centerY;

        const zoomSpeed = 0.001;
        const delta = -e.deltaY * zoomSpeed;

        setViewport(prev => {
            const newScale = clamp(prev.scale * (1 + delta), 0.2, 2);
            const scaleDiff = newScale - prev.scale;

            // Adjust position to zoom towards center
            const newX = prev.x - (zoomPointX - rect.width / 2) * scaleDiff / prev.scale;
            const newY = prev.y - zoomPointY * scaleDiff / prev.scale;

            const boundaries = getPanBoundaries(newScale);

            return {
                scale: newScale,
                x: clamp(newX, boundaries.minX, boundaries.maxX),
                y: clamp(newY, boundaries.minY, boundaries.maxY)
            };
        });
    };

    // 3. Refined Mouse Move (Smooth Panning)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            // We divide by viewport.scale so the drag "sticks" to the mouse
            const dx = (e.clientX - startPan.x) / viewport.scale;
            const dy = (e.clientY - startPan.y) / viewport.scale;

            setViewport(prev => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy,
            }));

            setStartPan({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left click only
            setIsPanning(true);
            setStartPan({ x: e.clientX, y: e.clientY });
        }
    };


    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleZoomIn = () => {
        setViewport({ ...viewport, scale: Math.min(viewport.scale + 0.2, 3) });
    };

    const handleZoomOut = () => {
        setViewport({ ...viewport, scale: Math.max(viewport.scale - 0.2, 0.1) });
    };

    const handleResetView = () => {
        setViewport({ x: 0, y: 0, scale: 0.6 });
    };

    return (
        <div style={styles.app}>
            {/* Transition Overlay */}
            {transitioning && (
                <div style={styles.transitionOverlay}>
                    <div style={styles.loader}></div>
                    <p style={styles.transitionText}>Establishing Connection...</p>
                </div>
            )}

            {/* TOPOLOGY VIEW */}
            {!selectedStation && (
                <div
                    style={styles.topologyView}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Header */}
                    <div style={styles.header}>
                        <h1 style={styles.title}>
                            <span style={styles.titleIcon}>🛰️</span>
                            EDGE NETWORK MANAGEMENT SYSTEM
                        </h1>
                        <div style={styles.subtitle}>
                            Divisional HQ - Network Topology ({stations.length} Stations)
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div style={styles.zoomControls}>
                        <button style={styles.zoomButton} onClick={handleZoomIn} title="Zoom In">
                            ➕
                        </button>
                        <button style={styles.zoomButton} onClick={handleZoomOut} title="Zoom Out">
                            ➖
                        </button>
                        <button style={styles.zoomButton} onClick={handleResetView} title="Reset View">
                            🎯
                        </button>
                        <div style={styles.zoomLevel}>{Math.round(viewport.scale * 100)}%</div>
                    </div>

                    {/* Instructions */}
                    <div style={styles.instructions}>
                        🖱️ Drag to pan • Scroll to zoom • Click stations for details
                    </div>

                    {/* Canvas Container */}
                    <div
                        ref={canvasRef}
                        style={{
                            ...styles.canvasContainer,
                            cursor: isPanning ? 'grabbing' : 'grab',
                            // transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                            transition: isPanning ? 'none' : 'transform 0.2s ease-out'
                        }}
                    >
                        <div
                            style={{
                                ...styles.canvas,
                                transform: `translate(calc(-50% + ${viewport.x}px), ${viewport.y}px) scale(${viewport.scale})`,
                            }}
                        >
                            {/* SVG for Connection Lines */}
                            <svg
                                ref={svgRef}
                                style={{
                                    ...styles.connectionSvg,
                                    width: treeLayout.svgWidth,
                                    height: treeLayout.svgHeight,
                                }}
                            >
                                {treeLayout.nodes.map((node, idx) => {
                                    const overallStatus = getStationOverallStatus(node.station);
                                    return (
                                        <line
                                            key={node.station.id}
                                            x1={treeLayout.root.x}
                                            y1={treeLayout.root.y}
                                            x2={node.x}
                                            y2={node.y}
                                            stroke={getStatusColor(overallStatus)}
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                            style={styles.connectionLine}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Central HQ Node */}
                            <div
                                style={{
                                    ...styles.hqWrapper,
                                    left: treeLayout.root.x,
                                    top: treeLayout.root.y,
                                }}
                            >
                                <div style={styles.hq}>
                                    <div style={styles.hqPulse}></div>
                                    <div style={styles.hqIcon}>🏢</div>
                                    <div style={styles.hqLabel}>DIVISIONAL HQ</div>
                                    <div style={styles.hqStatus}>MASTER NODE</div>
                                </div>
                            </div>

                            {/* Stations */}
                            {treeLayout.nodes.map((node, idx) => {
                                const overallStatus = getStationOverallStatus(node.station);
                                const statusColor = getStatusColor(overallStatus);

                                return (
                                    <div
                                        key={node.station.id}
                                        style={{
                                            ...styles.stationNode,
                                            left: node.x,
                                            top: node.y,
                                            borderColor: statusColor,
                                            boxShadow: `0 0 30px ${statusColor}`,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStationClick(node.station);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <div
                                            style={{
                                                ...styles.stationPulse,
                                                borderColor: statusColor,
                                            }}
                                        ></div>
                                        <div style={styles.stationIcon}>📍</div>
                                        <div style={styles.stationName}>{node.station.name}</div>
                                        <div style={styles.stationLocation}>{node.station.location}</div>
                                        <div
                                            style={{
                                                ...styles.stationStatus,
                                                color: statusColor,
                                            }}
                                        >
                                            {overallStatus.toUpperCase()}
                                        </div>
                                        <div style={styles.deviceCount}>
                                            {node.station.devices.length} Devices
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* STATION DETAIL VIEW */}
            {selectedStation && !selectedDevice && (
                <div style={styles.stationView}>
                    <button style={styles.backButton} onClick={handleBackToTopology}>
                        ⬅ Back to Topology
                    </button>

                    <div style={styles.stationHeader}>
                        <div style={styles.stationHeaderLeft}>
                            <h2 style={styles.stationTitle}>
                                📍 {selectedStation.name}
                            </h2>
                            <div style={styles.stationSubtitle}>
                                {selectedStation.location} • Edge Network Management
                            </div>
                        </div>
                        <div
                            style={{
                                ...styles.stationHeaderStatus,
                                backgroundColor: getStatusColor(
                                    getStationOverallStatus(selectedStation)
                                ),
                            }}
                        >
                            {getStationOverallStatus(selectedStation).toUpperCase()}
                        </div>
                    </div>

                    {/* Device Stats */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>
                                {selectedStation.devices.filter((d) => d.status === "online").length}
                            </div>
                            <div style={styles.statLabel}>Online</div>
                            <div style={{ ...styles.statBar, backgroundColor: "#10b981" }}></div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>
                                {selectedStation.devices.filter((d) => d.status === "warning").length}
                            </div>
                            <div style={styles.statLabel}>Warning</div>
                            <div style={{ ...styles.statBar, backgroundColor: "#f59e0b" }}></div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>
                                {selectedStation.devices.filter((d) => d.status === "down").length}
                            </div>
                            <div style={styles.statLabel}>Down</div>
                            <div style={{ ...styles.statBar, backgroundColor: "#ef4444" }}></div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{selectedStation.devices.length}</div>
                            <div style={styles.statLabel}>Total Devices</div>
                            <div style={{ ...styles.statBar, backgroundColor: "#3b82f6" }}></div>
                        </div>
                    </div>

                    {/* Device Grid */}
                    <div style={styles.deviceGrid}>
                        {selectedStation.devices.map((device, idx) => (
                            <div
                                key={idx}
                                style={{
                                    ...styles.deviceCard,
                                    borderColor: getStatusColor(device.status),
                                    animationDelay: `${idx * 0.05}s`,
                                }}
                                onClick={() => handleDeviceClick(device)}
                            >
                                <div
                                    style={{
                                        ...styles.deviceGlow,
                                        backgroundColor: getStatusColor(device.status),
                                    }}
                                ></div>
                                <div style={styles.deviceIcon}>{getDeviceIcon(device.type)}</div>
                                <div style={styles.deviceName}>{device.name}</div>
                                <div style={styles.deviceType}>{device.type}</div>
                                <div style={styles.healthBar}>
                                    <div
                                        style={{
                                            ...styles.healthFill,
                                            width: `${device.health}%`,
                                            backgroundColor: getStatusColor(device.status),
                                        }}
                                    ></div>
                                </div>
                                <div style={styles.healthText}>{device.health}% Health</div>
                                <div
                                    style={{
                                        ...styles.deviceStatus,
                                        color: getStatusColor(device.status),
                                    }}
                                >
                                    ● {device.status.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DEVICE DETAIL VIEW */}
            {selectedDevice && (
                <div style={styles.deviceDetailOverlay} onClick={() => setSelectedDevice(null)}>
                    <div style={styles.deviceDetailPanel} onClick={(e) => e.stopPropagation()}>
                        <button
                            style={styles.closeButton}
                            onClick={() => setSelectedDevice(null)}
                        >
                            ✕
                        </button>

                        <div style={styles.deviceDetailHeader}>
                            <div style={styles.deviceDetailIcon}>
                                {getDeviceIcon(selectedDevice.type)}
                            </div>
                            <div>
                                <h3 style={styles.deviceDetailName}>{selectedDevice.name}</h3>
                                <div style={styles.deviceDetailType}>{selectedDevice.type}</div>
                            </div>
                            <div
                                style={{
                                    ...styles.deviceDetailStatus,
                                    backgroundColor: getStatusColor(selectedDevice.status),
                                }}
                            >
                                {selectedDevice.status.toUpperCase()}
                            </div>
                        </div>

                        <div style={styles.deviceDetailBody}>
                            <div style={styles.detailSection}>
                                <h4 style={styles.sectionTitle}>System Information</h4>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>IP Address:</span>
                                        <span style={styles.detailValue}>
                                            10.{Math.floor(Math.random() * 255)}.
                                            {Math.floor(Math.random() * 255)}.
                                            {Math.floor(Math.random() * 255)}
                                        </span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>MAC Address:</span>
                                        <span style={styles.detailValue}>
                                            {Array.from({ length: 6 }, () =>
                                                Math.floor(Math.random() * 256)
                                                    .toString(16)
                                                    .padStart(2, "0")
                                            ).join(":")}
                                        </span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Uptime:</span>
                                        <span style={styles.detailValue}>
                                            {Math.floor(Math.random() * 500)} hours
                                        </span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Firmware:</span>
                                        <span style={styles.detailValue}>v2.{Math.floor(Math.random() * 10)}.{Math.floor(Math.random() * 20)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.detailSection}>
                                <h4 style={styles.sectionTitle}>Performance Metrics</h4>
                                <div style={styles.metricsGrid}>
                                    <div style={styles.metricCard}>
                                        <div style={styles.metricLabel}>CPU Usage</div>
                                        <div style={styles.metricValue}>
                                            {Math.floor(Math.random() * 40 + 30)}%
                                        </div>
                                        <div style={styles.metricBar}>
                                            <div
                                                style={{
                                                    ...styles.metricFill,
                                                    width: `${Math.floor(Math.random() * 40 + 30)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div style={styles.metricCard}>
                                        <div style={styles.metricLabel}>Memory</div>
                                        <div style={styles.metricValue}>
                                            {Math.floor(Math.random() * 30 + 40)}%
                                        </div>
                                        <div style={styles.metricBar}>
                                            <div
                                                style={{
                                                    ...styles.metricFill,
                                                    width: `${Math.floor(Math.random() * 30 + 40)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div style={styles.metricCard}>
                                        <div style={styles.metricLabel}>Network I/O</div>
                                        <div style={styles.metricValue}>
                                            {Math.floor(Math.random() * 800 + 200)} MB/s
                                        </div>
                                        <div style={styles.metricBar}>
                                            <div
                                                style={{
                                                    ...styles.metricFill,
                                                    width: `${Math.floor(Math.random() * 50 + 20)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.detailSection}>
                                <h4 style={styles.sectionTitle}>Recent Events</h4>
                                <div style={styles.eventList}>
                                    <div style={styles.eventItem}>
                                        <span style={styles.eventTime}>2 min ago</span>
                                        <span style={styles.eventText}>SNMP poll successful</span>
                                        <span style={{ ...styles.eventDot, backgroundColor: "#10b981" }}>
                                            ●
                                        </span>
                                    </div>
                                    <div style={styles.eventItem}>
                                        <span style={styles.eventTime}>15 min ago</span>
                                        <span style={styles.eventText}>Heartbeat received</span>
                                        <span style={{ ...styles.eventDot, backgroundColor: "#10b981" }}>
                                            ●
                                        </span>
                                    </div>
                                    <div style={styles.eventItem}>
                                        <span style={styles.eventTime}>1 hour ago</span>
                                        <span style={styles.eventText}>
                                            {selectedDevice.status === "warning"
                                                ? "Warning: High CPU usage detected"
                                                : selectedDevice.status === "down"
                                                    ? "Critical: Device unreachable"
                                                    : "System check completed"}
                                        </span>
                                        <span
                                            style={{
                                                ...styles.eventDot,
                                                backgroundColor: getStatusColor(selectedDevice.status),
                                            }}
                                        >
                                            ●
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ==================== STYLES ==================== */

const styles: { [key: string]: CSSProperties } = {
    app: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000000 100%)",
        color: "#fff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
    },

    // Transition Overlay
    transitionOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease",
    },
    loader: {
        width: 60,
        height: 60,
        border: "4px solid rgba(59, 130, 246, 0.1)",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    transitionText: {
        marginTop: 20,
        fontSize: 16,
        color: "#3b82f6",
        letterSpacing: 2,
    },

    // Topology View
    topologyView: {
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        userSelect: "none",
    },
    header: {
        position: "absolute",
        top: 20,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 100,
        pointerEvents: "none",
    },
    title: {
        fontSize: 36,
        fontWeight: 700,
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 10,
        letterSpacing: 2,
    },
    titleIcon: {
        marginRight: 15,
    },
    subtitle: {
        fontSize: 14,
        color: "#94a3b8",
        letterSpacing: 2,
        textTransform: "uppercase",
    },

    // Zoom Controls
    zoomControls: {
        position: "fixed",
        top: 120,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 100,
    },
    zoomButton: {
        width: 50,
        height: 50,
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "2px solid #3b82f6",
        borderRadius: 12,
        color: "#fff",
        fontSize: 20,
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    zoomLevel: {
        textAlign: "center",
        fontSize: 12,
        color: "#94a3b8",
        padding: "8px 12px",
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: 8,
        border: "1px solid #334155",
    },

    // Instructions
    instructions: {
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px 24px",
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "1px solid #3b82f6",
        borderRadius: 12,
        fontSize: 14,
        color: "#94a3b8",
        zIndex: 100,
        pointerEvents: "none",
    },

    // Canvas Container
    canvasContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        // backgroundColor: "#b1b8ca",
    },
    canvas: {
        position: "absolute",
        top: 0,
        transformOrigin: "top left",
        transition: "transform 0.1s ease-out",
        willChange: "transform",
    },

    // HQ Node
    hqWrapper: {
        position: "absolute",
        transform: "translate(-50%, -50%)",
    },
    hq: {
        position: "relative",
        width: 180,
        height: 180,
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: "50%",
        border: "3px solid #3b82f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 60px rgba(59, 130, 246, 0.6)",
        animation: "pulse 3s infinite",
    },
    hqPulse: {
        position: "absolute",
        width: "120%",
        height: "120%",
        border: "2px solid #3b82f6",
        borderRadius: "50%",
        animation: "ping 2s infinite",
    },
    hqIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    hqLabel: {
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 1,
        marginBottom: 5,
    },
    hqStatus: {
        fontSize: 10,
        color: "#3b82f6",
        letterSpacing: 1,
    },

    // Connection Lines
    connectionSvg: {
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
    },
    connectionLine: {
        animation: "dash 3s linear infinite",
    },

    // Stations
    stationNode: {
        position: "absolute",
        transform: "translate(-50%, -50%)",
        width: 160,
        padding: 16,
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: 16,
        border: "2px solid",
        cursor: "pointer",
        transition: "all 0.3s ease",
        animation: "fadeInUp 0.8s ease",
        pointerEvents: "auto",
    },
    stationPulse: {
        position: "absolute",
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        border: "2px solid",
        borderRadius: 16,
        animation: "ping 2s infinite",
        pointerEvents: "none",
    },
    stationIcon: {
        fontSize: 28,
        textAlign: "center",
        marginBottom: 8,
    },
    stationName: {
        fontSize: 15,
        fontWeight: 700,
        textAlign: "center",
        marginBottom: 4,
    },
    stationLocation: {
        fontSize: 11,
        color: "#94a3b8",
        textAlign: "center",
        marginBottom: 8,
    },
    stationStatus: {
        fontSize: 11,
        fontWeight: 700,
        textAlign: "center",
        marginBottom: 4,
        letterSpacing: 1,
    },
    deviceCount: {
        fontSize: 10,
        color: "#64748b",
        textAlign: "center",
    },

    // Station Detail View
    stationView: {
        position: "relative",
        minHeight: "100vh",
        padding: 40,
        zIndex: 1,
        animation: "slideInRight 0.6s ease",
        overflowY: "auto",
    },
    backButton: {
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        color: "#fff",
        border: "2px solid #3b82f6",
        padding: "12px 24px",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        transition: "all 0.3s ease",
        marginBottom: 30,
    },
    stationHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 40,
        padding: 30,
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: 20,
        border: "1px solid #334155",
        flexWrap: "wrap",
        gap: 20,
    },
    stationHeaderLeft: {
        flex: 1,
        minWidth: 250,
    },
    stationTitle: {
        fontSize: 36,
        fontWeight: 700,
        marginBottom: 8,
    },
    stationSubtitle: {
        fontSize: 14,
        color: "#94a3b8",
        letterSpacing: 1,
    },
    stationHeaderStatus: {
        padding: "10px 20px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 1,
    },

    // Stats Grid
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginBottom: 40,
    },
    statCard: {
        padding: 24,
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: 16,
        border: "1px solid #334155",
        position: "relative",
        overflow: "hidden",
    },
    statValue: {
        fontSize: 42,
        fontWeight: 700,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: "#94a3b8",
        marginBottom: 12,
    },
    statBar: {
        height: 4,
        borderRadius: 2,
        animation: "slideInLeft 1s ease",
    },

    // Device Grid
    deviceGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 20,
    },
    deviceCard: {
        position: "relative",
        padding: 24,
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: 16,
        border: "2px solid",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        animation: "fadeInUp 0.6s ease both",
        overflow: "hidden",
    },
    deviceGlow: {
        position: "absolute",
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        borderRadius: "50%",
        filter: "blur(40px)",
        opacity: 0.2,
    },
    deviceIcon: {
        fontSize: 40,
        textAlign: "center",
        marginBottom: 12,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 6,
        textAlign: "center",
    },
    deviceType: {
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 16,
        textAlign: "center",
    },
    healthBar: {
        width: "100%",
        height: 8,
        background: "#1e293b",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    healthFill: {
        height: "100%",
        transition: "width 1s ease",
        borderRadius: 4,
    },
    healthText: {
        fontSize: 12,
        color: "#94a3b8",
        textAlign: "center",
        marginBottom: 12,
    },
    deviceStatus: {
        fontSize: 12,
        fontWeight: 700,
        textAlign: "center",
        letterSpacing: 1,
    },

    // Device Detail Modal
    deviceDetailOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
        animation: "fadeIn 0.3s ease",
    },
    deviceDetailPanel: {
        width: "100%",
        maxWidth: 900,
        maxHeight: "90vh",
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: 24,
        border: "2px solid #3b82f6",
        overflow: "auto",
        position: "relative",
        animation: "scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
    closeButton: {
        position: "absolute",
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        background: "#ef4444",
        border: "none",
        borderRadius: "50%",
        color: "#fff",
        fontSize: 20,
        cursor: "pointer",
        transition: "all 0.3s ease",
        zIndex: 1,
    },
    deviceDetailHeader: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: 40,
        borderBottom: "1px solid #334155",
        flexWrap: "wrap",
    },
    deviceDetailIcon: {
        fontSize: 64,
    },
    deviceDetailName: {
        fontSize: 28,
        fontWeight: 700,
        marginBottom: 4,
    },
    deviceDetailType: {
        fontSize: 14,
        color: "#94a3b8",
    },
    deviceDetailStatus: {
        marginLeft: "auto",
        padding: "10px 20px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 1,
    },
    deviceDetailBody: {
        padding: 40,
    },
    detailSection: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 20,
        color: "#3b82f6",
    },
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 16,
    },
    detailItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: 16,
        background: "#0f172a",
        borderRadius: 12,
        border: "1px solid #334155",
    },
    detailLabel: {
        fontSize: 14,
        color: "#94a3b8",
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 600,
        color: "#fff",
    },
    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
    },
    metricCard: {
        padding: 20,
        background: "#0f172a",
        borderRadius: 12,
        border: "1px solid #334155",
    },
    metricLabel: {
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 28,
        fontWeight: 700,
        marginBottom: 12,
    },
    metricBar: {
        width: "100%",
        height: 6,
        background: "#1e293b",
        borderRadius: 3,
        overflow: "hidden",
    },
    metricFill: {
        height: "100%",
        background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
        borderRadius: 3,
        transition: "width 1s ease",
    },
    eventList: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    eventItem: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        background: "#0f172a",
        borderRadius: 12,
        border: "1px solid #334155",
    },
    eventTime: {
        fontSize: 12,
        color: "#64748b",
        minWidth: 80,
    },
    eventText: {
        fontSize: 14,
        flex: 1,
    },
    eventDot: {
        fontSize: 20,
    },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes ping {
    0% { transform: scale(1); opacity: 1; }
    75%, 100% { transform: scale(1.2); opacity: 0; }
  }
  
  @keyframes dash {
    to { stroke-dashoffset: -20; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInLeft {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  div[style*="stationNode"]:hover {
    transform: translate(-50%, -50%) scale(1.15) !important;
  }
  
  div[style*="deviceCard"]:hover {
    transform: translateY(-10px) scale(1.05) !important;
  }
  
  button[style*="zoomButton"]:hover,
  button[style*="backButton"]:hover,
  button[style*="closeButton"]:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
`;
document.head.appendChild(styleSheet);