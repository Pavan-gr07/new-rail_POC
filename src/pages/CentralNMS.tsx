import React, { useState, useRef } from 'react';
import { GoogleMap, MarkerF, useLoadScript, OverlayView } from '@react-google-maps/api';
import {
    Box, Paper, Typography, Button, IconButton, Chip, Stack, Drawer,
    List, ListItemText, ListItemIcon,
    Collapse, CircularProgress, Tooltip, Badge, ButtonGroup,
    ListItemButton
} from '@mui/material';
import {
    ChevronDown, ChevronUp, Train,
    ZoomIn, ZoomOut, Maximize2, Tag, Menu, Map as MapIcon
} from 'lucide-react';

// Types
interface Device {
    id: string;
    name: string;
    type: 'cdc' | 'pdc' | 'display' | 'custom_server' | 'cds_switch' | 'mldb' | 'pfd' | 'agdb' | 'cgdb' | 'avdb' | 'vdb' | 'taddb';
    status: 'online' | 'offline' | 'warning';
    position?: string;
    lat: number;
    lng: number;
    stationId: string;
}

interface Station {
    id: string;
    name: string;
    code: string;
    lat: number;
    lng: number;
    devices: Device[];
}

const GOOGLE_API_KEY = "AIzaSyB2jXz--ffrJ3iLAEFC8cBZMKPY1P7bRxM";
const LIBRARIES: any = ["places", "marker"];

// Mock Data - Replace with your API
const MOCK_STATIONS: Station[] = [
    {
        id: 'STN-001',
        name: 'Bangalore City Junction',
        code: 'SBC',
        lat: 12.9776,
        lng: 77.5719,
        devices: [
            { id: 'DEV-001', name: 'CDC Unit 1', type: 'cdc', status: 'online', position: 'Control Room', lat: 12.9776, lng: 77.5719, stationId: 'STN-001' },
            { id: 'DEV-002', name: 'PDC Unit 1', type: 'pdc', status: 'online', position: 'Platform 1', lat: 12.9778, lng: 77.5721, stationId: 'STN-001' },
            { id: 'DEV-003', name: 'Display Board 1', type: 'display', status: 'online', position: 'Platform 1', lat: 12.9779, lng: 77.5722, stationId: 'STN-001' },
            { id: 'DEV-004', name: 'Display Board 2', type: 'display', status: 'online', position: 'Platform 2', lat: 12.9774, lng: 77.5717, stationId: 'STN-001' },
            { id: 'DEV-005', name: 'MLDB 1', type: 'mldb', status: 'online', position: 'Main Entrance', lat: 12.9773, lng: 77.5716, stationId: 'STN-001' },
            { id: 'DEV-006', name: 'PFD 1', type: 'pfd', status: 'warning', position: 'Platform 3', lat: 12.9775, lng: 77.5718, stationId: 'STN-001' },
            { id: 'DEV-007', name: 'AGDB 1', type: 'agdb', status: 'online', position: 'Arrival Gate', lat: 12.9777, lng: 77.5720, stationId: 'STN-001' },
        ]
    },
    {
        id: 'STN-002',
        name: 'Yeshwantpur Junction',
        code: 'YPR',
        lat: 13.0284,
        lng: 77.5434,
        devices: [
            { id: 'DEV-008', name: 'CDC Unit 1', type: 'cdc', status: 'online', position: 'Control Room', lat: 13.0284, lng: 77.5434, stationId: 'STN-002' },
            { id: 'DEV-009', name: 'PDC Unit 1', type: 'pdc', status: 'online', position: 'Platform 1', lat: 13.0286, lng: 77.5436, stationId: 'STN-002' },
            { id: 'DEV-010', name: 'Display Board 1', type: 'display', status: 'online', position: 'Platform 1', lat: 13.0287, lng: 77.5437, stationId: 'STN-002' },
            { id: 'DEV-011', name: 'Display Board 2', type: 'display', status: 'offline', position: 'Platform 2', lat: 13.0282, lng: 77.5432, stationId: 'STN-002' },
            { id: 'DEV-012', name: 'CDS Switch 1', type: 'cds_switch', status: 'online', position: 'Server Room', lat: 13.0283, lng: 77.5433, stationId: 'STN-002' },
            { id: 'DEV-013', name: 'CGDB 1', type: 'cgdb', status: 'online', position: 'Circulating Area', lat: 13.0285, lng: 77.5435, stationId: 'STN-002' },
        ]
    },
    {
        id: 'STN-003',
        name: 'Whitefield',
        code: 'WFD',
        lat: 12.9698,
        lng: 77.7499,
        devices: [
            { id: 'DEV-014', name: 'CDC Unit 1', type: 'cdc', status: 'online', position: 'Control Room', lat: 12.9698, lng: 77.7499, stationId: 'STN-003' },
            { id: 'DEV-015', name: 'Display Board 1', type: 'display', status: 'online', position: 'Platform 1', lat: 12.9700, lng: 77.7501, stationId: 'STN-003' },
            { id: 'DEV-016', name: 'VDB 1', type: 'vdb', status: 'online', position: 'Waiting Hall', lat: 12.9696, lng: 77.7497, stationId: 'STN-003' },
            { id: 'DEV-017', name: 'AVDB 1', type: 'avdb', status: 'online', position: 'Arrival Area', lat: 12.9697, lng: 77.7498, stationId: 'STN-003' },
        ]
    },
    {
        id: 'STN-004',
        name: 'KR Puram',
        code: 'KRP',
        lat: 13.0089,
        lng: 77.6960,
        devices: [
            { id: 'DEV-018', name: 'CDC Unit 1', type: 'cdc', status: 'online', position: 'Control Room', lat: 13.0089, lng: 77.6960, stationId: 'STN-004' },
            { id: 'DEV-019', name: 'Display Board 1', type: 'display', status: 'online', position: 'Platform 1', lat: 13.0091, lng: 77.6962, stationId: 'STN-004' },
            { id: 'DEV-020', name: 'Display Board 2', type: 'display', status: 'warning', position: 'Platform 2', lat: 13.0087, lng: 77.6958, stationId: 'STN-004' },
            { id: 'DEV-021', name: 'Custom Server 1', type: 'custom_server', status: 'online', position: 'Server Room', lat: 13.0088, lng: 77.6959, stationId: 'STN-004' },
            { id: 'DEV-022', name: 'TADDB 1', type: 'taddb', status: 'online', position: 'Train Arrival Area', lat: 13.0090, lng: 77.6961, stationId: 'STN-004' },
        ]
    }
];

export default function CNMSGISView() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_API_KEY,
        libraries: LIBRARIES,
    });

    const [stations] = useState<Station[]>(MOCK_STATIONS);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [hoveredDevice, setHoveredDevice] = useState<Device | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
    const [mapZoom, setMapZoom] = useState(11);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

    // Label visibility control
    const [showLabels, setShowLabels] = useState<'always' | 'hover' | 'never'>('hover');

    // Station panel collapse states
    const [expandedStations, setExpandedStations] = useState<Record<string, boolean>>({});

    const mapRef = useRef<google.maps.Map | null>(null);

    // Toggle station expansion
    const toggleStation = (stationId: string) => {
        setExpandedStations(prev => ({
            ...prev,
            [stationId]: !prev[stationId]
        }));
    };

    // Navigate to station
    const focusOnStation = (station: Station) => {
        setMapCenter({ lat: station.lat, lng: station.lng });
        setMapZoom(15);
        setSelectedStation(station);
        setSelectedDevice(null);
    };

    // Navigate to device with maximum zoom
    const focusOnDevice = (device: Device) => {
        setMapCenter({ lat: device.lat, lng: device.lng });
        setMapZoom(20); // Maximum zoom for street-level detail
        const station = stations.find(s => s.id === device.stationId);
        setSelectedStation(station || null);
        setSelectedDevice(device);

        // Auto-clear highlight after 4 seconds
        setTimeout(() => {
            if (selectedDevice?.id === device.id) {
                setSelectedDevice(null);
            }
        }, 4000);
    };

    // Get device type emoji and label
    const getDeviceTypeInfo = (type: Device['type']) => {
        const typeMap: Record<Device['type'], { emoji: string; label: string }> = {
            cdc: { emoji: '🏢', label: 'CDC' },
            pdc: { emoji: '📡', label: 'PDC' },
            display: { emoji: '📺', label: 'Display' },
            custom_server: { emoji: '🖥️', label: 'Server' },
            cds_switch: { emoji: '🔌', label: 'Switch' },
            mldb: { emoji: '📊', label: 'MLDB' },
            pfd: { emoji: '📋', label: 'PFD' },
            agdb: { emoji: '🚪', label: 'AGDB' },
            cgdb: { emoji: '🔄', label: 'CGDB' },
            avdb: { emoji: '📹', label: 'AVDB' },
            vdb: { emoji: '💻', label: 'VDB' },
            taddb: { emoji: '🚂', label: 'TADDB' }
        };
        return typeMap[type] || { emoji: '📍', label: 'Device' };
    };

    // Get device icon with highlight effect
    const getDeviceIcon = (device: Device, isHighlighted: boolean = false, isHovered: boolean = false) => {
        const typeInfo = getDeviceTypeInfo(device.type);
        const colorMap = {
            online: '#4caf50',
            offline: '#f44336',
            warning: '#ff9800'
        };

        const color = colorMap[device.status];
        const size = isHighlighted ? 50 : isHovered ? 45 : 40;
        const strokeWidth = isHighlighted ? 4 : 2;
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
                <text x="${size / 2}" y="${size / 2 + 6}" font-size="${size / 2}" text-anchor="middle" fill="white">${typeInfo.emoji}</text>
            </svg>
        `)}`;
    };

    // Get station icon
    const getStationIcon = (station: Station) => {
        const onlineCount = station.devices.filter(d => d.status === 'online').length;
        const totalCount = station.devices.length;
        const color = onlineCount === totalCount ? '#2196f3' : onlineCount > 0 ? '#ff9800' : '#f44336';

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="75">
                <path d="M 30 70 L 20 40 L 40 40 Z" fill="${color}"/>
                <circle cx="30" cy="30" r="28" fill="${color}" stroke="white" stroke-width="3"/>
                <text x="30" y="38" font-size="24" text-anchor="middle" fill="white" font-weight="bold">🚉</text>
                <rect x="10" y="5" width="40" height="16" rx="4" fill="white" fill-opacity="0.95" />
                <text x="30" y="16" font-size="10" text-anchor="middle" fill="${color}" font-weight="bold">${station.code}</text>
            </svg>
        `)}`;
    };

    // Check if label should be shown for a device
    const shouldShowLabel = (device: Device) => {
        if (showLabels === 'always') return true;
        if (showLabels === 'never') return false;
        if (showLabels === 'hover') return hoveredDevice?.id === device.id || selectedDevice?.id === device.id;
        return false;
    };

    // Get stats
    const getStats = () => {
        const allDevices = stations.flatMap(s => s.devices);
        return {
            totalStations: stations.length,
            totalDevices: allDevices.length,
            online: allDevices.filter(d => d.status === 'online').length,
            offline: allDevices.filter(d => d.status === 'offline').length,
            warning: allDevices.filter(d => d.status === 'warning').length,
            cdc: allDevices.filter(d => d.type === 'cdc').length,
            displays: allDevices.filter(d => d.type === 'display').length,
        };
    };

    const stats = getStats();

    if (!isLoaded) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', width: '100%', display: 'flex', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
            {/* Left Sidebar - Station List */}
            <Drawer
                variant="persistent"
                anchor="left"
                open={drawerOpen}
                sx={{
                    width: drawerOpen ? 360 : 0,
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
                        CNMS - GIS View
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Centralized Network Management System
                    </Typography>
                </Box>

                {/* Statistics */}
                <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        <Chip label={`${stats.totalStations} Stations`} size="small" color="primary" icon={<Train size={14} />} />
                        <Chip label={`${stats.totalDevices} Devices`} size="small" />
                        <Chip label={`${stats.online} Online`} size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                        <Chip label={`${stats.offline} Offline`} size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
                        {stats.warning > 0 && <Chip label={`${stats.warning} Warning`} size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />}
                    </Stack>
                </Box>

                {/* Label Display Control */}
                <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tag size={16} />
                        Position Labels
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

                {/* Station List */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Train size={16} />
                        Stations
                    </Typography>
                    <List dense>
                        {stations.map(station => {
                            const onlineDevices = station.devices.filter(d => d.status === 'online').length;
                            const isExpanded = expandedStations[station.id];

                            return (
                                <Paper key={station.id} sx={{ mb: 1, overflow: 'hidden' }}>
                                    <ListItemButton
                                        onClick={() => focusOnStation(station)}
                                        sx={{
                                            bgcolor:
                                                selectedStation?.id === station.id
                                                    ? "action.selected"
                                                    : "transparent",
                                            "&:hover": { bgcolor: "action.hover" },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Badge badgeContent={station.devices.length} color="primary">
                                                <Train size={20} />
                                            </Badge>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" fontWeight="bold">
                                                    {station.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    {station.code} • {onlineDevices}/{station.devices.length} Online
                                                </Typography>
                                            }
                                        />
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleStation(station.id); }}>
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </IconButton>
                                    </ListItemButton>

                                    <Collapse in={isExpanded}>
                                        <Box sx={{ pl: 6, pr: 2, pb: 1, bgcolor: '#fafafa' }}>
                                            {station.devices.map(device => {
                                                const typeInfo = getDeviceTypeInfo(device.type);
                                                return (
                                                    <Box
                                                        key={device.id}
                                                        onClick={() => focusOnDevice(device)}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            py: 0.5,
                                                            px: 1,
                                                            cursor: 'pointer',
                                                            bgcolor: selectedDevice?.id === device.id ? 'primary.lighter' : 'transparent',
                                                            '&:hover': { bgcolor: 'action.hover' },
                                                            borderRadius: 1,
                                                            border: selectedDevice?.id === device.id ? '1px solid' : 'none',
                                                            borderColor: 'primary.main'
                                                        }}
                                                    >
                                                        <Typography fontSize="14px">{typeInfo.emoji}</Typography>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="caption" fontWeight="medium">
                                                                {device.name}
                                                            </Typography>
                                                            {device.position && (
                                                                <Typography variant="caption" display="block" color="text.secondary" fontSize="10px">
                                                                    📍 {device.position}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: device.status === 'online' ? '#4caf50' : device.status === 'offline' ? '#f44336' : '#ff9800',
                                                            }}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Collapse>
                                </Paper>
                            );
                        })}
                    </List>
                </Box>
            </Drawer>

            {/* Map Container */}
            <Box sx={{ flexGrow: 1, position: 'relative', height: '100%' }}>
                {/* Map Controls */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                    <Stack spacing={1}>
                        <Tooltip title="Toggle Sidebar">
                            <IconButton
                                onClick={() => setDrawerOpen(!drawerOpen)}
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
                                <MapIcon size={20} />
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
                        <Tooltip title="Fit All Stations">
                            <IconButton
                                onClick={() => {
                                    setMapCenter({ lat: 12.9716, lng: 77.5946 });
                                    setMapZoom(11);
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
                <Paper sx={{ position: 'absolute', bottom: 16, left: 16, p: 1.5, zIndex: 10, minWidth: 180 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>Legend</Typography>
                    <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4caf50' }} />
                            <Typography variant="caption" fontSize="11px">Online</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff9800' }} />
                            <Typography variant="caption" fontSize="11px">Warning</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f44336' }} />
                            <Typography variant="caption" fontSize="11px">Offline</Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* Google Map */}
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={mapZoom}
                    onLoad={(map) => { mapRef.current = map; }}
                    mapTypeId={mapType}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: false,
                        styles: mapType === 'roadmap' ? [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }]
                            }
                        ] : []
                    }}
                >
                    {/* Station Markers */}
                    {stations.map(station => (
                        <MarkerF
                            key={station.id}
                            position={{ lat: station.lat, lng: station.lng }}
                            onClick={() => focusOnStation(station)}
                            icon={{
                                url: getStationIcon(station),
                                anchor: new window.google.maps.Point(30, 70),
                                scaledSize: new window.google.maps.Size(60, 75)
                            }}
                        />
                    ))}

                    {/* Device Markers */}
                    {stations.flatMap(s => s.devices).map(device => {
                        const isHighlighted = selectedDevice?.id === device.id;
                        const isHovered = hoveredDevice?.id === device.id;
                        const iconSize = isHighlighted ? 50 : isHovered ? 45 : 40;

                        return (
                            <React.Fragment key={device.id}>
                                <MarkerF
                                    position={{ lat: device.lat, lng: device.lng }}
                                    onClick={() => focusOnDevice(device)}
                                    onMouseOver={() => setHoveredDevice(device)}
                                    onMouseOut={() => setHoveredDevice(null)}
                                    icon={{
                                        url: getDeviceIcon(device, isHighlighted, isHovered),
                                        anchor: new window.google.maps.Point(iconSize / 2, iconSize / 2),
                                        scaledSize: new window.google.maps.Size(iconSize, iconSize)
                                    }}
                                    zIndex={isHighlighted ? 1000 : isHovered ? 100 : 1}
                                />

                                {/* Compact Device Label */}
                                {shouldShowLabel(device) && (
                                    <OverlayView
                                        position={{ lat: device.lat, lng: device.lng }}
                                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                transform: 'translate(-50%, -100%)',
                                                top: -iconSize / 2 - 8,
                                                bgcolor: 'rgba(0, 0, 0, 0.85)',
                                                color: 'white',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                minWidth: 120,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                pointerEvents: 'none',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: -4,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: 0,
                                                    height: 0,
                                                    borderLeft: '4px solid transparent',
                                                    borderRight: '4px solid transparent',
                                                    borderTop: '4px solid rgba(0, 0, 0, 0.85)',
                                                }
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight="bold" fontSize="10px" display="block" sx={{ lineHeight: 1.2 }}>
                                                {device.name}
                                            </Typography>
                                            {device.position && (
                                                <Typography variant="caption" fontSize="9px" display="block" sx={{ opacity: 0.8, lineHeight: 1.2 }}>
                                                    📍 {device.position}
                                                </Typography>
                                            )}
                                            <Typography variant="caption" fontSize="8px" display="block" sx={{ opacity: 0.7, mt: 0.3, lineHeight: 1.2 }}>
                                                {device.lat.toFixed(6)}, {device.lng.toFixed(6)}
                                            </Typography>
                                        </Box>
                                    </OverlayView>
                                )}
                            </React.Fragment>
                        );
                    })}
                </GoogleMap>
            </Box>
        </Box>
    );
}