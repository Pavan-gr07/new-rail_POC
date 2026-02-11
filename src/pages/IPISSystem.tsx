import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Train, AlertCircle, Settings, Database, Monitor, Eye, EyeOff } from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

type Language = 'english' | 'hindi' | 'regional';

type DisplayEffect = 'scroll' | 'typing' | 'flash' | 'curtain' | 'none';

type TrainStatus =
  | 'running_right_time'
  | 'will_arrive_shortly'
  | 'is_arriving'
  | 'has_arrived'
  | 'running_late'
  | 'cancelled'
  | 'indefinite_late'
  | 'terminated_at'
  | 'platform_changed'
  | 'is_ready_to_leave'
  | 'is_on_platform'
  | 'departed'
  | 'rescheduled'
  | 'diverted'
  | 'delay_departure'
  | 'change_of_source';

type ArrivalDeparture = 'A' | 'D';

interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  expectedTime: string;
  actualTime?: string;
  platform: string;
  status: TrainStatus;
  arrivalDeparture: ArrivalDeparture;
  late?: number; // minutes late
  rescheduledTime?: string;
  terminatedAt?: string;
  divertedRoute?: string;
  changeOfSource?: string;
  isMerged?: boolean;
  mergedWithTrainNumber?: string;
}

interface DisplayBoard {
  id: string;
  name: string;
  type: 'PFD' | 'CGD'; // Platform Display or Central Guidance Display
  platformNumber?: string;
  isOnline: boolean;
  lastUpdate: Date;
}

interface SystemConfig {
  language: Language;
  displayEffect: DisplayEffect;
  scrollSpeed: number; // 1-10
  alternateDisplayDuration: number; // seconds
  passwordProtection: boolean;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  trainId: string;
  details: string;
}

// ==================== STATE MANAGEMENT ====================

type AppState = {
  trains: Train[];
  displayBoards: DisplayBoard[];
  config: SystemConfig;
  auditLogs: AuditLog[];
  selectedBoard: string | null;
  isAuthenticated: boolean;
  currentPassword: string;
};

type AppAction =
  | { type: 'ADD_TRAIN'; payload: Train }
  | { type: 'UPDATE_TRAIN'; payload: { id: string; updates: Partial<Train> } }
  | { type: 'DELETE_TRAIN'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: Partial<SystemConfig> }
  | { type: 'UPDATE_BOARD_STATUS'; payload: { id: string; isOnline: boolean } }
  | { type: 'SELECT_BOARD'; payload: string | null }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'CHANGE_PASSWORD'; payload: string }
  | { type: 'TRANSFER_TO_BOARD'; payload: { boardId: string; trainId: string } };

const initialState: AppState = {
  trains: [
    {
      id: '1',
      trainNumber: '12301',
      trainName: 'Rajdhani Express',
      expectedTime: '05:30',
      platform: '1',
      status: 'running_right_time',
      arrivalDeparture: 'A',
    },
    {
      id: '2',
      trainNumber: '12302',
      trainName: 'Shatabdi Express',
      expectedTime: '14:15',
      platform: '3',
      status: 'running_late',
      arrivalDeparture: 'A',
      late: 45,
    },
  ],
  displayBoards: [
    { id: 'PFD-1', name: 'Platform 1 Display', type: 'PFD', platformNumber: '1', isOnline: true, lastUpdate: new Date() },
    { id: 'PFD-2', name: 'Platform 2 Display', type: 'PFD', platformNumber: '2', isOnline: true, lastUpdate: new Date() },
    { id: 'CGD-1', name: 'Central Guidance Display', type: 'CGD', isOnline: true, lastUpdate: new Date() },
  ],
  config: {
    language: 'english',
    displayEffect: 'scroll',
    scrollSpeed: 5,
    alternateDisplayDuration: 3,
    passwordProtection: true,
  },
  auditLogs: [],
  selectedBoard: null,
  isAuthenticated: false,
  currentPassword: 'admin123',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TRAIN':
      return { ...state, trains: [...state.trains, action.payload] };

    case 'UPDATE_TRAIN': {
      const trains = state.trains.map(train =>
        train.id === action.payload.id ? { ...train, ...action.payload.updates } : train
      );
      return { ...state, trains };
    }

    case 'DELETE_TRAIN':
      return { ...state, trains: state.trains.filter(t => t.id !== action.payload) };

    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };

    case 'UPDATE_BOARD_STATUS': {
      const displayBoards = state.displayBoards.map(board =>
        board.id === action.payload.id
          ? { ...board, isOnline: action.payload.isOnline, lastUpdate: new Date() }
          : board
      );
      return { ...state, displayBoards };
    }

    case 'SELECT_BOARD':
      return { ...state, selectedBoard: action.payload };

    case 'ADD_AUDIT_LOG':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs] };

    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };

    case 'CHANGE_PASSWORD':
      return { ...state, currentPassword: action.payload };

    case 'TRANSFER_TO_BOARD': {
      const board = state.displayBoards.find(b => b.id === action.payload.boardId);
      if (board) {
        const updatedBoards = state.displayBoards.map(b =>
          b.id === action.payload.boardId ? { ...b, lastUpdate: new Date() } : b
        );
        return { ...state, displayBoards: updatedBoards };
      }
      return state;
    }

    default:
      return state;
  }
}

// ==================== UTILITY FUNCTIONS ====================

const getStatusText = (train: Train, language: Language): string => {
  const statusMap: Record<TrainStatus, { en: string; hi: string }> = {
    running_right_time: { en: 'Running Right Time', hi: 'समय पर चल रही है' },
    will_arrive_shortly: { en: 'Will Arrive Shortly', hi: 'जल्द आएगी' },
    is_arriving: { en: 'Is Arriving On', hi: 'आ रही है' },
    has_arrived: { en: 'Has Arrived On', hi: 'आ चुकी है' },
    running_late: { en: `Late by ${train.late || 0} min`, hi: `${train.late || 0} मिनट देरी से` },
    cancelled: { en: 'Cancelled', hi: 'रद्द की गई है' },
    indefinite_late: { en: 'Indefinite Late', hi: 'अनिश्चित देरी से' },
    terminated_at: { en: `Terminated At ${train.terminatedAt || ''}`, hi: `${train.terminatedAt || ''} तक जायेगी` },
    platform_changed: { en: 'Platform Changed', hi: 'प्लेटफॉर्म बदला गया' },
    is_ready_to_leave: { en: 'Is Ready to Leave', hi: 'प्रस्थान के लिए तैयार' },
    is_on_platform: { en: 'Is on Platform', hi: 'प्लेटफॉर्म पर है' },
    departed: { en: 'Departed', hi: 'प्रस्थान कर गई' },
    rescheduled: { en: 'Rescheduled', hi: 'परिवर्तित समय' },
    diverted: { en: `Diverted via ${train.divertedRoute || ''}`, hi: `परिवर्तित मार्ग ${train.divertedRoute || ''}` },
    delay_departure: { en: 'Delay Departure', hi: 'विलंबित प्रस्थान' },
    change_of_source: { en: `Start at ${train.changeOfSource || ''}`, hi: `${train.changeOfSource || ''} से जाएगी` },
  };

  const lang = language === 'english' ? 'en' : 'hi';
  return statusMap[train.status][lang];
};

// ==================== COMPONENTS ====================

const LoginModal: React.FC<{
  onLogin: (password: string) => void;
  currentPassword: string;
}> = ({ onLogin, currentPassword }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === currentPassword) {
      onLogin(password);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Master Database Access</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">Default: admin123</p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const ConfigPanel: React.FC<{
  config: SystemConfig;
  onUpdate: (updates: Partial<SystemConfig>) => void;
}> = ({ config, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Settings className="text-blue-600" />
        System Configuration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Language
          </label>
          <select
            value={config.language}
            onChange={(e) => onUpdate({ language: e.target.value as Language })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="regional">Regional</option>
          </select>
        </div>

        {/* Display Effect */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Effect
          </label>
          <select
            value={config.displayEffect}
            onChange={(e) => onUpdate({ displayEffect: e.target.value as DisplayEffect })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="scroll">Scrolling</option>
            <option value="typing">Typing</option>
            <option value="flash">Flashing</option>
            <option value="curtain">Curtain</option>
          </select>
        </div>

        {/* Scroll Speed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scroll Speed: {config.scrollSpeed}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.scrollSpeed}
            onChange={(e) => onUpdate({ scrollSpeed: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Alternate Display Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternate Display Duration: {config.alternateDisplayDuration}s
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.alternateDisplayDuration}
            onChange={(e) => onUpdate({ alternateDisplayDuration: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

const TrainForm: React.FC<{
  onSubmit: (train: Omit<Train, 'id'>) => void;
  editingTrain?: Train;
  onCancel?: () => void;
}> = ({ onSubmit, editingTrain, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Train, 'id'>>(
    editingTrain || {
      trainNumber: '',
      trainName: '',
      expectedTime: '',
      platform: '',
      status: 'running_right_time',
      arrivalDeparture: 'A',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Train className="text-blue-600" />
        {editingTrain ? 'Edit Train' : 'Add New Train'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Train Number *
          </label>
          <input
            type="text"
            required
            value={formData.trainNumber}
            onChange={(e) => updateField('trainNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="12301"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Train Name *
          </label>
          <input
            type="text"
            required
            value={formData.trainName}
            onChange={(e) => updateField('trainName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Rajdhani Express"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Time *
          </label>
          <input
            type="time"
            required
            value={formData.expectedTime}
            onChange={(e) => updateField('expectedTime', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform *
          </label>
          <input
            type="text"
            required
            value={formData.platform}
            onChange={(e) => updateField('platform', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="running_right_time">Running Right Time</option>
            <option value="will_arrive_shortly">Will Arrive Shortly</option>
            <option value="is_arriving">Is Arriving</option>
            <option value="has_arrived">Has Arrived</option>
            <option value="running_late">Running Late</option>
            <option value="cancelled">Cancelled</option>
            <option value="indefinite_late">Indefinite Late</option>
            <option value="terminated_at">Terminated At</option>
            <option value="platform_changed">Platform Changed</option>
            <option value="is_ready_to_leave">Ready to Leave</option>
            <option value="is_on_platform">On Platform</option>
            <option value="departed">Departed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="diverted">Diverted</option>
            <option value="change_of_source">Change of Source</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arrival/Departure *
          </label>
          <select
            value={formData.arrivalDeparture}
            onChange={(e) => updateField('arrivalDeparture', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="A">Arrival</option>
            <option value="D">Departure</option>
          </select>
        </div>

        {formData.status === 'running_late' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Late By (minutes)
            </label>
            <input
              type="number"
              value={formData.late || 0}
              onChange={(e) => updateField('late', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {formData.status === 'rescheduled' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rescheduled Time
            </label>
            <input
              type="time"
              value={formData.rescheduledTime || ''}
              onChange={(e) => updateField('rescheduledTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {formData.status === 'terminated_at' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminated At Station
            </label>
            <input
              type="text"
              value={formData.terminatedAt || ''}
              onChange={(e) => updateField('terminatedAt', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Station name"
            />
          </div>
        )}

        {formData.status === 'diverted' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diverted Route
            </label>
            <input
              type="text"
              value={formData.divertedRoute || ''}
              onChange={(e) => updateField('divertedRoute', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Route details"
            />
          </div>
        )}

        {formData.status === 'change_of_source' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Source Station
            </label>
            <input
              type="text"
              value={formData.changeOfSource || ''}
              onChange={(e) => updateField('changeOfSource', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Station name"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.isMerged || false}
              onChange={(e) => updateField('isMerged', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            Merged Train
          </label>
        </div>

        {formData.isMerged && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merged With Train Number
            </label>
            <input
              type="text"
              value={formData.mergedWithTrainNumber || ''}
              onChange={(e) => updateField('mergedWithTrainNumber', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="12302"
            />
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {editingTrain ? 'Update Train' : 'Add Train'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const DisplayBoardMonitor: React.FC<{
  boards: DisplayBoard[];
  onBoardClick: (boardId: string) => void;
  selectedBoard: string | null;
}> = ({ boards, onBoardClick, selectedBoard }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Monitor className="text-blue-600" />
        Display Board Health Status
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => onBoardClick(board.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedBoard === board.id
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">{board.name}</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${board.isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}
              >
                {board.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-sm text-gray-600">Type: {board.type}</p>
            {board.platformNumber && (
              <p className="text-sm text-gray-600">Platform: {board.platformNumber}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Last Update: {board.lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrainList: React.FC<{
  trains: Train[];
  config: SystemConfig;
  onEdit: (train: Train) => void;
  onDelete: (id: string) => void;
  onTransfer: (trainId: string, boardId: string) => void;
  displayBoards: DisplayBoard[];
}> = ({ trains, config, onEdit, onDelete, onTransfer, displayBoards }) => {
  const [alternateIndex, setAlternateIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setAlternateIndex(prev => {
        const newIndex = { ...prev };
        trains.forEach(train => {
          if (['rescheduled', 'terminated_at', 'diverted', 'change_of_source'].includes(train.status)) {
            newIndex[train.id] = ((prev[train.id] || 0) + 1) % 2;
          }
        });
        return newIndex;
      });
    }, config.alternateDisplayDuration * 1000);

    return () => clearInterval(interval);
  }, [trains, config.alternateDisplayDuration]);

  const getDisplayEffectClass = (effect: DisplayEffect) => {
    switch (effect) {
      case 'scroll':
        return 'animate-marquee';
      case 'flash':
        return 'animate-pulse';
      case 'typing':
        return 'animate-typing';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Database className="text-blue-600" />
        Train Database ({trains.length} trains)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Train No.</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Platform</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">A/D</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trains.map((train) => (
              <tr key={train.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">
                    {train.trainNumber}
                    {train.isMerged && train.mergedWithTrainNumber && (
                      <div className="text-xs text-orange-600 mt-1">
                        ↔ {train.mergedWithTrainNumber}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className={getDisplayEffectClass(config.displayEffect)}>
                    {train.trainName}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-mono text-sm">
                    {train.expectedTime}
                    {train.rescheduledTime && alternateIndex[train.id] === 1 && (
                      <div className="text-orange-600">→ {train.rescheduledTime}</div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-gray-100 rounded font-medium">
                    {train.platform}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded font-medium ${train.arrivalDeparture === 'A'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}
                  >
                    {train.arrivalDeparture}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    {getStatusText(train, config.language)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(train)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(train.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onTransfer(train.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Transfer to...</option>
                      {displayBoards
                        .filter(b => b.isOnline)
                        .map(board => (
                          <option key={board.id} value={board.id}>
                            {board.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AuditLogViewer: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <AlertCircle className="text-blue-600" />
        Audit Logs (Last 10)
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.slice(0, 10).map((log) => (
          <div
            key={log.id}
            className="p-3 bg-gray-50 rounded border-l-4 border-blue-600 text-sm"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-gray-800">{log.action}</span>
              <span className="text-gray-500 text-xs">
                {log.timestamp.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600">{log.details}</p>
            <p className="text-gray-500 text-xs mt-1">User: {log.user}</p>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-gray-500 text-center py-4">No audit logs yet</p>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const IPISSystem: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const addAuditLog = useCallback((action: string, trainId: string, details: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      user: 'admin',
      trainId,
      details,
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: log });
  }, []);

  const handleAddTrain = useCallback((trainData: Omit<Train, 'id'>) => {
    const newTrain: Train = {
      ...trainData,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_TRAIN', payload: newTrain });
    addAuditLog('ADD_TRAIN', newTrain.id, `Added train ${newTrain.trainNumber} - ${newTrain.trainName}`);
    setShowAddForm(false);
  }, [addAuditLog]);

  const handleUpdateTrain = useCallback((trainData: Omit<Train, 'id'>) => {
    if (editingTrain) {
      dispatch({
        type: 'UPDATE_TRAIN',
        payload: { id: editingTrain.id, updates: trainData },
      });
      addAuditLog(
        'UPDATE_TRAIN',
        editingTrain.id,
        `Updated train ${trainData.trainNumber} - Status: ${trainData.status}`
      );
      setEditingTrain(null);
    }
  }, [editingTrain, addAuditLog]);

  const handleDeleteTrain = useCallback((id: string) => {
    const train = state.trains.find(t => t.id === id);
    if (train && window.confirm(`Delete train ${train.trainNumber}?`)) {
      dispatch({ type: 'DELETE_TRAIN', payload: id });
      addAuditLog('DELETE_TRAIN', id, `Deleted train ${train.trainNumber} - ${train.trainName}`);
    }
  }, [state.trains, addAuditLog]);

  const handleTransferToBoard = useCallback((trainId: string, boardId: string) => {
    const train = state.trains.find(t => t.id === trainId);
    const board = state.displayBoards.find(b => b.id === boardId);

    if (train && board) {
      dispatch({ type: 'TRANSFER_TO_BOARD', payload: { boardId, trainId } });
      addAuditLog(
        'TRANSFER_TO_BOARD',
        trainId,
        `Transferred train ${train.trainNumber} to ${board.name}`
      );
    }
  }, [state.trains, state.displayBoards, addAuditLog]);

  const handleLogin = useCallback((password: string) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    setEditingTrain(null);
    setShowAddForm(false);
  }, []);

  const handlePasswordChange = useCallback(() => {
    if (newPassword.length >= 6) {
      dispatch({ type: 'CHANGE_PASSWORD', payload: newPassword });
      addAuditLog('CHANGE_PASSWORD', 'system', 'Password changed successfully');
      setShowPasswordChange(false);
      setNewPassword('');
      alert('Password changed successfully!');
    } else {
      alert('Password must be at least 6 characters');
    }
  }, [newPassword, addAuditLog]);

  if (!state.isAuthenticated && state.config.passwordProtection) {
    return <LoginModal onLogin={handleLogin} currentPassword={state.currentPassword} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Train size={36} />
              IP-Based Integrated Passenger Information System
            </h1>
            <p className="text-blue-100 mt-1">Central Data Controller (CDC)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-blue-100">Current Time</div>
              <div className="text-xl font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter new password (min 6 characters)"
            />
            <div className="flex gap-4">
              <button
                onClick={handlePasswordChange}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setNewPassword('');
                }}
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Configuration Panel */}
        <ConfigPanel
          config={state.config}
          onUpdate={(updates) => dispatch({ type: 'UPDATE_CONFIG', payload: updates })}
        />

        {/* Display Board Monitor */}
        <DisplayBoardMonitor
          boards={state.displayBoards}
          onBoardClick={(boardId) => dispatch({ type: 'SELECT_BOARD', payload: boardId })}
          selectedBoard={state.selectedBoard}
        />

        {/* Add Train Button */}
        {!showAddForm && !editingTrain && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Train size={20} />
            Add New Train
          </button>
        )}

        {/* Train Form */}
        {(showAddForm || editingTrain) && (
          <TrainForm
            onSubmit={editingTrain ? handleUpdateTrain : handleAddTrain}
            editingTrain={editingTrain || undefined}
            onCancel={() => {
              setShowAddForm(false);
              setEditingTrain(null);
            }}
          />
        )}

        {/* Train List */}
        <TrainList
          trains={state.trains}
          config={state.config}
          onEdit={setEditingTrain}
          onDelete={handleDeleteTrain}
          onTransfer={handleTransferToBoard}
          displayBoards={state.displayBoards}
        />

        {/* Audit Logs */}
        <AuditLogViewer logs={state.auditLogs} />
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          display: inline-block;
          animation: marquee 10s linear infinite;
        }
        
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        
        .animate-typing {
          overflow: hidden;
          white-space: nowrap;
          animation: typing 2s steps(40, end);
        }
      `}</style>
    </div>
  );
};

export default IPISSystem;
