import type { Common } from '@strapi/types/dist/types';

export interface JournalEntry {
  // uid: Common.UID.ContentType;$
  id: number;
  communication_details: string;
  communication_type: string;
  createdAt: Date;
  createdBy?: string;
  creator: string;
  date_created: Date;
  date_visum_decision_deliverer: Date;
  date_visum_decision_receiver: Date;
  date_visum_message: Date;
  date_visum_triage: Date;
  decision: string;
  department: string;
  is_key_message: boolean;
  message_content: string;
  message_number: number;
  message_subject: string;
  operation?: {
    id: number;
    [key: string]: any;
  };
  organization?: {
    id: number;
    [key: string]: any;
  };
  publishedAt: Date;
  related_symbols: any;
  sender: string;
  status: 'awaiting_triage' | 'awaiting_drawing' | 'awaiting_decision' | 'completed' | null;
  updatedAt: Date;
  updatedBy?: string;
  visum_decision_deliverer: string;
  visum_decision_receiver: string;
  visum_message: string;
  visum_triage: string;
}
