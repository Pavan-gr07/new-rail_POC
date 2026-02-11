import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Save,
  Upload,
  Clock,
  MessageSquare,
  Settings,
  Monitor,
  PlayCircle,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';

// Types
interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  format: string;
  url: string;
  duration: number;
  transitionEffect?: string;
  repeatCount: number;
}

interface Playlist {
  id: string;
  name: string;
  items: MediaItem[];
  createdAt: Date;
}

interface DisplayBoard {
  id: string;
  name: string;
  resolution: {
    width: number;
    height: number;
  };
  status: 'online' | 'offline';
  currentPlaylist?: string;
}

interface SpecialMessage {
  id: string;
  text?: string;
  language: string;
  fontSize: number;
  color: string;
  displayType: 'stay' | 'flash';
  duration: number;
  position: 'top' | 'bottom';
}

interface TrainInfo {
  trainNumber: string;
  trainName: string;
  arrival: string;
  departure: string;
  platform: string;
  status: string;
}

type TabType = 'playlist' | 'schedule' | 'preview' | 'messages' | 'boards' | 'train';

// Transition effects
const transitionEffects = [
  'fade',
  'slide-left',
  'slide-right',
  'slide-up',
  'slide-down',
  'zoom-in',
  'zoom-out',
  'wipe-left',
  'wipe-right',
  'dissolve'
];

const VideoDisplaySoftware: React.FC = () => {
  // State Management
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 'playlist-1',
      name: 'Default Playlist',
      items: [],
      createdAt: new Date()
    }
  ]);
  const [currentPlaylist, setCurrentPlaylist] = useState<string>('playlist-1');
  const [displayBoards, setDisplayBoards] = useState<DisplayBoard[]>([
    {
      id: 'board-1',
      name: 'Platform 1 Display',
      resolution: { width: 1920, height: 1080 },
      status: 'online',
      currentPlaylist: 'playlist-1'
    },
    {
      id: 'board-2',
      name: 'Platform 2 Display',
      resolution: { width: 1280, height: 720 },
      status: 'online'
    }
  ]);
  const [selectedBoard, setSelectedBoard] = useState<string>('board-1');
  const [specialMessages, setSpecialMessages] = useState<SpecialMessage[]>([]);
  const [trainData] = useState<TrainInfo[]>([
    {
      trainNumber: '12345',
      trainName: 'Rajdhani Express',
      arrival: '14:30',
      departure: '14:45',
      platform: '1',
      status: 'On Time'
    },
    {
      trainNumber: '67890',
      trainName: 'Shatabdi Express',
      arrival: '15:00',
      departure: '15:15',
      platform: '2',
      status: 'Delayed 10 min'
    }
  ]);

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('playlist');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [showAddPlaylistModal, setShowAddPlaylistModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [fitToScreen, setFitToScreen] = useState<boolean>(true);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);

  // Form States
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [newMessage, setNewMessage] = useState<SpecialMessage>({
    id: '',
    language: 'en',
    fontSize: 24,
    color: '#FFFFFF',
    displayType: 'stay',
    duration: 5,
    position: 'bottom'
  });
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Get current playlist
  const getCurrentPlaylist = (): Playlist | undefined =>
    playlists.find(p => p.id === currentPlaylist);

  // Add new playlist
  const handleAddPlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name: newPlaylistName,
        items: [],
        createdAt: new Date()
      };
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
      setShowAddPlaylistModal(false);
    }
  };

  // Delete playlist
  const handleDeletePlaylist = (playlistId: string) => {
    if (playlists.length > 1) {
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      if (currentPlaylist === playlistId) {
        setCurrentPlaylist(playlists[0].id);
      }
    }
  };

  // Add media item to playlist
  const handleAddMediaItem = (file: File) => {
    const playlist = getCurrentPlaylist();
    if (!playlist) return;

    const fileType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video';
    const format = file.name.split('.').pop() || '';

    const newItem: MediaItem = {
      id: `item-${Date.now()}`,
      name: file.name,
      type: fileType,
      format: format,
      url: URL.createObjectURL(file),
      duration: fileType === 'image' ? 5 : 10,
      transitionEffect: fileType === 'image' ? 'fade' : undefined,
      repeatCount: 1
    };

    const updatedPlaylist: Playlist = {
      ...playlist,
      items: [...playlist.items, newItem]
    };

    setPlaylists(playlists.map(p => p.id === currentPlaylist ? updatedPlaylist : p));
  };

  // Remove media item
  const handleRemoveItem = (itemId: string) => {
    const playlist = getCurrentPlaylist();
    if (!playlist) return;

    const updatedPlaylist: Playlist = {
      ...playlist,
      items: playlist.items.filter(item => item.id !== itemId)
    };

    setPlaylists(playlists.map(p => p.id === currentPlaylist ? updatedPlaylist : p));
  };

  // Update media item
  const handleUpdateItem = (itemId: string, updates: Partial<MediaItem>) => {
    const playlist = getCurrentPlaylist();
    if (!playlist) return;

    const updatedPlaylist: Playlist = {
      ...playlist,
      items: playlist.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    };

    setPlaylists(playlists.map(p => p.id === currentPlaylist ? updatedPlaylist : p));
  };

  // Add special message
  const handleAddMessage = () => {
    if (newMessage.text) {
      const message: SpecialMessage = {
        ...newMessage,
        id: `msg-${Date.now()}`
      };
      setSpecialMessages([...specialMessages, message]);
      setNewMessage({
        id: '',
        language: 'en',
        fontSize: 24,
        color: '#FFFFFF',
        displayType: 'stay',
        duration: 5,
        position: 'bottom'
      });
      setShowMessageModal(false);
    }
  };

  // Remove special message
  const handleRemoveMessage = (messageId: string) => {
    setSpecialMessages(specialMessages.filter(m => m.id !== messageId));
  };

  // Playlist playback logic
  useEffect(() => {
    if (!isPlaying) return;

    const playlist = getCurrentPlaylist();
    if (!playlist || playlist.items.length === 0) return;

    const currentItem = playlist.items[currentItemIndex];
    if (!currentItem) return;

    if (currentItem.type === 'image') {
      timerRef.current = setTimeout(() => {
        handleNextItem();
      }, currentItem.duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentItemIndex, currentPlaylist]);

  // Handle video ended
  const handleVideoEnded = () => {
    handleNextItem();
  };

  // Move to next item
  const handleNextItem = () => {
    const playlist = getCurrentPlaylist();
    if (!playlist || playlist.items.length === 0) return;

    const nextIndex = (currentItemIndex + 1) % playlist.items.length;
    setCurrentItemIndex(nextIndex);
  };

  // Play/Pause control
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Reset playback
  const resetPlayback = () => {
    setCurrentItemIndex(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Push to display board
  const pushToBoard = (boardId: string, playlistId: string) => {
    setDisplayBoards(displayBoards.map(board =>
      board.id === boardId ? { ...board, currentPlaylist: playlistId } : board
    ));
  };

  // Render current media item
  const renderMediaItem = (item: MediaItem, isPreview: boolean = false) => {
    const containerStyle = fitToScreen && maintainAspectRatio
      ? { objectFit: 'contain' as const }
      : fitToScreen
        ? { objectFit: 'fill' as const }
        : { objectFit: 'none' as const };

    if (item.type === 'image') {
      return (
        <img
          src={item.url}
          alt={item.name}
          className={`w-full h-full transition-all duration-500 animate-${item.transitionEffect || 'fade-in'}`}
          style={containerStyle}
        />
      );
    } else {
      return (
        <video
          ref={isPreview ? null : videoRef}
          src={item.url}
          className="w-full h-full"
          style={containerStyle}
          onEnded={handleVideoEnded}
          autoPlay={!isPreview && isPlaying}
          loop={item.repeatCount === -1}
        />
      );
    }
  };

  // Render special messages overlay
  const renderSpecialMessages = () => {
    return specialMessages.map(msg => (
      <div
        key={msg.id}
        className={`absolute ${msg.position === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 px-8 py-4 bg-black bg-opacity-80 ${msg.displayType === 'flash' ? 'animate-pulse' : ''
          }`}
        style={{
          fontSize: `${msg.fontSize}px`,
          color: msg.color
        }}
      >
        <p className="text-center font-semibold">{msg.text}</p>
      </div>
    ));
  };

  const playlist = getCurrentPlaylist();
  const currentItem = playlist && playlist.items[currentItemIndex];
  const selectedBoardData = displayBoards.find(b => b.id === selectedBoard);

  const tabs = [
    { id: 'playlist' as const, label: 'Playlists', Icon: PlayCircle },
    { id: 'schedule' as const, label: 'Schedule', Icon: Clock },
    { id: 'preview' as const, label: 'Preview', Icon: Eye },
    { id: 'messages' as const, label: 'Special Messages', Icon: MessageSquare },
    { id: 'boards' as const, label: 'Display Boards', Icon: Monitor },
    { id: 'train' as const, label: 'Train Info', Icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Video Display Control Center
                </h1>
                <p className="text-sm text-slate-400">Integrated Passenger Information System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <span className="text-green-400 text-sm font-semibold">● SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700 bg-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                <tab.Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Playlist Tab */}
        {activeTab === 'playlist' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Playlist Selector */}
            <div className="col-span-3 space-y-4">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Playlists</h2>
                  <button
                    onClick={() => setShowAddPlaylistModal(true)}
                    className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {playlists.map(pl => (
                    <div
                      key={pl.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${currentPlaylist === pl.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                        }`}
                      onClick={() => setCurrentPlaylist(pl.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{pl.name}</p>
                          <p className="text-xs text-slate-400">{pl.items.length} items</p>
                        </div>
                        {playlists.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(pl.id);
                            }}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Playlist Items */}
            <div className="col-span-9">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {playlist?.name} - Media Items
                  </h2>
                  <div className="flex gap-3">
                    <label className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="font-medium">Add Media</span>
                      <input
                        type="file"
                        accept=".bmp,.jpeg,.jpg,.png,.tiff,.mpeg,.mp4,.wmv,.dat,.avi,.mov"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAddMediaItem(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {playlist && playlist.items.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No media items in this playlist</p>
                    <p className="text-sm mt-2">Add images or videos to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playlist?.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                            {item.type === 'image' ? (
                              <ImageIcon className="w-6 h-6 text-cyan-400" />
                            ) : (
                              <VideoIcon className="w-6 h-6 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-slate-400">
                              {item.type.toUpperCase()} • {item.format} • {item.duration}s
                              {item.transitionEffect && ` • ${item.transitionEffect}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Edit Mode */}
                        {editingItem?.id === item.id && (
                          <div className="mt-4 pt-4 border-t border-slate-600 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">Duration (seconds)</label>
                              <input
                                type="number"
                                value={item.duration}
                                onChange={(e) => handleUpdateItem(item.id, { duration: parseInt(e.target.value) || 5 })}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            {item.type === 'image' && (
                              <div>
                                <label className="block text-sm text-slate-400 mb-2">Transition Effect</label>
                                <select
                                  value={item.transitionEffect}
                                  onChange={(e) => handleUpdateItem(item.id, { transitionEffect: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:border-cyan-500"
                                >
                                  {transitionEffects.map(effect => (
                                    <option key={effect} value={effect}>{effect}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">Repeat Count</label>
                              <input
                                type="number"
                                value={item.repeatCount}
                                onChange={(e) => handleUpdateItem(item.id, { repeatCount: parseInt(e.target.value) || 1 })}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:border-cyan-500"
                                placeholder="-1 for infinite"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors w-full flex items-center justify-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Playlist Schedule Configuration</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Select Playlist</label>
                  <select
                    value={currentPlaylist}
                    onChange={(e) => setCurrentPlaylist(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {playlists.map(pl => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Select Display Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {displayBoards.map(board => (
                      <option key={board.id} value={board.id}>
                        {board.name} ({board.resolution.width}x{board.resolution.height})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Display Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fitToScreen}
                      onChange={(e) => setFitToScreen(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>Fit to Display Board</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>Maintain Aspect Ratio</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => pushToBoard(selectedBoard, currentPlaylist)}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/20"
              >
                Push Schedule to Display Board
              </button>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Live Preview</h2>

              {/* Preview Controls */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayback}
                      className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={resetPlayback}
                      className="p-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <div className="text-sm">
                      <span className="text-slate-400">Item:</span>
                      <span className="ml-2 font-semibold">{currentItemIndex + 1} / {playlist?.items.length || 0}</span>
                    </div>
                    {currentItem && (
                      <div className="text-sm">
                        <span className="text-slate-400">Current:</span>
                        <span className="ml-2 font-semibold">{currentItem.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {selectedBoardData && `${selectedBoardData.resolution.width}x${selectedBoardData.resolution.height}`}
                  </div>
                </div>
              </div>

              {/* Preview Display */}
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {currentItem ? (
                  <>
                    {renderMediaItem(currentItem)}
                    {renderSpecialMessages()}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>No media to preview</p>
                      <p className="text-sm mt-2">Add items to playlist to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Special Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Special Messages</h2>
              <button
                onClick={() => setShowMessageModal(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Message
              </button>
            </div>

            <div className="space-y-3">
              {specialMessages.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No special messages configured</p>
                </div>
              ) : (
                specialMessages.map(msg => (
                  <div key={msg.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: msg.color, fontSize: `${msg.fontSize}px` }}>
                          {msg.text}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-slate-400">
                          <span>Language: {msg.language.toUpperCase()}</span>
                          <span>Type: {msg.displayType}</span>
                          <span>Duration: {msg.duration}s</span>
                          <span>Position: {msg.position}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMessage(msg.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Display Boards Tab */}
        {activeTab === 'boards' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Display Boards Network</h2>
            <div className="grid grid-cols-2 gap-4">
              {displayBoards.map(board => (
                <div key={board.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{board.name}</h3>
                      <p className="text-sm text-slate-400">
                        {board.resolution.width}x{board.resolution.height}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${board.status === 'online'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                      {board.status.toUpperCase()}
                    </div>
                  </div>
                  {board.currentPlaylist && (
                    <div className="bg-slate-600/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Active Playlist:</p>
                      <p className="font-medium">
                        {playlists.find(p => p.id === board.currentPlaylist)?.name || 'Unknown'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Train Info Tab */}
        {activeTab === 'train' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Train Arrival/Departure Information</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Train No.</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Train Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Arrival</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Departure</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Platform</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainData.map((train, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-mono">{train.trainNumber}</td>
                      <td className="py-3 px-4 font-medium">{train.trainName}</td>
                      <td className="py-3 px-4">{train.arrival}</td>
                      <td className="py-3 px-4">{train.departure}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-sm">
                          {train.platform}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${train.status.includes('Delayed') ? 'text-red-400' : 'text-green-400'
                          }`}>
                          {train.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Train information can be fetched from railway designated server system through standard protocols.
                Configure the integration settings to connect with the live data source.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Add Playlist Modal */}
      {showAddPlaylistModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPlaylistModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlaylist}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors font-semibold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Add Special Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Message Text</label>
                <textarea
                  value={newMessage.text || ''}
                  onChange={(e) => setNewMessage({ ...newMessage, text: e.target.value })}
                  placeholder="Enter message to display..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Language</label>
                  <select
                    value={newMessage.language}
                    onChange={(e) => setNewMessage({ ...newMessage, language: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="regional">Regional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Font Size</label>
                  <input
                    type="number"
                    value={newMessage.fontSize}
                    onChange={(e) => setNewMessage({ ...newMessage, fontSize: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Color</label>
                  <input
                    type="color"
                    value={newMessage.color}
                    onChange={(e) => setNewMessage({ ...newMessage, color: e.target.value })}
                    className="w-full h-12 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Display Type</label>
                  <select
                    value={newMessage.displayType}
                    onChange={(e) => setNewMessage({ ...newMessage, displayType: e.target.value as 'stay' | 'flash' })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="stay">Stay</option>
                    <option value="flash">Flash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    value={newMessage.duration}
                    onChange={(e) => setNewMessage({ ...newMessage, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Position</label>
                  <select
                    value={newMessage.position}
                    onChange={(e) => setNewMessage({ ...newMessage, position: e.target.value as 'top' | 'bottom' })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMessage}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors font-semibold"
                >
                  Add Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDisplaySoftware;
