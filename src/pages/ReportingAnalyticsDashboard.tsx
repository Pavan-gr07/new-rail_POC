import React, { useState } from 'react';
import { Download, TrendingUp, AlertCircle, Activity, Clock, BarChart3, Calendar, FileText } from 'lucide-react';

// Types
type ReportType = 'failure' | 'frequent-failures' | 'mttr' | 'availability';
type ExportFormat = 'pdf' | 'csv';

interface DateTimeRange {
    fromDate: string;
    fromTime: string;
    toDate: string;
    toTime: string;
}

interface FailureReport {
    id: string;
    stationInfo: string;
    oemInfo: string;
    deviceType: string;
    dateTime: string;
    failureDuration: string;
    status: 'resolved' | 'pending';
}

interface FrequentFailureAsset {
    assetId: string;
    assetName: string;
    deviceType: string;
    location: string;
    failureCount: number;
    lastFailure: string;
}

interface MTTRReport {
    deviceType: string;
    totalFailures: number;
    totalRepairTime: string;
    mttr: string;
    trend: 'up' | 'down' | 'stable';
}

interface AvailabilityReport {
    device: string;
    location: string;
    uptime: number;
    downtime: string;
    availability: number;
    status: 'good' | 'warning' | 'critical';
}

// Sample Data
const sampleFailureReports: FailureReport[] = [
    {
        id: 'FR001',
        stationInfo: 'New Delhi Railway Station - Platform 5',
        oemInfo: 'Tech Solutions Ltd.',
        deviceType: 'LED Display Board',
        dateTime: '2026-02-08 14:30:00',
        failureDuration: '2h 15m',
        status: 'resolved'
    },
    {
        id: 'FR002',
        stationInfo: 'Mumbai Central - Platform 2',
        oemInfo: 'InfoSys Networks',
        deviceType: 'PA System',
        dateTime: '2026-02-09 09:15:00',
        failureDuration: '45m',
        status: 'resolved'
    },
    {
        id: 'FR003',
        stationInfo: 'Chennai Central - Platform 8',
        oemInfo: 'Digital Tech Corp',
        deviceType: 'CCTV Camera',
        dateTime: '2026-02-10 11:20:00',
        failureDuration: '1h 30m',
        status: 'pending'
    }
];

const sampleFrequentFailures: FrequentFailureAsset[] = [
    {
        assetId: 'LED-DLI-P5-001',
        assetName: 'Platform 5 Main Display',
        deviceType: 'LED Display Board',
        location: 'New Delhi - Platform 5',
        failureCount: 12,
        lastFailure: '2026-02-08 14:30:00'
    },
    {
        assetId: 'PA-MUM-P2-003',
        assetName: 'Platform 2 PA Speaker',
        deviceType: 'PA System',
        location: 'Mumbai Central - Platform 2',
        failureCount: 8,
        lastFailure: '2026-02-09 09:15:00'
    },
    {
        assetId: 'CAM-CHN-P8-007',
        assetName: 'Platform 8 Camera 7',
        deviceType: 'CCTV Camera',
        location: 'Chennai Central - Platform 8',
        failureCount: 6,
        lastFailure: '2026-02-10 11:20:00'
    }
];

const sampleMTTRReports: MTTRReport[] = [
    {
        deviceType: 'LED Display Board',
        totalFailures: 45,
        totalRepairTime: '78h 30m',
        mttr: '1h 44m',
        trend: 'down'
    },
    {
        deviceType: 'PA System',
        totalFailures: 32,
        totalRepairTime: '42h 15m',
        mttr: '1h 19m',
        trend: 'stable'
    },
    {
        deviceType: 'CCTV Camera',
        totalFailures: 28,
        totalRepairTime: '56h 45m',
        mttr: '2h 1m',
        trend: 'up'
    }
];

const sampleAvailabilityReports: AvailabilityReport[] = [
    {
        device: 'LED Display Board - Platform 5',
        location: 'New Delhi Railway Station',
        uptime: 98.5,
        downtime: '10h 48m',
        availability: 98.5,
        status: 'good'
    },
    {
        device: 'PA System - Platform 2',
        location: 'Mumbai Central',
        uptime: 96.2,
        downtime: '27h 22m',
        availability: 96.2,
        status: 'warning'
    },
    {
        device: 'CCTV Camera - Platform 8',
        location: 'Chennai Central',
        uptime: 92.8,
        downtime: '51h 50m',
        availability: 92.8,
        status: 'critical'
    }
];

// Mock performance data for graphs
const performanceData = [
    { time: '00:00', cpu: 45, memory: 62, network: 78 },
    { time: '04:00', cpu: 52, memory: 68, network: 82 },
    { time: '08:00', cpu: 68, memory: 75, network: 88 },
    { time: '12:00', cpu: 72, memory: 78, network: 92 },
    { time: '16:00', cpu: 65, memory: 72, network: 85 },
    { time: '20:00', cpu: 58, memory: 70, network: 80 }
];

const ReportingAnalyticsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportType>('failure');
    const [dateTimeRange, setDateTimeRange] = useState<DateTimeRange>({
        fromDate: '2026-02-01',
        fromTime: '00:00',
        toDate: '2026-02-10',
        toTime: '23:59'
    });
    const [showGraphs, setShowGraphs] = useState(true);

    const handleDateTimeChange = (field: keyof DateTimeRange, value: string) => {
        setDateTimeRange(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = (format: ExportFormat) => {
        console.log(`Exporting ${activeTab} report as ${format.toUpperCase()}`);
        alert(`Report exported as ${format.toUpperCase()} successfully!`);
    };

    const handleGenerateReport = () => {
        console.log('Generating report with range:', dateTimeRange);
        alert('Report generated successfully!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                <BarChart3 className="text-blue-600" size={36} />
                                Reporting & Analytics Dashboard
                            </h1>
                            <p className="text-slate-600 mt-2">
                                Network performance, device health, and comprehensive alarm statistics
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowGraphs(!showGraphs)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <TrendingUp size={18} />
                                {showGraphs ? 'Hide' : 'Show'} Analytics
                            </button>
                        </div>
                    </div>
                </div>

                {/* Date/Time Range Selector */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="text-blue-600" size={24} />
                        Select Date & Time Range
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
                            <input
                                type="date"
                                value={dateTimeRange.fromDate}
                                onChange={(e) => handleDateTimeChange('fromDate', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">From Time</label>
                            <input
                                type="time"
                                value={dateTimeRange.fromTime}
                                onChange={(e) => handleDateTimeChange('fromTime', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
                            <input
                                type="date"
                                value={dateTimeRange.toDate}
                                onChange={(e) => handleDateTimeChange('toDate', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">To Time</label>
                            <input
                                type="time"
                                value={dateTimeRange.toTime}
                                onChange={(e) => handleDateTimeChange('toTime', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleGenerateReport}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <FileText size={18} />
                            Generate Report
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} />
                            Export PDF
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Graphical Analytics */}
                {showGraphs && (
                    <>
                        {/* Network Performance Analytics */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={24} />
                                Real-Time Network Performance Analytics
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* CPU Usage Graph */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">CPU Usage Trend</h3>
                                    <div className="h-48 flex items-end justify-between gap-2">
                                        {performanceData.map((data, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full relative" style={{ height: '160px' }}>
                                                    <div
                                                        className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700 cursor-pointer"
                                                        style={{ height: `${data.cpu}%` }}
                                                        title={`${data.cpu}%`}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-600">{data.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="text-2xl font-bold text-blue-600">72%</span>
                                        <span className="text-xs text-slate-600 ml-2">Current</span>
                                    </div>
                                </div>

                                {/* Memory Usage Graph */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Memory Usage Trend</h3>
                                    <div className="h-48 flex items-end justify-between gap-2">
                                        {performanceData.map((data, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full relative" style={{ height: '160px' }}>
                                                    <div
                                                        className="absolute bottom-0 w-full bg-purple-600 rounded-t-lg transition-all hover:bg-purple-700 cursor-pointer"
                                                        style={{ height: `${data.memory}%` }}
                                                        title={`${data.memory}%`}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-600">{data.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="text-2xl font-bold text-purple-600">78%</span>
                                        <span className="text-xs text-slate-600 ml-2">Current</span>
                                    </div>
                                </div>

                                {/* Network Traffic Graph */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Network Traffic Trend</h3>
                                    <div className="h-48 flex items-end justify-between gap-2">
                                        {performanceData.map((data, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full relative" style={{ height: '160px' }}>
                                                    <div
                                                        className="absolute bottom-0 w-full bg-green-600 rounded-t-lg transition-all hover:bg-green-700 cursor-pointer"
                                                        style={{ height: `${data.network}%` }}
                                                        title={`${data.network}%`}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-600">{data.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="text-2xl font-bold text-green-600">92%</span>
                                        <span className="text-xs text-slate-600 ml-2">Current</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alarm Statistics Analytics */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertCircle className="text-orange-600" size={24} />
                                Alarm Statistics & Distribution
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Alarm Severity Distribution - Donut Chart */}
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Alarm Severity Distribution</h3>
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-48 h-48">
                                            {/* Donut Chart */}
                                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                                {/* Critical - Red - 25% */}
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="70"
                                                    fill="none"
                                                    stroke="#ef4444"
                                                    strokeWidth="40"
                                                    strokeDasharray="110 440"
                                                    strokeDashoffset="0"
                                                />
                                                {/* Major - Orange - 35% */}
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="70"
                                                    fill="none"
                                                    stroke="#f97316"
                                                    strokeWidth="40"
                                                    strokeDasharray="154 440"
                                                    strokeDashoffset="-110"
                                                />
                                                {/* Minor - Yellow - 30% */}
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="70"
                                                    fill="none"
                                                    stroke="#eab308"
                                                    strokeWidth="40"
                                                    strokeDasharray="132 440"
                                                    strokeDashoffset="-264"
                                                />
                                                {/* Warning - Blue - 10% */}
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="70"
                                                    fill="none"
                                                    stroke="#3b82f6"
                                                    strokeWidth="40"
                                                    strokeDasharray="44 440"
                                                    strokeDashoffset="-396"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-slate-800">148</div>
                                                    <div className="text-xs text-slate-600">Total Alarms</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                                            <div>
                                                <div className="text-xs text-slate-600">Critical</div>
                                                <div className="text-sm font-bold text-slate-800">37 (25%)</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                            <div>
                                                <div className="text-xs text-slate-600">Major</div>
                                                <div className="text-sm font-bold text-slate-800">52 (35%)</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                            <div>
                                                <div className="text-xs text-slate-600">Minor</div>
                                                <div className="text-sm font-bold text-slate-800">44 (30%)</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                            <div>
                                                <div className="text-xs text-slate-600">Warning</div>
                                                <div className="text-sm font-bold text-slate-800">15 (10%)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alarms Over Time - Line Chart */}
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Alarms Trend (Last 7 Days)</h3>
                                    <div className="h-48 relative">
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-600">
                                            <span>50</span>
                                            <span>40</span>
                                            <span>30</span>
                                            <span>20</span>
                                            <span>10</span>
                                            <span>0</span>
                                        </div>

                                        {/* Chart area */}
                                        <div className="ml-8 h-full flex items-end justify-between gap-2">
                                            {[
                                                { day: 'Mon', critical: 8, major: 12, minor: 10 },
                                                { day: 'Tue', critical: 6, major: 10, minor: 8 },
                                                { day: 'Wed', critical: 10, major: 15, minor: 12 },
                                                { day: 'Thu', critical: 5, major: 8, minor: 7 },
                                                { day: 'Fri', critical: 4, major: 5, minor: 4 },
                                                { day: 'Sat', critical: 2, major: 2, minor: 2 },
                                                { day: 'Sun', critical: 2, major: 0, minor: 1 }
                                            ].map((data, idx) => {
                                                const total = data.critical + data.major + data.minor;
                                                const maxHeight = 160;

                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                                        <div className="w-full flex flex-col items-center justify-end" style={{ height: maxHeight }}>
                                                            {/* Stacked bars */}
                                                            <div
                                                                className="w-full bg-red-500 border-t-2 border-red-600 hover:bg-red-600 transition-all"
                                                                style={{ height: `${(data.critical / 50) * maxHeight}px` }}
                                                                title={`Critical: ${data.critical}`}
                                                            />
                                                            <div
                                                                className="w-full bg-orange-500 hover:bg-orange-600 transition-all"
                                                                style={{ height: `${(data.major / 50) * maxHeight}px` }}
                                                                title={`Major: ${data.major}`}
                                                            />
                                                            <div
                                                                className="w-full bg-yellow-500 hover:bg-yellow-600 transition-all"
                                                                style={{ height: `${(data.minor / 50) * maxHeight}px` }}
                                                                title={`Minor: ${data.minor}`}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-600 mt-2">{data.day}</span>
                                                        <span className="text-xs font-bold text-slate-700">{total}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Device Health Analytics */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Activity className="text-green-600" size={24} />
                                Device Health & Status Overview
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Device Status Distribution */}
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Device Status</h3>
                                    <div className="space-y-4">
                                        {[
                                            { status: 'Operational', count: 245, percentage: 85, color: 'bg-green-500' },
                                            { status: 'Degraded', count: 28, percentage: 10, color: 'bg-yellow-500' },
                                            { status: 'Failed', count: 14, percentage: 5, color: 'bg-red-500' }
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-slate-700">{item.status}</span>
                                                    <span className="text-sm font-bold text-slate-800">{item.count}</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-3">
                                                    <div
                                                        className={`${item.color} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                                        style={{ width: `${item.percentage}%` }}
                                                    >
                                                        <span className="text-xs text-white font-bold">{item.percentage}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-emerald-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Total Devices</span>
                                            <span className="text-2xl font-bold text-emerald-700">287</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Device Type Distribution */}
                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Device Types</h3>
                                    <div className="space-y-3">
                                        {[
                                            { type: 'LED Displays', count: 98, icon: '📺' },
                                            { type: 'PA Systems', count: 76, icon: '📢' },
                                            { type: 'CCTV Cameras', count: 65, icon: '📹' },
                                            { type: 'Access Points', count: 48, icon: '📡' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <span className="text-sm font-medium text-slate-700">{item.type}</span>
                                                </div>
                                                <span className="text-lg font-bold text-cyan-600">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Health Score Gauge */}
                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Overall Health Score</h3>
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="relative w-40 h-40">
                                            {/* Semi-circular gauge */}
                                            <svg viewBox="0 0 200 120" className="w-full">
                                                {/* Background arc */}
                                                <path
                                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                                    fill="none"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="20"
                                                    strokeLinecap="round"
                                                />
                                                {/* Colored arc (87% = 156.6 degrees out of 180) */}
                                                <path
                                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                                    fill="none"
                                                    stroke="#10b981"
                                                    strokeWidth="20"
                                                    strokeLinecap="round"
                                                    strokeDasharray="252 252"
                                                    strokeDashoffset="32.8"
                                                    className="transition-all duration-1000"
                                                />
                                                {/* Needle */}
                                                <line
                                                    x1="100"
                                                    y1="100"
                                                    x2="100"
                                                    y2="40"
                                                    stroke="#334155"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    transform="rotate(156.6 100 100)"
                                                />
                                                <circle cx="100" cy="100" r="8" fill="#334155" />
                                            </svg>
                                            <div className="absolute bottom-0 left-0 right-0 text-center">
                                                <div className="text-4xl font-bold text-green-600">87%</div>
                                                <div className="text-xs text-slate-600">Healthy</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Availability</span>
                                            <span className="font-bold text-green-600">96.2%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Performance</span>
                                            <span className="font-bold text-blue-600">92.8%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Reliability</span>
                                            <span className="font-bold text-purple-600">88.5%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Response Time & Performance Metrics */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Clock className="text-purple-600" size={24} />
                                Response Time & Performance Metrics
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Average Response Time by Station */}
                                <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Avg Response Time by Station</h3>
                                    <div className="space-y-3">
                                        {[
                                            { station: 'New Delhi', time: 12, max: 30 },
                                            { station: 'Mumbai Central', time: 18, max: 30 },
                                            { station: 'Chennai Central', time: 25, max: 30 },
                                            { station: 'Kolkata', time: 15, max: 30 },
                                            { station: 'Bangalore', time: 20, max: 30 }
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-slate-700">{item.station}</span>
                                                    <span className="text-sm font-bold text-violet-700">{item.time} min</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${item.time <= 15 ? 'bg-green-500' : item.time <= 20 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${(item.time / item.max) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ticket Resolution Time Distribution */}
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Ticket Resolution Time</h3>
                                    <div className="h-48 flex items-end justify-between gap-2">
                                        {[
                                            { range: '< 30m', count: 45, color: 'bg-green-500' },
                                            { range: '30m-1h', count: 38, color: 'bg-lime-500' },
                                            { range: '1h-2h', count: 28, color: 'bg-yellow-500' },
                                            { range: '2h-4h', count: 18, color: 'bg-orange-500' },
                                            { range: '> 4h', count: 8, color: 'bg-red-500' }
                                        ].map((item, idx) => {
                                            const height = (item.count / 50) * 100;
                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center">
                                                    <div
                                                        className={`w-full ${item.color} rounded-t hover:opacity-80 transition-all cursor-pointer relative group`}
                                                        style={{ height: `${height}%` }}
                                                    >
                                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {item.count} tickets
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-slate-600 mt-2 text-center">{item.range}</span>
                                                    <span className="text-xs font-bold text-slate-700">{item.count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Geographic Distribution & Top Performing Stations */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="text-teal-600" size={24} />
                                Geographic Distribution & Performance
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Performing Stations */}
                                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Performing Stations</h3>
                                    <div className="space-y-4">
                                        {[
                                            { station: 'Bangalore City', score: 98.5, devices: 45, rank: 1 },
                                            { station: 'New Delhi', score: 96.8, devices: 52, rank: 2 },
                                            { station: 'Hyderabad', score: 95.2, devices: 38, rank: 3 },
                                            { station: 'Pune Junction', score: 94.8, devices: 31, rank: 4 },
                                            { station: 'Mumbai Central', score: 93.5, devices: 48, rank: 5 }
                                        ].map((item) => (
                                            <div key={item.rank} className="flex items-center gap-4 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${item.rank === 1 ? 'bg-yellow-500' : item.rank === 2 ? 'bg-slate-400' : item.rank === 3 ? 'bg-orange-600' : 'bg-teal-500'
                                                    }`}>
                                                    {item.rank}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-800">{item.station}</div>
                                                    <div className="text-xs text-slate-600">{item.devices} devices</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-teal-600">{item.score}%</div>
                                                    <div className="text-xs text-slate-600">Score</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Regional Performance Heatmap */}
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Regional Performance</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { region: 'North', performance: 95, alarms: 28 },
                                            { region: 'South', performance: 97, alarms: 15 },
                                            { region: 'East', performance: 92, alarms: 35 },
                                            { region: 'West', performance: 94, alarms: 22 },
                                            { region: 'Central', performance: 93, alarms: 25 },
                                            { region: 'North-East', performance: 89, alarms: 42 }
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-lg transition-all hover:scale-105 cursor-pointer ${item.performance >= 95
                                                    ? 'bg-green-500 text-white'
                                                    : item.performance >= 90
                                                        ? 'bg-yellow-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                    }`}
                                            >
                                                <div className="text-lg font-bold">{item.region}</div>
                                                <div className="text-2xl font-bold mt-1">{item.performance}%</div>
                                                <div className="text-sm opacity-90 mt-2">{item.alarms} active alarms</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Report Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-slate-200">
                        <div className="flex overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('failure')}
                                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'failure'
                                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <AlertCircle size={18} />
                                Failure Reports
                            </button>
                            <button
                                onClick={() => setActiveTab('frequent-failures')}
                                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'frequent-failures'
                                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <TrendingUp size={18} />
                                Frequent Failures
                            </button>
                            <button
                                onClick={() => setActiveTab('mttr')}
                                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'mttr'
                                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Clock size={18} />
                                MTTR Analysis
                            </button>
                            <button
                                onClick={() => setActiveTab('availability')}
                                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'availability'
                                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Activity size={18} />
                                Device Availability
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Failure Reports Tab */}
                        {activeTab === 'failure' && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    Device Failure Reports
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Station Information</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">OEM Information</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Device Type</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Failure Duration</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {sampleFailureReports.map((report) => (
                                                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{report.id}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.stationInfo}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.oemInfo}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.deviceType}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.dateTime}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-orange-600">{report.failureDuration}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === 'resolved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Frequent Failures Tab */}
                        {activeTab === 'frequent-failures' && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    Most Frequently Failing Assets
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Asset ID</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Asset Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Device Type</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Failure Count</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Last Failure</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {sampleFrequentFailures.map((asset) => (
                                                <tr key={asset.assetId} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{asset.assetId}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.assetName}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.deviceType}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.location}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                                                            {asset.failureCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.lastFailure}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* MTTR Tab */}
                        {activeTab === 'mttr' && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    Mean Time to Repair (MTTR) Analysis
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Device Type</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total Failures</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total Repair Time</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">MTTR</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {sampleMTTRReports.map((report) => (
                                                <tr key={report.deviceType} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{report.deviceType}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.totalFailures}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.totalRepairTime}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{report.mttr}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${report.trend === 'down'
                                                            ? 'bg-green-100 text-green-700'
                                                            : report.trend === 'up'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {report.trend === 'down' && '↓'}
                                                            {report.trend === 'up' && '↑'}
                                                            {report.trend === 'stable' && '→'}
                                                            {report.trend}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Device Availability Tab */}
                        {activeTab === 'availability' && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    Device Availability Report
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Device</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Uptime %</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Downtime</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Availability</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {sampleAvailabilityReports.map((report, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{report.device}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.location}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                                                                <div
                                                                    className={`h-2 rounded-full ${report.uptime >= 98
                                                                        ? 'bg-green-500'
                                                                        : report.uptime >= 95
                                                                            ? 'bg-yellow-500'
                                                                            : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${report.uptime}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">{report.uptime}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{report.downtime}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{report.availability}%</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === 'good'
                                                            ? 'bg-green-100 text-green-700'
                                                            : report.status === 'warning'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> All reports can be exported in PDF or CSV format. Use the date/time range selector to filter data for specific periods. Real-time analytics provide proactive maintenance insights.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReportingAnalyticsDashboard;