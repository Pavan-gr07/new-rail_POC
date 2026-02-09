/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Announcement Types
 */
export type AnnouncementTriggerType =
  | "train_delay"
  | "train_cancellation"
  | "platform_change"
  | "boarding_started"
  | "health_alert"
  | "custom";

export interface AnnouncementTemplate {
  id: string;
  name: string;
  triggerType: AnnouncementTriggerType;
  textEnglish: string;
  textHindi: string;
  textRegional: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementRecord {
  id: string;
  templateId: string;
  triggerType: AnnouncementTriggerType;
  trainNumber?: string;
  message: string;
  language: "en" | "hi" | "regional";
  status: "pending" | "announced" | "failed";
  audioUrl?: string;
  createdAt: string;
  announcedAt?: string;
}

export interface CreateAnnouncementTemplateRequest {
  name: string;
  triggerType: AnnouncementTriggerType;
  textEnglish: string;
  textHindi: string;
  textRegional: string;
}

export interface AnnouncementListResponse {
  templates: AnnouncementTemplate[];
  records: AnnouncementRecord[];
}
