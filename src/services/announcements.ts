import type { AnnouncementRecord, AnnouncementTemplate } from "../shared/api";

const API_BASE = "/api/announcements";

export async function getAnnouncements(): Promise<{
  templates: AnnouncementTemplate[];
  records: AnnouncementRecord[];
}> {
  const response = await fetch(`${API_BASE}`);
  if (!response.ok) throw new Error("Failed to fetch announcements");
  return response.json();
}

export async function triggerAnnouncement(
  templateId: string,
  language: "en" | "hi" | "regional" = "en",
  variables: Record<string, string> = {},
  trainNumber?: string,
): Promise<AnnouncementRecord> {
  const response = await fetch(`${API_BASE}/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateId,
      language,
      variables,
      trainNumber,
    }),
  });

  if (!response.ok) throw new Error("Failed to trigger announcement");
  return response.json();
}

export async function markAnnouncementAnnounced(
  id: string,
  audioUrl?: string,
): Promise<AnnouncementRecord> {
  const response = await fetch(`${API_BASE}/${id}/announced`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioUrl }),
  });

  if (!response.ok) throw new Error("Failed to mark announcement as announced");
  return response.json();
}

export async function markAnnouncementFailed(
  id: string,
): Promise<AnnouncementRecord> {
  const response = await fetch(`${API_BASE}/${id}/failed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to mark announcement as failed");
  return response.json();
}

/**
 * Text-to-Speech Engine using Web Speech API
 * Supports browser-native speech synthesis
 */
export class TextToSpeechEngine {
  private synth: SpeechSynthesis;
  private isSupported: boolean;

  constructor() {
    // Check for Web Speech API support
    const SpeechSynthesisUtterance =
      window.SpeechSynthesisUtterance ||
      (window as any).webkitSpeechSynthesisUtterance;
    this.synth =
      window.speechSynthesis || (window as any).webkitSpeechSynthesis;
    this.isSupported = !!this.synth && !!SpeechSynthesisUtterance;
  }

  speak(
    text: string,
    language: "en" | "hi" | "regional" = "en",
    onComplete?: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error("Text-to-Speech not supported in this browser"));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const SpeechSynthesisUtterance =
        window.SpeechSynthesisUtterance ||
        (window as any).webkitSpeechSynthesisUtterance;
      const utterance = new SpeechSynthesisUtterance(text);

      // Set language based on selection
      switch (language) {
        case "hi":
          utterance.lang = "hi-IN";
          break;
        case "regional":
          utterance.lang = "ta-IN"; // Tamil as regional language
          break;
        case "en":
        default:
          utterance.lang = "en-IN";
      }

      // Configure voice properties
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Event handlers
      utterance.onend = () => {
        onComplete?.();
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speech
      this.synth.speak(utterance);
    });
  }

  stop(): void {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.isSupported && this.synth.speaking;
  }

  isSupported_(): boolean {
    return this.isSupported;
  }
}

// Singleton instance
let ttsEngine: TextToSpeechEngine;

export function getTTSEngine(): TextToSpeechEngine {
  if (!ttsEngine) {
    ttsEngine = new TextToSpeechEngine();
  }
  return ttsEngine;
}
