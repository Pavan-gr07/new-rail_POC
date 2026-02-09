import React, { useState, useRef, useCallback, type JSX } from 'react';
import { GoogleMap, MarkerF, useLoadScript, OverlayView } from '@react-google-maps/api';
import {
    Box, Paper, Typography, TextField, Button, Card, CardContent, IconButton,
    Divider, Stack, CircularProgress, Drawer, Chip, Tooltip, ButtonGroup
} from '@mui/material';
import {
    Router, Trash2, GripVertical, Menu, ZoomIn, ZoomOut, Maximize2, Tag, Server, Cpu, Database, HardDrive, Monitor
} from 'lucide-react';

// Define Types
interface Device {
    id: string;
    name: string;
    type: 'CDC' | 'PDC' | 'CDS' | 'MLDB' | 'PFD' | 'AGDB' | 'CGDB' | 'AVDB' | 'VDB' | 'TADDB' | 'Custom Server' | 'Switch';
    lat?: number;
    lng?: number;
}

interface PlacedDevice extends Required<Device> {
    lat: number;
    lng: number;
}

interface ContextMenu {
    mouseX: number;
    mouseY: number;
    deviceId: string;
}

const GOOGLE_API_KEY = "AIzaSyB2jXz--ffrJ3iLAEFC8cBZMKPY1P7bRxM";
const LIBRARIES: any = ["places"];

// Device icon mapping
const getDeviceTypeIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
        'CDC': <Database size={18} />,
        'PDC': <Server size={18} />,
        'CDS': <HardDrive size={18} />,
        'MLDB': <Database size={18} />,
        'PFD': <Monitor size={18} />,
        'AGDB': <Database size={18} />,
        'CGDB': <Database size={18} />,
        'AVDB': <Database size={18} />,
        'VDB': <Database size={18} />,
        'TADDB': <Database size={18} />,
        'Custom Server': <Server size={18} />,
        'Switch': <Router size={18} />
    };
    return iconMap[type] || <Cpu size={18} />;
};

// Device emoji mapping for map markers
const getDeviceEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
        'CDC': '💾',
        'PDC': '🖥️',
        'CDS': '💿',
        'MLDB': '🗄️',
        'PFD': '📺',
        'AGDB': '📊',
        'CGDB': '📈',
        'AVDB': '📹',
        'VDB': '🎬',
        'TADDB': '📋',
        'Custom Server': '⚙️',
        'Switch': '🔀'
    };
    return emojiMap[type] || '📍';
};

export default function EdgeNMSGIS() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_API_KEY,
        libraries: LIBRARIES,
    });

    const [inventory, setInventory] = useState<Device[]>([
        // CDC Devices
        { id: "CDC-001", name: "CDC Primary", type: 'CDC' },
        { id: "CDC-002", name: "CDC Secondary", type: 'CDC' },

        // PDC Devices
        { id: "PDC-001", name: "PDC Node A", type: 'PDC' },
        { id: "PDC-002", name: "PDC Node B", type: 'PDC' },

        // Custom Servers
        { id: "SRV-001", name: "Custom Server 1", type: 'Custom Server' },
        { id: "SRV-002", name: "Custom Server 2", type: 'Custom Server' },

        // CDS Switch
        { id: "CDS-001", name: "CDS Switch A", type: 'CDS' },
        { id: "CDS-002", name: "CDS Switch B", type: 'CDS' },

        // MLDB Devices
        { id: "MLDB-001", name: "MLDB Unit 1", type: 'MLDB' },
        { id: "MLDB-002", name: "MLDB Unit 2", type: 'MLDB' },

        // PFD Devices
        { id: "PFD-001", name: "PFD Display 1", type: 'PFD' },
        { id: "PFD-002", name: "PFD Display 2", type: 'PFD' },

        // AGDB Devices
        { id: "AGDB-001", name: "AGDB System A", type: 'AGDB' },
        { id: "AGDB-002", name: "AGDB System B", type: 'AGDB' },

        // CGDB Devices
        { id: "CGDB-001", name: "CGDB Controller 1", type: 'CGDB' },
        { id: "CGDB-002", name: "CGDB Controller 2", type: 'CGDB' },

        // AVDB Devices
        { id: "AVDB-001", name: "AVDB Recorder A", type: 'AVDB' },
        { id: "AVDB-002", name: "AVDB Recorder B", type: 'AVDB' },

        // VDB Devices
        { id: "VDB-001", name: "VDB Storage 1", type: 'VDB' },
        { id: "VDB-002", name: "VDB Storage 2", type: 'VDB' },

        // TADDB Devices
        { id: "TADDB-001", name: "TADDB Terminal A", type: 'TADDB' },
        { id: "TADDB-002", name: "TADDB Terminal B", type: 'TADDB' },

        // Switch Devices
        { id: "SW-001", name: "Network Switch 1", type: 'Switch' },
        { id: "SW-002", name: "Network Switch 2", type: 'Switch' },
    ]);

    const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
    const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
    const [mapZoom, setMapZoom] = useState(13);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
    const [formCoords, setFormCoords] = useState({ lat: '', lng: '' });
    const [draggedItem, setDraggedItem] = useState<Device | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<PlacedDevice | null>(null);
    const [hoveredDevice, setHoveredDevice] = useState<PlacedDevice | null>(null);

    // Optimized dragging state
    const [draggingDevice, setDraggingDevice] = useState<PlacedDevice | null>(null);
    const isDraggingRef = useRef(false);
    const lastUpdateRef = useRef<number>(0);

    // Label visibility control
    const [showLabels, setShowLabels] = useState<'always' | 'hover' | 'never'>('hover');

    const mapRef = useRef<google.maps.Map | null>(null);
    const overlayRef = useRef<any>(null);

    // Drag and Drop Logic
    const handleDragStartFromDrawer = (device: Device) => {
        setDraggedItem(device);
    };

    const handleDropOnMap = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedItem || !overlayRef.current || !mapRef.current) return;

        const projection = overlayRef.current.getProjection();
        const mapDiv = mapRef.current.getDiv();
        const rect = mapDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const latLng = projection.fromContainerPixelToLatLng(new window.google.maps.Point(x, y));

        if (latLng) {
            const newDevice: PlacedDevice = {
                ...draggedItem,
                lat: latLng.lat(),
                lng: latLng.lng()
            } as PlacedDevice;

            setPlacedDevices(prev => [...prev, newDevice]);
            setInventory(prev => prev.filter(item => item.id !== draggedItem.id));
        }
        setDraggedItem(null);
    };

    const updateCoordinatesManually = () => {
        const newLat = parseFloat(formCoords.lat);
        const newLng = parseFloat(formCoords.lng);

        if (!isNaN(newLat) && !isNaN(newLng) && contextMenu) {
            setPlacedDevices(prev => prev.map(d =>
                d.id === contextMenu.deviceId ? { ...d, lat: newLat, lng: newLng } : d
            ));
            setMapCenter({ lat: newLat, lng: newLng });
        }
        setContextMenu(null);
    };

    // Focus on device with max zoom
    const focusOnDevice = (device: PlacedDevice) => {
        setMapCenter({ lat: device.lat, lng: device.lng });
        setMapZoom(20);
        setSelectedDevice(device);

        setTimeout(() => {
            if (selectedDevice?.id === device.id) {
                setSelectedDevice(null);
            }
        }, 3000);
    };

    // Optimized marker drag handlers
    const handleMarkerDragStart = useCallback((device: PlacedDevice) => {
        isDraggingRef.current = true;
        setDraggingDevice(device);
        lastUpdateRef.current = Date.now();
    }, []);

    const handleMarkerDrag = useCallback((e: google.maps.MapMouseEvent, deviceId: string) => {
        if (!e.latLng || !isDraggingRef.current) return;

        // Throttle updates to 60fps (16ms)
        const now = Date.now();
        if (now - lastUpdateRef.current < 16) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setDraggingDevice(prev => {
            if (!prev || prev.id !== deviceId) return prev;
            return { ...prev, lat, lng };
        });

        lastUpdateRef.current = now;
    }, []);

    const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent, deviceId: string) => {
        if (!e.latLng) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setPlacedDevices(prev => prev.map(d =>
            d.id === deviceId ? { ...d, lat, lng } : d
        ));

        isDraggingRef.current = false;
        setDraggingDevice(null);
    }, []);

    const getDeviceIcon = (device: PlacedDevice, isHighlighted: boolean = false, isHovered: boolean = false) => {
        const icon = getDeviceEmoji(device.type);

        const size = isHighlighted ? 50 : isHovered ? 45 : 40;
        const strokeWidth = isHighlighted ? 4 : 2;
        const color = '#1976d2';
        const pulseOpacity = isHighlighted ? 0.3 : 0;

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
                ${isHighlighted ? `
                    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" opacity="${pulseOpacity}">
                        <animate attributeName="r" from="${size / 2 - 2}" to="${size / 2 + 10}" dur="1.5s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                ` : ''}
                <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${color}" stroke="white" stroke-width="${strokeWidth}"/>
                <text x="${size / 2}" y="${size / 2 + 6}" font-size="${size / 2}" text-anchor="middle" fill="white">${icon}</text>
            </svg>
        `)}`;
    };

    // Check if label should be shown
    const shouldShowLabel = (device: PlacedDevice) => {
        if (showLabels === 'always') return true;
        if (showLabels === 'never') return false;
        if (showLabels === 'hover') {
            // Show label during drag, hover, or selection
            return draggingDevice?.id === device.id || hoveredDevice?.id === device.id || selectedDevice?.id === device.id;
        }
        return false;
    };

    if (!isLoaded) return (
        <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#f5f5f5'
        }}>
            {/* Left Sidebar */}
            <Drawer
                variant="persistent"
                anchor="left"
                open={sidebarOpen}
                sx={{
                    width: sidebarOpen ? 360 : 0,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 360,
                        boxSizing: 'border-box',
                        position: 'relative',
                        height: '100%',
                        border: 'none',
                        boxShadow: 2
                    },
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Menu size={24} />
                        Edge NMS - GIS
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Device Assignment & Management
                    </Typography>
                </Box>

                {/* Statistics */}
                <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        <Chip label={`${inventory.length} Available`} size="small" color="primary" />
                        <Chip label={`${placedDevices.length} Deployed`} size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                    </Stack>
                </Box>

                {/* Label Display Control */}
                <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tag size={16} />
                        Device Labels
                    </Typography>
                    <ButtonGroup size="small" fullWidth>
                        <Button
                            variant={showLabels === 'always' ? 'contained' : 'outlined'}
                            onClick={() => setShowLabels('always')}
                        >
                            Always
                        </Button>
                        <Button
                            variant={showLabels === 'hover' ? 'contained' : 'outlined'}
                            onClick={() => setShowLabels('hover')}
                        >
                            Hover
                        </Button>
                        <Button
                            variant={showLabels === 'never' ? 'contained' : 'outlined'}
                            onClick={() => setShowLabels('never')}
                        >
                            Never
                        </Button>
                    </ButtonGroup>
                </Box>

                {/* Device Lists */}
                <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        AVAILABLE ASSETS
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {inventory.map(d => (
                            <Card
                                key={d.id}
                                draggable
                                onDragStart={() => handleDragStartFromDrawer(d)}
                                sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
                            >
                                <CardContent sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:last-child': { pb: 1.5 }
                                }}>
                                    <GripVertical size={16} color="#ccc" />
                                    {getDeviceTypeIcon(d.type)}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">{d.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{d.type}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        DEPLOYED ON MAP
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {placedDevices.map(d => (
                            <Paper
                                key={d.id}
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    bgcolor: selectedDevice?.id === d.id ? 'action.selected' : 'transparent',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    border: selectedDevice?.id === d.id ? '1px solid' : undefined,
                                    borderColor: 'primary.main'
                                }}
                                onClick={() => focusOnDevice(d)}
                            >
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">{d.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{d.type}</Typography>
                                    <Typography variant="caption" color="primary" display="block">
                                        {d.lat.toFixed(6)}, {d.lng.toFixed(6)}
                                    </Typography>
                                </Box>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPlacedDevices(prev => prev.filter(p => p.id !== d.id));
                                        setInventory(prev => [...prev, { id: d.id, name: d.name, type: d.type }]);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            </Drawer>

            {/* Map Container */}
            <Box
                sx={{ flexGrow: 1, position: 'relative' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnMap}
            >
                {/* Map Controls */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                    <Stack spacing={1}>
                        <Tooltip title="Toggle Sidebar">
                            <IconButton
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <Menu size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Map Type">
                            <IconButton
                                onClick={() => {
                                    const types: ('roadmap' | 'satellite' | 'hybrid' | 'terrain')[] = ['roadmap', 'satellite', 'hybrid', 'terrain'];
                                    const currentIndex = types.indexOf(mapType);
                                    const nextIndex = (currentIndex + 1) % types.length;
                                    setMapType(types[nextIndex]);
                                }}
                                sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <Server size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Zoom In">
                            <IconButton
                                onClick={() => setMapZoom(prev => Math.min(prev + 1, 21))}
                                sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <ZoomIn size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Zoom Out">
                            <IconButton
                                onClick={() => setMapZoom(prev => Math.max(prev - 1, 3))}
                                sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <ZoomOut size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset View">
                            <IconButton
                                onClick={() => {
                                    setMapCenter({ lat: 12.9716, lng: 77.5946 });
                                    setMapZoom(13);
                                    setSelectedDevice(null);
                                }}
                                sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <Maximize2 size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                {/* Map Type Indicator */}
                <Paper sx={{ position: 'absolute', top: 16, left: 16, px: 1.5, py: 0.5, zIndex: 10 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                        {mapType}
                    </Typography>
                </Paper>

                {/* Legend */}
                <Paper sx={{ position: 'absolute', bottom: 16, left: 16, p: 1.5, zIndex: 10, minWidth: 200 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                        Device Types
                    </Typography>
                    <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Database size={12} />
                            <Typography variant="caption" fontSize="10px">CDC, MLDB, Databases</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Server size={12} />
                            <Typography variant="caption" fontSize="10px">PDC, Servers</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Router size={12} />
                            <Typography variant="caption" fontSize="10px">CDS, Switch</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Monitor size={12} />
                            <Typography variant="caption" fontSize="10px">PFD, Displays</Typography>
                        </Box>
                    </Stack>
                </Paper>

                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={mapZoom}
                    onLoad={(map) => { mapRef.current = map; }}
                    mapTypeId={mapType}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: false,
                        gestureHandling: 'greedy',
                        styles: mapType === 'roadmap' ? [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }]
                            }
                        ] : []
                    }}
                >
                    <OverlayView
                        position={mapCenter}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        onLoad={ow => overlayRef.current = ow}
                    >
                        <div />
                    </OverlayView>

                    {placedDevices.map((device) => {
                        const isHighlighted = selectedDevice?.id === device.id;
                        const isHovered = hoveredDevice?.id === device.id;
                        const isDragging = draggingDevice?.id === device.id;
                        const displayDevice = isDragging ? draggingDevice : device;
                        const iconSize = isHighlighted ? 50 : isHovered ? 45 : 40;

                        return (
                            <React.Fragment key={device.id}>
                                <MarkerF
                                    position={{ lat: displayDevice.lat, lng: displayDevice.lng }}
                                    draggable={true}
                                    onDragStart={() => handleMarkerDragStart(device)}
                                    onDrag={(e) => handleMarkerDrag(e, device.id)}
                                    onDragEnd={(e) => handleMarkerDragEnd(e, device.id)}
                                    onClick={() => !isDraggingRef.current && focusOnDevice(device)}
                                    onMouseOver={() => !isDraggingRef.current && setHoveredDevice(device)}
                                    onMouseOut={() => setHoveredDevice(null)}
                                    onRightClick={(e: any) => {
                                        if (isDraggingRef.current) return;
                                        setFormCoords({
                                            lat: device.lat.toFixed(6),
                                            lng: device.lng.toFixed(6)
                                        });
                                        setContextMenu({
                                            mouseX: e.domEvent.clientX,
                                            mouseY: e.domEvent.clientY,
                                            deviceId: device.id
                                        });
                                    }}
                                    icon={{
                                        url: getDeviceIcon(displayDevice, isHighlighted, isHovered),
                                        anchor: new window.google.maps.Point(iconSize / 2, iconSize / 2),
                                        scaledSize: new window.google.maps.Size(iconSize, iconSize)
                                    }}
                                    zIndex={isDragging ? 2000 : isHighlighted ? 1000 : isHovered ? 100 : 1}
                                    options={{
                                        optimized: false, // Disable optimization for smoother dragging
                                    }}
                                />

                                {/* Device Label - Always show during drag */}
                                {(shouldShowLabel(device) || isDragging) && (
                                    <OverlayView
                                        position={{ lat: displayDevice.lat, lng: displayDevice.lng }}
                                        mapPaneName={OverlayView.FLOAT_PANE}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                transform: 'translate(-50%, -100%)',
                                                top: -iconSize / 2 - 8,
                                                bgcolor: isDragging ? 'rgba(33, 150, 243, 0.95)' : 'rgba(0, 0, 0, 0.85)',
                                                color: 'white',
                                                px: 1.5,
                                                py: 0.75,
                                                borderRadius: 1,
                                                minWidth: 140,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                pointerEvents: 'none',
                                                border: isDragging ? '2px solid white' : 'none',
                                                transition: isDragging ? 'none' : 'all 0.2s',
                                                willChange: isDragging ? 'transform' : 'auto',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: -5,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: 0,
                                                    height: 0,
                                                    borderLeft: '5px solid transparent',
                                                    borderRight: '5px solid transparent',
                                                    borderTop: isDragging ? '5px solid rgba(33, 150, 243, 0.95)' : '5px solid rgba(0, 0, 0, 0.85)',
                                                }
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight="bold" fontSize="11px" display="block" sx={{ lineHeight: 1.3 }}>
                                                {device.name}
                                            </Typography>
                                            <Typography variant="caption" fontSize="9px" display="block" sx={{ opacity: 0.9, lineHeight: 1.2, textTransform: 'uppercase' }}>
                                                {device.type}
                                            </Typography>
                                            <Typography variant="caption" fontSize="9px" display="block" sx={{ opacity: 0.85, mt: 0.3, lineHeight: 1.2, fontFamily: 'monospace' }}>
                                                {displayDevice.lat.toFixed(6)}, {displayDevice.lng.toFixed(6)}
                                            </Typography>
                                        </Box>
                                    </OverlayView>
                                )}
                            </React.Fragment>
                        );
                    })}
                </GoogleMap>
            </Box>

            {/* Precision Edit Menu */}
            {contextMenu && (
                <Paper
                    sx={{
                        position: 'fixed',
                        top: contextMenu.mouseY,
                        left: contextMenu.mouseX,
                        zIndex: 2000,
                        p: 2,
                        width: 250,
                        boxShadow: 4,
                        borderRadius: 2
                    }}
                >
                    <Stack spacing={2}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            Adjust Coordinates
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                label="Lat"
                                size="small"
                                value={formCoords.lat}
                                onChange={(e) => setFormCoords({ ...formCoords, lat: e.target.value })}
                            />
                            <TextField
                                label="Lng"
                                size="small"
                                value={formCoords.lng}
                                onChange={(e) => setFormCoords({ ...formCoords, lng: e.target.value })}
                            />
                        </Stack>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={updateCoordinatesManually}
                        >
                            Update Location
                        </Button>
                        <Button
                            variant="text"
                            size="small"
                            color="inherit"
                            onClick={() => setContextMenu(null)}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}