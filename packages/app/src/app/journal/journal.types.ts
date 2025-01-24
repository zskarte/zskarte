export enum JournalEntryStatus {
  AWAITING_MESSAGE = 'awaiting_message',
  AWAITING_TRIAGE = 'awaiting_triage',
  AWAITING_DECISION = 'awaiting_decision',
  AWAITING_COMPLETION = 'awaiting_completion',
  COMPLETED = 'completed',
}

export interface JournalEntry {
  id: number;
  documentId: string;
  messageNumber: number;
  messageContent: string;
  messageSubject: string;
  dateMessage: Date;
  communicationDetails: string;
  communicationType: string;

  createdAt: Date;
  createdBy?: string;
  creator: string;
  dateDecisionDelivered: Date | null;
  dateDecision: Date | null;

  dateTriage: Date | null;
  decision: string;
  department:
    | null
    | 'politische-behoerde'
    | 'chef-fuehrungsorgan'
    | 'stabschef'
    | 'fb-lage'
    | 'fb-information'
    | 'fb-oeffentliche-sicherheit'
    | 'fb-schutz-rettung'
    | 'fb-gesundheit'
    | 'fb-logistik'
    | 'fb-infrastukturen';
  isKeyMessage: boolean;
  operation?: {
    id: number;
    [key: string]: any;
  };
  organization?: {
    id: number;
    [key: string]: any;
  };
  publishedAt: Date;
  sender: string;
  entryStatus: JournalEntryStatus;
  updatedAt: Date;
  updatedBy?: string;
  visumDecider: string;
  visumMessage: string;
  visumTriage: string;
  decisionReceiver: string;
  decisionSender: string;
  isDrawnOnMap: boolean;
}
