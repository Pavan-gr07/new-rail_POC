import React, { useState, useEffect, useRef } from 'react';
import {
    Train, Radio, Volume2, VolumeX, Play, Pause, SkipForward,
    Clock, AlertTriangle, Settings, CheckCircle, XCircle,
    Calendar, MapPin, Bell, Mic, Save, RefreshCw, Plus,
    X, Edit2, Trash2, Eye, EyeOff, Download, Upload, StopCircle,
    MicOff, PlayCircle, Headphones
} from 'lucide-react';

// Type definitions
interface Train {
    trainNo: string;
    name: string;
    source: string;
    destination: string;
    platform: string;
    eta: string;
    status: 'OnTime' | 'Late' | 'Arrived' | 'Cancelled';
    type: 'arrival' | 'departure';
    delay?: number;
}

interface AnnouncementText {
    language: string;
    text: string;
}

interface AnnouncementItem {
    id: number;
    train: Train;
    type: string;
    announcements: AnnouncementText[];
    timestamp: string;
    status: 'queued' | 'completed' | 'stopped';
    repeatCount: number;
    currentRepeat: number;
    completedAt?: string;
}

interface RecordedAudio {
    url: string;
    blob: Blob;
    type: string;
    language: string;
    timestamp: string;
}

interface RecordedAudios {
    [key: string]: RecordedAudio;
}

interface AnnouncementTemplates {
    [key: string]: {
        english: string;
        hindi: string;
        kannada: string;
    };
}

type Language = 'english' | 'hindi' | 'kannada';
type AnnouncementType = 'arrival' | 'arrived' | 'departure' | 'platformChange' | 'late' | 'cancelled' | 'diverted' | 'other';

// Mock train data
const MOCK_TRAINS: Train[] = [
    { trainNo: '12345', name: 'Rajdhani Express', source: 'New Delhi', destination: 'Mumbai Central', platform: '1', eta: '14:30', status: 'OnTime', type: 'arrival' },
    { trainNo: '22626', name: 'Shatabdi Express', source: 'Chennai', destination: 'Mysore', platform: '2', eta: '15:45', status: 'Late', delay: 15, type: 'arrival' },
    { trainNo: '16229', name: 'Vasco Express', source: 'Mysore', destination: 'Vasco', platform: '3', eta: '16:20', status: 'OnTime', type: 'departure' },
    { trainNo: '12008', name: 'Shatabdi Express', source: 'Mysore', destination: 'Bangalore', platform: '4', eta: '17:00', status: 'Arrived', type: 'departure' },
    { trainNo: '56220', name: 'Passenger', source: 'Bangalore', destination: 'Mysore', platform: '5', eta: '18:15', status: 'OnTime', type: 'arrival' },
];

const ANNOUNCEMENT_TEMPLATES: AnnouncementTemplates = {
    arrival: {
        english: "Train number {trainNo}, {trainName}, from {source} to {destination}, is arriving on platform number {platform} at {time}",
        hindi: "ट्रेन संख्या {trainNo}, {trainName}, {source} से {destination} के लिए, प्लेटफार्म संख्या {platform} पर {time} बजे आ रही है",
        kannada: "ರೈಲು ಸಂಖ್ಯೆ {trainNo}, {trainName}, {source} ನಿಂದ {destination} ಗೆ, ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸಂಖ್ಯೆ {platform} ರಲ್ಲಿ {time} ಗಂಟೆಗೆ ಆಗಮಿಸುತ್ತಿದೆ"
    },
    arrived: {
        english: "Train number {trainNo}, {trainName}, from {source} to {destination}, has arrived on platform number {platform}",
        hindi: "ट्रेन संख्या {trainNo}, {trainName}, {source} से {destination} के लिए, प्लेटफार्म संख्या {platform} पर पहुंच गई है",
        kannada: "ರೈಲು ಸಂಖ್ಯೆ {trainNo}, {trainName}, {source} ನಿಂದ {destination} ಗೆ, ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸಂಖ್ಯೆ {platform} ರಲ್ಲಿ ಆಗಮಿಸಿದೆ"
    },
    departure: {
        english: "Train number {trainNo}, {trainName}, to {destination}, is departing from platform number {platform} at {time}",
        hindi: "ट्रेन संख्या {trainNo}, {trainName}, {destination} के लिए, प्लेटफार्म संख्या {platform} से {time} बजे प्रस्थान कर रही है",
        kannada: "ರೈಲು ಸಂಖ್ಯೆ {trainNo}, {trainName}, {destination} ಗೆ, ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸಂಖ್ಯೆ {platform} ರಿಂದ {time} ಗಂಟೆಗೆ ನಿರ್ಗಮಿಸುತ್ತಿದೆ"
    },
    platformChange: {
        english: "Attention please. Train number {trainNo}, {trainName}, platform changed from {oldPlatform} to {newPlatform}",
        hindi: "कृपया ध्यान दें। ट्रेन संख्या {trainNo}, {trainName}, का प्लेटफार्म {oldPlatform} से बदलकर {newPlatform} हो गया है",
        kannada: "ದಯವಿಟ್ಟು ಗಮನಿಸಿ. ರೈಲು ಸಂಖ್ಯೆ {trainNo}, {trainName}, ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ {oldPlatform} ರಿಂದ {newPlatform} ಗೆ ಬದಲಾಗಿದೆ"
    },
    late: {
        english: "Train number {trainNo}, {trainName}, is running late by {delay} minutes",
        hindi: "ट्रेन संख्या {trainNo}, {trainName}, {delay} मिनट देरी से चल रही है",
        kannada: "ರೈಲು ಸಂಖ್ಯೆ {trainNo}, {trainName}, {delay} ನಿಮಿಷಗಳ ತಡವಾಗಿ ಚಲಿಸುತ್ತಿದೆ"
    },
    cancelled: {
        english: "Train number {trainNo}, {trainName}, has been cancelled",
        hindi: "ट्रेन संख्या {trainNo}, {trainName}, रद्द कर दी गई है",
        kannada: "ರೈಲು ಸಂಖ್ಯೆ {trainNo}, {trainName}, ರದ್ದುಗೊಂಡಿದೆ"
    },
    diverted: {
        english: "Train number {trainNo}, {trainName}, has been diverted via {route}",
        hindi: "ट्रेन संख्या {trainNo}, {trainName}, को {route} होकर मोड़ दिया गया है",
        kannada: "ರೈಲು ಸಂಖ್ಯೆ {trainNo}, {trainName}, {route} ಮೂಲಕ ತಿರುಗಿಸಲಾಗಿದೆ"
    },
    other: {
        english: "The special announcement is as follows: {route}",
        hindi: "विशेष घोषणा इस प्रकार है: {route}",
        kannada: "ವಿಶೇಷ ಘೋಷಣೆ ಹೀಗಿದೆ: {route}"
    }
};

const AnnouncementSystem: React.FC = () => {
    const [trains, setTrains] = useState<Train[]>(MOCK_TRAINS);
    const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
    const [announcementQueue, setAnnouncementQueue] = useState<AnnouncementItem[]>([]);
    const [currentAnnouncement, setCurrentAnnouncement] = useState<AnnouncementItem | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [announcementHistory, setAnnouncementHistory] = useState<AnnouncementItem[]>([]);
    const [autoMode, setAutoMode] = useState<boolean>(true);
    const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(['english', 'hindi', 'kannada']);
    const [showAddTrain, setShowAddTrain] = useState<boolean>(false);
    const [showRecorder, setShowRecorder] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(80);
    const [repeatCount, setRepeatCount] = useState<number>(1);

    // Audio recording states
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordedAudios, setRecordedAudios] = useState<RecordedAudios>({});
    const [currentRecordingKey, setCurrentRecordingKey] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [selectedRecordingType, setSelectedRecordingType] = useState<AnnouncementType>('arrival');
    const [selectedRecordingLang, setSelectedRecordingLang] = useState<Language>('english');
    const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

    // Audio refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(new Audio());
    const speechSynthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // New train form state
    const [newTrain, setNewTrain] = useState<Train>({
        trainNo: '',
        name: '',
        source: '',
        destination: '',
        platform: '',
        eta: '',
        status: 'OnTime',
        type: 'arrival'
    });

    // Recording timer effect
    useEffect(() => {
        if (isRecording) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            setRecordingTime(0);
        }

        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [isRecording]);

    // Start recording
    const startRecording = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                const key = `${selectedRecordingType}_${selectedRecordingLang}`;
                setRecordedAudios(prev => ({
                    ...prev,
                    [key]: {
                        url: audioUrl,
                        blob: audioBlob,
                        type: selectedRecordingType,
                        language: selectedRecordingLang,
                        timestamp: new Date().toISOString()
                    }
                }));

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setCurrentRecordingKey(`${selectedRecordingType}_${selectedRecordingLang}`);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to record announcements');
        }
    };

    // Stop recording
    const stopRecording = (): void => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setCurrentRecordingKey(null);
        }
    };

    // Play recorded audio
    const playRecordedAudio = (key: string): void => {
        const audio = recordedAudios[key];
        if (audio) {
            // Update Now Playing panel
            setCurrentAnnouncement({
                id: Date.now(),
                train: {
                    trainNo: "Manual",
                    name: "Recorded Announcement",
                    source: "",
                    destination: "",
                    platform: "",
                    eta: "",
                    status: "OnTime",
                    type: "arrival"
                },
                type: audio.type,
                announcements: [
                    {
                        language: audio.language,
                        text: "Recorded announcement playing"
                    }
                ],
                currentRepeat: 1,
                repeatCount: repeatCount,
                timestamp: new Date().toLocaleTimeString(),
                status: 'queued'
            });

            setIsPlaying(true);

            audioRef.current.src = audio.url;
            audioRef.current.volume = volume / 100;

            audioRef.current.onended = () => {
                setIsPlaying(false);
                setCurrentAnnouncement(null);
            };

            audioRef.current.play();
        }
    };

    // Delete recorded audio
    const deleteRecordedAudio = (key: string): void => {
        const audio = recordedAudios[key];
        if (audio) {
            URL.revokeObjectURL(audio.url);
            setRecordedAudios(prev => {
                const newAudios = { ...prev };
                delete newAudios[key];
                return newAudios;
            });
        }
    };

    // Download recorded audio
    const downloadRecordedAudio = (key: string): void => {
        const audio = recordedAudios[key];
        if (audio) {
            const a = document.createElement('a');
            a.href = audio.url;
            a.download = `announcement_${key}_${Date.now()}.wav`;
            a.click();
        }
    };

    // Format recording time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const generateAnnouncementText = (
        train: Train,
        type: string,
        languages: Language[],
        additionalData: { [key: string]: any } = {}
    ): AnnouncementText[] | null => {
        const templates = ANNOUNCEMENT_TEMPLATES[type];
        if (!templates) return null;

        const announcements = languages.map(lang => {
            let template = templates[lang] || templates.english;

            // Replace placeholders
            template = template.replace('{trainNo}', train.trainNo);
            template = template.replace('{trainName}', train.name);
            template = template.replace('{source}', train.source);
            template = template.replace('{destination}', train.destination);
            template = template.replace('{platform}', train.platform);
            template = template.replace('{time}', train.eta);
            template = template.replace('{delay}', String(additionalData.delay || train.delay || 0));
            template = template.replace('{oldPlatform}', additionalData.oldPlatform || '');
            template = template.replace('{newPlatform}', additionalData.newPlatform || train.platform);
            template = template.replace('{route}', additionalData.route || '');

            return {
                language: lang,
                text: template
            };
        });

        return announcements;
    };

    const makeAnnouncement = (train: Train, type: string, additionalData: { [key: string]: any } = {}): void => {
        const announcements = generateAnnouncementText(train, type, selectedLanguages, additionalData);

        if (!announcements) return;

        const announcementItem: AnnouncementItem = {
            id: Date.now(),
            train,
            type,
            announcements,
            timestamp: new Date().toLocaleTimeString(),
            status: 'queued',
            repeatCount: repeatCount,
            currentRepeat: 0
        };

        setAnnouncementQueue(prev => [...prev, announcementItem]);

        // Auto-play if not currently playing
        if (!isPlaying && !currentAnnouncement) {
            playNextAnnouncement([...announcementQueue, announcementItem]);
        }
    };

    // Text-to-Speech function
    const speakText = (text: string, language: string): Promise<void> => {
        return new Promise((resolve) => {
            // Stop any ongoing speech
            speechSynthRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Set language
            if (language === 'hindi') {
                utterance.lang = 'hi-IN';
            } else if (language === 'kannada') {
                utterance.lang = 'kn-IN';
            } else {
                utterance.lang = 'en-IN';
            }

            utterance.volume = volume / 100;
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0;

            utterance.onend = () => {
                resolve();
            };

            utterance.onerror = () => {
                resolve();
            };

            speechSynthRef.current.speak(utterance);
        });
    };

    const playNextAnnouncement = async (queue: AnnouncementItem[] = announcementQueue): Promise<void> => {
        if (queue.length === 0) {
            setIsPlaying(false);
            setCurrentAnnouncement(null);
            return;
        }

        const next = queue[0];

        // Check if we need to repeat
        if (next.currentRepeat < next.repeatCount) {
            setCurrentAnnouncement({ ...next, currentRepeat: next.currentRepeat + 1 });
            setIsPlaying(true);

            // Play announcements sequentially
            for (const ann of next.announcements) {
                setCurrentLanguage(ann.language);

                const recordingKey = `${next.type}_${ann.language}`;
                const recordedAudio = recordedAudios[recordingKey];

                if (recordedAudio) {
                    await new Promise<void>((resolve) => {
                        audioRef.current.src = recordedAudio.url;
                        audioRef.current.volume = volume / 100;
                        audioRef.current.onended = () => resolve();
                        audioRef.current.play();
                    });
                } else {
                    await speakText(ann.text, ann.language);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // After playing all languages, check if need to repeat
            setTimeout(() => {
                finishCurrentAnnouncement();
            }, 1000);
        } else {
            // Move to next announcement
            const remaining = queue.slice(1);
            setAnnouncementQueue(remaining);
            if (remaining.length > 0) {
                playNextAnnouncement(remaining);
            } else {
                setIsPlaying(false);
                setCurrentAnnouncement(null);
            }
        }
    };

    const finishCurrentAnnouncement = (): void => {
        if (!currentAnnouncement) return;

        // Add to history
        setAnnouncementHistory(prev => [{
            ...currentAnnouncement,
            status: 'completed',
            completedAt: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 50));

        // Check if we need to repeat
        if (currentAnnouncement.currentRepeat < currentAnnouncement.repeatCount) {
            playNextAnnouncement(announcementQueue);
        } else {
            // Move to next
            const remaining = announcementQueue.slice(1);
            setAnnouncementQueue(remaining);

            if (remaining.length > 0) {
                playNextAnnouncement(remaining);
            } else {
                setIsPlaying(false);
                setCurrentAnnouncement(null);
            }
        }
    };

    const stopAnnouncement = (): void => {
        setIsPlaying(false);
        speechSynthRef.current.cancel();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        if (currentAnnouncement) {
            setAnnouncementHistory(prev => [{
                ...currentAnnouncement,
                status: 'stopped',
                completedAt: new Date().toLocaleTimeString()
            }, ...prev].slice(0, 50));
        }
        setCurrentAnnouncement(null);
    };

    const skipAnnouncement = (): void => {
        speechSynthRef.current.cancel();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        finishCurrentAnnouncement();
    };

    const clearQueue = (): void => {
        setAnnouncementQueue([]);
        stopAnnouncement();
    };

    const addNewTrain = (): void => {
        if (!newTrain.trainNo || !newTrain.name) {
            alert('Please enter at least Train Number and Name');
            return;
        }

        const train: Train = {
            ...newTrain,
            trainNo: newTrain.trainNo,
            delay: 0
        };

        setTrains(prev => [...prev, train]);

        // Auto announce if in auto mode
        if (autoMode) {
            makeAnnouncement(train, newTrain.type === 'arrival' ? 'arrival' : 'departure');
        }

        setNewTrain({
            trainNo: '',
            name: '',
            source: '',
            destination: '',
            platform: '',
            eta: '',
            status: 'OnTime',
            type: 'arrival'
        });
        setShowAddTrain(false);
    };

    const deleteTrain = (trainNo: string): void => {
        setTrains(prev => prev.filter(t => t.trainNo !== trainNo));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Radio className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Announcement System</h1>
                                <p className="text-blue-100 text-sm">Central Display Center (CDC)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Train List & Controls */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm">Active Trains</p>
                                        <p className="text-2xl font-bold text-slate-800">{trains.length}</p>
                                    </div>
                                    <Train className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm">In Queue</p>
                                        <p className="text-2xl font-bold text-slate-800">{announcementQueue.length}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-orange-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm">Recordings</p>
                                        <p className="text-2xl font-bold text-slate-800">{Object.keys(recordedAudios).length}</p>
                                    </div>
                                    <Mic className="w-8 h-8 text-red-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm">Mode</p>
                                        <p className="text-lg font-bold text-slate-800">{autoMode ? 'Auto' : 'Manual'}</p>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${autoMode ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Buttons Row */}
                        <div className="flex gap-4">
                            {/* Voice Recorder */}
                            <button
                                onClick={() => setShowRecorder(!showRecorder)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center space-x-2"
                            >
                                <Mic className="w-5 h-5" />
                                <span>Voice Recorder</span>
                            </button>

                            {/* Add Train */}
                            <button
                                onClick={() => setShowAddTrain(!showAddTrain)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add New Train</span>
                            </button>
                        </div>

                        {/* Voice Recorder Modal */}
                        {showRecorder && (
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                                {/* Header */}
                                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Mic className="w-6 h-6 text-red-500" />
                                        <h2 className="text-2xl font-bold text-slate-800">
                                            Voice Recorder Studio
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setShowRecorder(false)}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Recording Controls */}
                                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                            Record New Announcement
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Announcement Type
                                                </label>
                                                <select
                                                    value={selectedRecordingType}
                                                    onChange={(e) => setSelectedRecordingType(e.target.value as AnnouncementType)}
                                                    disabled={isRecording}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                                                >
                                                    <option value="arrival">Arrival</option>
                                                    <option value="arrived">Arrived</option>
                                                    <option value="departure">Departure</option>
                                                    <option value="platformChange">Platform Change</option>
                                                    <option value="late">Late/Delay</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="diverted">Diverted</option>
                                                    <option value="other">Other Special Announcement</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Language
                                                </label>
                                                <select
                                                    value={selectedRecordingLang}
                                                    onChange={(e) => setSelectedRecordingLang(e.target.value as Language)}
                                                    disabled={isRecording}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                                                >
                                                    <option value="english">English</option>
                                                    <option value="hindi">Hindi</option>
                                                    <option value="kannada">Kannada</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Recording Status */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {isRecording ? (
                                                    <>
                                                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span className="text-lg font-mono font-bold text-red-600">
                                                            REC {formatTime(recordingTime)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-500">Ready to record</span>
                                                )}
                                            </div>

                                            <div className="flex space-x-2">
                                                {!isRecording ? (
                                                    <button
                                                        onClick={startRecording}
                                                        className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                                                    >
                                                        <Mic className="w-5 h-5" />
                                                        <span>Start Recording</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={stopRecording}
                                                        className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                                                    >
                                                        <StopCircle className="w-5 h-5" />
                                                        <span>Stop Recording</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Template Preview */}
                                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                                            <p className="text-xs font-medium text-slate-500 mb-1">
                                                Template Preview:
                                            </p>
                                            <p className="text-sm text-slate-700">
                                                {ANNOUNCEMENT_TEMPLATES[selectedRecordingType]?.[
                                                    selectedRecordingLang
                                                ] || "Select type and language"}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-2">
                                                And other special announcements will be displayed here.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Recorded Announcements */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                            Recorded Announcements ({Object.keys(recordedAudios).length})
                                        </h3>

                                        {Object.keys(recordedAudios).length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 rounded-lg">
                                                <Headphones className="w-16 h-16 mx-auto text-slate-300 mb-3" />
                                                <p className="text-blue-800">
                                                    No recordings yet. Start recording to create announcements.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {Object.entries(recordedAudios).map(([key, audio]) => (
                                                    <div
                                                        key={key}
                                                        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                                                                        {audio.type}
                                                                    </span>
                                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                                                                        {audio.language}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500">
                                                                    Recorded: {new Date(audio.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => playRecordedAudio(key)}
                                                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                                                    title="Play"
                                                                >
                                                                    <PlayCircle className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => downloadRecordedAudio(key)}
                                                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteRecordedAudio(key)}
                                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Instructions */}
                                    <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">
                                            Recording Tips:
                                        </h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Speak clearly and at a moderate pace</li>
                                            <li>• Record in a quiet environment for best quality</li>
                                            <li>• Use the template as a guide for your announcement</li>
                                            <li>• Recorded announcements will be used instead of text-to-speech</li>
                                            <li>• You can record the same type in multiple languages</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Train Form */}
                        {showAddTrain && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">Add New Train</h3>
                                    <button onClick={() => setShowAddTrain(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Train Number *</label>
                                        <input
                                            type="text"
                                            value={newTrain.trainNo}
                                            onChange={(e) => setNewTrain({ ...newTrain, trainNo: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="12345"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Train Name *</label>
                                        <input
                                            type="text"
                                            value={newTrain.name}
                                            onChange={(e) => setNewTrain({ ...newTrain, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Express Train"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                                        <input
                                            type="text"
                                            value={newTrain.source}
                                            onChange={(e) => setNewTrain({ ...newTrain, source: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Station Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                                        <input
                                            type="text"
                                            value={newTrain.destination}
                                            onChange={(e) => setNewTrain({ ...newTrain, destination: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Destination"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                                        <input
                                            type="text"
                                            value={newTrain.platform}
                                            onChange={(e) => setNewTrain({ ...newTrain, platform: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ETA/ETD</label>
                                        <input
                                            type="time"
                                            value={newTrain.eta}
                                            onChange={(e) => setNewTrain({ ...newTrain, eta: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                        <select
                                            value={newTrain.type}
                                            onChange={(e) => setNewTrain({ ...newTrain, type: e.target.value as 'arrival' | 'departure' })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="arrival">Arrival</option>
                                            <option value="departure">Departure</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                        <select
                                            value={newTrain.status}
                                            onChange={(e) => setNewTrain({ ...newTrain, status: e.target.value as Train['status'] })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="OnTime">On Time</option>
                                            <option value="Late">Late</option>
                                            <option value="Arrived">Arrived</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowAddTrain(false)}
                                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addNewTrain}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Add Train</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Train List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800">Active Trains</h3>
                            </div>

                            <div className="divide-y divide-slate-200">
                                {trains.map((train) => (
                                    <div key={train.trainNo} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="font-bold text-lg text-slate-800">{train.trainNo}</span>
                                                    <span className="text-slate-600">{train.name}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${train.status === 'OnTime' ? 'bg-green-100 text-green-700' :
                                                        train.status === 'Late' ? 'bg-orange-100 text-orange-700' :
                                                            train.status === 'Arrived' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {train.status}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-slate-600">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{train.source} → {train.destination}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Train className="w-4 h-4" />
                                                        <span>Platform {train.platform}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{train.eta}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => makeAnnouncement(train, 'arrival')}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Announce Arrival"
                                                >
                                                    <Volume2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => makeAnnouncement(train, 'departure')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Announce Departure"
                                                >
                                                    <Play className="w-5 h-5" />
                                                </button>
                                                {train.status === 'Late' && (
                                                    <button
                                                        onClick={() => makeAnnouncement(train, 'late')}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Announce Delay"
                                                    >
                                                        <AlertTriangle className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteTrain(train.trainNo)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Train"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Announcement Control */}
                    <div className="space-y-6">
                        {/* Current Announcement */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Now Playing</h3>
                                {isPlaying && (
                                    <div className="flex items-center space-x-2 text-red-500">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-medium">LIVE</span>
                                    </div>
                                )}
                            </div>

                            {currentAnnouncement ? (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Train className="w-5 h-5 text-blue-600" />
                                            <span className="font-bold text-blue-900">
                                                {currentAnnouncement.train.trainNo} - {currentAnnouncement.train.name}
                                            </span>
                                        </div>
                                        <p className="text-sm text-blue-700 capitalize">
                                            Type: {currentAnnouncement.type}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Repeat: {currentAnnouncement.currentRepeat} / {currentAnnouncement.repeatCount}
                                        </p>
                                        {currentLanguage && (
                                            <p className="text-xs text-green-600 mt-1 font-medium">
                                                Playing: {currentLanguage}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {currentAnnouncement.announcements.map((ann, idx) => {
                                            const recordingKey = `${currentAnnouncement.type}_${ann.language}`;
                                            const hasRecording = recordedAudios[recordingKey];

                                            return (
                                                <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-xs font-medium text-slate-500 uppercase">
                                                            {ann.language}
                                                        </p>
                                                        {hasRecording && (
                                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                                                                Recorded
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-700">{ann.text}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${isPlaying
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                                }`}
                                        >
                                            {isPlaying ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Pause className="w-4 h-4" />
                                                    <span>Pause</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Play className="w-4 h-4" />
                                                    <span>Play</span>
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            onClick={stopAnnouncement}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={skipAnnouncement}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
                                        >
                                            <SkipForward className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <Volume2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No announcement playing</p>
                                </div>
                            )}
                        </div>

                        {/* Volume Control */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-800">Volume</h3>
                                <span className="text-sm font-medium text-slate-600">{volume}%</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <VolumeX className="w-5 h-5 text-slate-400" />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <Volume2 className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>

                        {/* Repeat Control */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-800">Repeat Count</h3>
                                <span className="text-sm font-medium text-slate-600">{repeatCount}x</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={repeatCount}
                                onChange={(e) => setRepeatCount(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-500 rounded-lg focus:ring-2 focus:border-transparent"
                            />
                        </div>

                        {/* Language Selection */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Languages</h3>
                            <div className="space-y-2">
                                {(['english', 'hindi', 'kannada'] as Language[]).map(lang => (
                                    <label key={lang} className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedLanguages.includes(lang)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLanguages([...selectedLanguages, lang]);
                                                } else {
                                                    setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700 capitalize">{lang}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Queue */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    Queue ({announcementQueue.length})
                                </h3>
                                {announcementQueue.length > 0 && (
                                    <button
                                        onClick={clearQueue}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {announcementQueue.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">No announcements in queue</p>
                                ) : (
                                    announcementQueue.map((item, idx) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {item.train.trainNo} - {item.train.name}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">#{idx + 1}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* History */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-800 mb-4">
                                Recent History ({announcementHistory.length})
                            </h3>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {announcementHistory.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">No history yet</p>
                                ) : (
                                    announcementHistory.slice(0, 10).map((item, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {item.train.trainNo}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {item.completedAt} • {item.type}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementSystem;