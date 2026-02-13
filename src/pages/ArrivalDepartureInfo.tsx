import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Clock, Train, AlertCircle, Settings, Database, Monitor, Eye, EyeOff } from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

type Language = 'english' | 'hindi' | 'kannada' | 'tamil' | 'telugu' | 'marathi' | 'bengali' | 'gujarati';

type DisplayEffect = 'scroll' | 'typing' | 'flash' | 'curtain' | 'none';

type StateRegion =
  | 'karnataka'
  | 'tamil_nadu'
  | 'telangana'
  | 'maharashtra'
  | 'west_bengal'
  | 'gujarat'
  | 'default';


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
  stateRegion: StateRegion;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  trainId: string;
  details: string;
}

// Translation system
interface Translations {
  [key: string]: {
    english: string;
    hindi: string;
    kannada: string;
    tamil: string;
    telugu: string;
    marathi: string;
    bengali: string;
    gujarati: string;
  };
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
    stateRegion: 'karnataka', // Default to Karnataka
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

// Comprehensive translation system
const translations: Translations = {
  // UI Labels
  'train_number': {
    english: 'Train No.',
    hindi: 'ट्रेन नं.',
    kannada: 'ರೈಲು ಸಂ.',
    tamil: 'ரயில் எண்.',
    telugu: 'రైలు సం.',
    marathi: 'रेल्वे क्र.',
    bengali: 'ট্রেন নং',
    gujarati: 'ટ્રેન નં.',
  },
  'train_name': {
    english: 'Name',
    hindi: 'नाम',
    kannada: 'ಹೆಸರು',
    tamil: 'பெயர்',
    telugu: 'పేరు',
    marathi: 'नाव',
    bengali: 'নাম',
    gujarati: 'નામ',
  },
  'time': {
    english: 'Time',
    hindi: 'समय',
    kannada: 'ಸಮಯ',
    tamil: 'நேரம்',
    telugu: 'సమయం',
    marathi: 'वेळ',
    bengali: 'সময়',
    gujarati: 'સમય',
  },
  'platform': {
    english: 'Platform',
    hindi: 'प्लेटफॉर्म',
    kannada: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    tamil: 'மேடை',
    telugu: 'ప్లాట్‌ఫారమ్',
    marathi: 'प्लॅटफॉर्म',
    bengali: 'প্ল্যাটফর্ম',
    gujarati: 'પ્લેટફોર્મ',
  },
  'status': {
    english: 'Status',
    hindi: 'स्थिति',
    kannada: 'ಸ್ಥಿತಿ',
    tamil: 'நிலை',
    telugu: 'స్థితి',
    marathi: 'स्थिती',
    bengali: 'অবস্থা',
    gujarati: 'સ્થિતિ',
  },
  'actions': {
    english: 'Actions',
    hindi: 'कार्रवाई',
    kannada: 'ಕ್ರಿಯೆಗಳು',
    tamil: 'செயல்கள்',
    telugu: 'చర్యలు',
    marathi: 'कृती',
    bengali: 'কর্ম',
    gujarati: 'ક્રિયાઓ',
  },
  'add_train': {
    english: 'Add New Train',
    hindi: 'नई ट्रेन जोड़ें',
    kannada: 'ಹೊಸ ರೈಲು ಸೇರಿಸಿ',
    tamil: 'புதிய ரயிலைச் சேர்க்கவும்',
    telugu: 'కొత్త రైలు జోడించండి',
    marathi: 'नवीन रेल्वे जोडा',
    bengali: 'নতুন ট্রেন যোগ করুন',
    gujarati: 'નવી ટ્રેન ઉમેરો',
  },
  'edit': {
    english: 'Edit',
    hindi: 'संपादित करें',
    kannada: 'ಸಂಪಾದಿಸಿ',
    tamil: 'திருத்து',
    telugu: 'సవరించు',
    marathi: 'संपादित करा',
    bengali: 'সম্পাদনা',
    gujarati: 'સંપાદિત કરો',
  },
  'delete': {
    english: 'Delete',
    hindi: 'हटाएं',
    kannada: 'ಅಳಿಸಿ',
    tamil: 'நீக்கு',
    telugu: 'తొలగించు',
    marathi: 'हटवा',
    bengali: 'মুছুন',
    gujarati: 'કાઢી નાખો',
  },
  'arrival': {
    english: 'Arrival',
    hindi: 'आगमन',
    kannada: 'ಆಗಮನ',
    tamil: 'வருகை',
    telugu: 'రాక',
    marathi: 'आगमन',
    bengali: 'আগমন',
    gujarati: 'આગમન',
  },
  'departure': {
    english: 'Departure',
    hindi: 'प्रस्थान',
    kannada: 'ನಿರ್ಗಮನ',
    tamil: 'புறப்பாடு',
    telugu: 'బయలుదేరుట',
    marathi: 'प्रस्थान',
    bengali: 'প্রস্থান',
    gujarati: 'પ્રસ્થાન',
  },
  'online': {
    english: 'Online',
    hindi: 'ऑनलाइन',
    kannada: 'ಆನ್‌ಲೈನ್',
    tamil: 'இணைய',
    telugu: 'ఆన్‌లైన్',
    marathi: 'ऑनलाइन',
    bengali: 'অনলাইন',
    gujarati: 'ઓનલાઇન',
  },
  'offline': {
    english: 'Offline',
    hindi: 'ऑफलाइन',
    kannada: 'ಆಫ್‌ಲೈನ್',
    tamil: 'இணைப்பு துண்டிப்பு',
    telugu: 'ఆఫ్‌లైన్',
    marathi: 'ऑफलाइन',
    bengali: 'অফলাইন',
    gujarati: 'ઓફલાઇન',
  },
};

// Get translation based on key and language
const t = (key: string, lang: Language): string => {
  return translations[key]?.[lang] || translations[key]?.['english'] || key;
};

// Get regional language based on state
const getRegionalLanguage = (stateRegion: StateRegion): Language => {
  const stateLanguageMap: Record<StateRegion, Language> = {
    karnataka: 'kannada',
    tamil_nadu: 'tamil',
    telangana: 'telugu',
    maharashtra: 'marathi',
    west_bengal: 'bengali',
    gujarat: 'gujarati',
    default: 'hindi',
  };
  return stateLanguageMap[stateRegion] || 'hindi';
};

const getStatusText = (train: Train, language: Language): string => {
  const statusMap: Record<TrainStatus, { english: string; hindi: string; kannada: string; tamil: string; telugu: string; marathi: string; bengali: string; gujarati: string }> = {
    running_right_time: {
      english: 'Running Right Time',
      hindi: 'समय पर चल रही है',
      kannada: 'ಸಮಯಕ್ಕೆ ಚಲಿಸುತ್ತಿದೆ',
      tamil: 'சரியான நேரத்தில் இயங்குகிறது',
      telugu: 'సమయానికి నడుస్తోంది',
      marathi: 'वेळेवर चालू आहे',
      bengali: 'সময়মতো চলছে',
      gujarati: 'સમય પર ચાલી રહી છે',
    },
    will_arrive_shortly: {
      english: 'Will Arrive Shortly',
      hindi: 'जल्द आएगी',
      kannada: 'ಶೀಘ್ರದಲ್ಲಿ ಆಗಮಿಸುತ್ತದೆ',
      tamil: 'விரைவில் வரும்',
      telugu: 'త్వరలో వస్తుంది',
      marathi: 'लवकरच येईल',
      bengali: 'শীঘ্রই আসবে',
      gujarati: 'ટૂંક સમયમાં આવશે',
    },
    is_arriving: {
      english: 'Is Arriving On',
      hindi: 'आ रही है',
      kannada: 'ಆಗಮಿಸುತ್ತಿದೆ',
      tamil: 'வந்து கொண்டிருக்கிறது',
      telugu: 'వస్తోంది',
      marathi: 'येत आहे',
      bengali: 'আসছে',
      gujarati: 'આવી રહી છે',
    },
    has_arrived: {
      english: 'Has Arrived On',
      hindi: 'आ चुकी है',
      kannada: 'ಆಗಮಿಸಿದೆ',
      tamil: 'வந்துவிட்டது',
      telugu: 'వచ్చింది',
      marathi: 'आले आहे',
      bengali: 'এসে গেছে',
      gujarati: 'આવી ગઈ છે',
    },
    running_late: {
      english: `Late by ${train.late || 0} min`,
      hindi: `${train.late || 0} मिनट देरी से`,
      kannada: `${train.late || 0} ನಿಮಿಷ ತಡವಾಗಿದೆ`,
      tamil: `${train.late || 0} நிமிடம் தாமதம்`,
      telugu: `${train.late || 0} నిమిషాలు ఆలస్యం`,
      marathi: `${train.late || 0} मिनिटे उशीर`,
      bengali: `${train.late || 0} মিনিট দেরি`,
      gujarati: `${train.late || 0} મિનિટ મોડું`,
    },
    cancelled: {
      english: 'Cancelled',
      hindi: 'रद्द की गई है',
      kannada: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
      tamil: 'ரத்து செய்யப்பட்டது',
      telugu: 'రద్దు చేయబడింది',
      marathi: 'रद्द केले',
      bengali: 'বাতিল করা হয়েছে',
      gujarati: 'રદ કરવામાં આવી',
    },
    indefinite_late: {
      english: 'Indefinite Late',
      hindi: 'अनिश्चित देरी से',
      kannada: 'ಅನಿರ್ದಿಷ್ಟ ತಡವಾಗಿದೆ',
      tamil: 'காலவரையற்ற தாமதம்',
      telugu: 'అనిర్ణీత ఆలస్యం',
      marathi: 'अनिश्चित उशीर',
      bengali: 'অনির্দিষ্ট দেরি',
      gujarati: 'અનિશ્ચિત મોડું',
    },
    terminated_at: {
      english: `Terminated At ${train.terminatedAt || ''}`,
      hindi: `${train.terminatedAt || ''} तक जायेगी`,
      kannada: `${train.terminatedAt || ''} ನಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುತ್ತದೆ`,
      tamil: `${train.terminatedAt || ''} இல் முடிவடைகிறது`,
      telugu: `${train.terminatedAt || ''} వద్ద ముగుస్తుంది`,
      marathi: `${train.terminatedAt || ''} येथे संपते`,
      bengali: `${train.terminatedAt || ''} এ শেষ`,
      gujarati: `${train.terminatedAt || ''} પર સમાપ્ત`,
    },
    platform_changed: {
      english: 'Platform Changed',
      hindi: 'प्लेटफॉर्म बदला गया',
      kannada: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಬದಲಾಯಿಸಲಾಗಿದೆ',
      tamil: 'மேடை மாற்றப்பட்டது',
      telugu: 'ప్లాట్‌ఫారమ్ మార్చబడింది',
      marathi: 'प्लॅटफॉर्म बदलले',
      bengali: 'প্ল্যাটফর্ম পরিবর্তিত',
      gujarati: 'પ્લેટફોર્મ બદલાયું',
    },
    is_ready_to_leave: {
      english: 'Is Ready to Leave',
      hindi: 'प्रस्थान के लिए तैयार',
      kannada: 'ನಿರ್ಗಮಿಸಲು ಸಿದ್ಧವಾಗಿದೆ',
      tamil: 'புறப்பட தயாராக உள்ளது',
      telugu: 'బయలుదేరడానికి సిద్ధంగా ఉంది',
      marathi: 'सोडण्यासाठी तयार',
      bengali: 'ছাড়তে প্রস্তুত',
      gujarati: 'જવા માટે તૈયાર',
    },
    is_on_platform: {
      english: 'Is on Platform',
      hindi: 'प्लेटफॉर्म पर है',
      kannada: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಲ್ಲಿದೆ',
      tamil: 'மேடையில் உள்ளது',
      telugu: 'ప్లాట్‌ఫారమ్‌లో ఉంది',
      marathi: 'प्लॅटफॉर्मवर आहे',
      bengali: 'প্ল্যাটফর্মে আছে',
      gujarati: 'પ્લેટફોર્મ પર છે',
    },
    departed: {
      english: 'Departed',
      hindi: 'प्रस्थान कर गई',
      kannada: 'ನಿರ್ಗಮಿಸಿದೆ',
      tamil: 'புறப்பட்டது',
      telugu: 'బయలుదేరింది',
      marathi: 'निघाली',
      bengali: 'প্রস্থান করেছে',
      gujarati: 'પ્રસ્થાન કર્યું',
    },
    rescheduled: {
      english: 'Rescheduled',
      hindi: 'परिवर्तित समय',
      kannada: 'ಮರುನಿಗದಿಗೊಳಿಸಲಾಗಿದೆ',
      tamil: 'மாற்று நேரம்',
      telugu: 'పునఃవ్యవస్థీకరించబడింది',
      marathi: 'पुनर्निर्धारित',
      bengali: 'পুনর্নির্ধারিত',
      gujarati: 'પુનઃનિર્ધારિત',
    },
    diverted: {
      english: `Diverted via ${train.divertedRoute || ''}`,
      hindi: `परिवर्तित मार्ग ${train.divertedRoute || ''}`,
      kannada: `ದಾರಿ ತಿರುಗಿಸಲಾಗಿದೆ ${train.divertedRoute || ''}`,
      tamil: `வழி மாற்றம் ${train.divertedRoute || ''}`,
      telugu: `మార్గం మార్చబడింది ${train.divertedRoute || ''}`,
      marathi: `मार्ग बदलला ${train.divertedRoute || ''}`,
      bengali: `রুট পরিবর্তন ${train.divertedRoute || ''}`,
      gujarati: `માર્ગ બદલાયો ${train.divertedRoute || ''}`,
    },
    delay_departure: {
      english: 'Delay Departure',
      hindi: 'विलंबित प्रस्थान',
      kannada: 'ವಿಳಂಬ ನಿರ್ಗಮನ',
      tamil: 'தாமத புறப்பாடு',
      telugu: 'ఆలస్య బయలుదేరుట',
      marathi: 'विलंबित प्रस्थान',
      bengali: 'বিলম্বিত প্রস্থান',
      gujarati: 'વિલંબિત પ્રસ્થાન',
    },
    change_of_source: {
      english: `Start at ${train.changeOfSource || ''}`,
      hindi: `${train.changeOfSource || ''} से जाएगी`,
      kannada: `${train.changeOfSource || ''} ನಿಂದ ಪ್ರಾರಂಭ`,
      tamil: `${train.changeOfSource || ''} இல் தொடங்கும்`,
      telugu: `${train.changeOfSource || ''} నుండి ప్రారంభం`,
      marathi: `${train.changeOfSource || ''} पासून सुरू`,
      bengali: `${train.changeOfSource || ''} থেকে শুরু`,
      gujarati: `${train.changeOfSource || ''} થી શરૂ`,
    },
  };

  return statusMap[train.status][language];
};

// Format audit log action for display
const formatAuditAction = (action: string, lang: Language): string => {
  const actionMap: Record<string, { english: string; hindi: string; kannada: string; tamil: string; telugu: string; marathi: string; bengali: string; gujarati: string }> = {
    'ADD_TRAIN': {
      english: 'Train Added',
      hindi: 'ट्रेन जोड़ी गई',
      kannada: 'ರೈಲು ಸೇರಿಸಲಾಗಿದೆ',
      tamil: 'ரயில் சேர்க்கப்பட்டது',
      telugu: 'రైలు జోడించబడింది',
      marathi: 'रेल्वे जोडली',
      bengali: 'ট্রেন যোগ করা হয়েছে',
      gujarati: 'ટ્રેન ઉમેરવામાં આવી',
    },
    'UPDATE_TRAIN': {
      english: 'Train Updated',
      hindi: 'ट्रेन अपडेट की गई',
      kannada: 'ರೈಲು ನವೀಕರಿಸಲಾಗಿದೆ',
      tamil: 'ரயில் புதுப்பிக்கப்பட்டது',
      telugu: 'రైలు నవీకరించబడింది',
      marathi: 'रेल्वे अद्यतनित',
      bengali: 'ট্রেন আপডেট করা হয়েছে',
      gujarati: 'ટ્રેન અપડેટ કરવામાં આવી',
    },
    'DELETE_TRAIN': {
      english: 'Train Deleted',
      hindi: 'ट्रेन हटाई गई',
      kannada: 'ರೈಲು ಅಳಿಸಲಾಗಿದೆ',
      tamil: 'ரயில் நீக்கப்பட்டது',
      telugu: 'రైలు తొలగించబడింది',
      marathi: 'रेल्वे हटवली',
      bengali: 'ট্রেন মুছে ফেলা হয়েছে',
      gujarati: 'ટ્રેન કાઢી નાખવામાં આવી',
    },
    'TRANSFER_TO_BOARD': {
      english: 'Transferred to Board',
      hindi: 'बोर्ड में स्थानांतरित',
      kannada: 'ಬೋರ್ಡ್‌ಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ',
      tamil: 'பலகைக்கு மாற்றப்பட்டது',
      telugu: 'బోర్డుకు బదిలీ చేయబడింది',
      marathi: 'बोर्डवर हस्तांतरित',
      bengali: 'বোর্ডে স্থানান্তরিত',
      gujarati: 'બોર્ડમાં સ્થાનાંતરિત',
    },
    'CHANGE_PASSWORD': {
      english: 'Password Changed',
      hindi: 'पासवर्ड बदला गया',
      kannada: 'ಪಾಸ್ವರ್ಡ್ ಬದಲಾಯಿಸಲಾಗಿದೆ',
      tamil: 'கடவுச்சொல் மாற்றப்பட்டது',
      telugu: 'పాస్‌వర్డ్ మార్చబడింది',
      marathi: 'पासवर्ड बदलला',
      bengali: 'পাসওয়ার্ড পরিবর্তন করা হয়েছে',
      gujarati: 'પાસવર્ડ બદલાયો',
    },
  };

  return actionMap[action]?.[lang] || action;
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
    <div className="flex items-center justify-center z-50">
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
  // Auto-update language when state changes
  const handleStateChange = (stateRegion: StateRegion) => {
    const regionalLang = getRegionalLanguage(stateRegion);
    onUpdate({ stateRegion, language: regionalLang });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Settings className="text-blue-600" />
        System Configuration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* State/Region Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Region (Auto-selects Regional Language)
          </label>
          <select
            value={config.stateRegion}
            onChange={(e) => handleStateChange(e.target.value as StateRegion)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="karnataka">Karnataka (ಕನ್ನಡ)</option>
            <option value="tamil_nadu">Tamil Nadu (தமிழ்)</option>
            <option value="telangana">Telangana (తెలుగు)</option>
            <option value="maharashtra">Maharashtra (मराठी)</option>
            <option value="west_bengal">West Bengal (বাংলা)</option>
            <option value="gujarat">Gujarat (ગુજરાતી)</option>
            <option value="default">Other (Hindi)</option>
          </select>
        </div>

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
            <option value="hindi">Hindi (हिंदी)</option>
            <option value="kannada">Kannada (ಕನ್ನಡ)</option>
            <option value="tamil">Tamil (தமிழ்)</option>
            <option value="telugu">Telugu (తెలుగు)</option>
            <option value="marathi">Marathi (मराठी)</option>
            <option value="bengali">Bengali (বাংলা)</option>
            <option value="gujarati">Gujarati (ગુજરાતી)</option>
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
        <div className="md:col-span-2">
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
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 second</span>
            <span>10 seconds</span>
          </div>
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

  const getDisplayEffectClass = (effect: DisplayEffect, speed: number) => {
    const duration = 11 - speed; // Inverse: higher speed = shorter duration
    switch (effect) {
      case 'scroll':
        return `animate-scroll-${speed}`;
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
        {t('train_database', config.language)} ({trains.length} {t('trains_count', config.language)})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                {t('train_number', config.language)}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                {t('train_name', config.language)}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                {t('time', config.language)}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                {t('platform', config.language)}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                A/D
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                {t('status', config.language)}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                {t('actions', config.language)}
              </th>
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
                  {/* Restricted animation container - overflow hidden */}
                  <div className="overflow-hidden relative" style={{ maxWidth: '200px' }}>
                    <div
                      className={getDisplayEffectClass(config.displayEffect, config.scrollSpeed)}
                      style={{
                        animation: config.displayEffect === 'scroll'
                          ? `marquee ${11 - config.scrollSpeed}s linear infinite`
                          : undefined,
                      }}
                    >
                      {train.trainName}
                    </div>
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
                    {train.arrivalDeparture === 'A'
                      ? t('arrival', config.language).substring(0, 1)
                      : t('departure', config.language).substring(0, 1)
                    }
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
                      {t('edit', config.language)}
                    </button>
                    <button
                      onClick={() => onDelete(train.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      {t('delete', config.language)}
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
                      <option value="" disabled>
                        {t('transfer_to', config.language)}...
                      </option>
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

const ArrivalDepartureInfo: React.FC = () => {
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
              Train Arrival/Departure Information Entry Features
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

export default ArrivalDepartureInfo;
