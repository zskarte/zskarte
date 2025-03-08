export enum JournalEntryStatus {
  AWAITING_MESSAGE = 'awaiting_message',
  AWAITING_TRIAGE = 'awaiting_triage',
  AWAITING_DECISION = 'awaiting_decision',
  AWAITING_COMPLETION = 'awaiting_completion',
  COMPLETED = 'completed',
}

export const JournalEntryStatusNext: Record<JournalEntryStatus, JournalEntryStatus> = {
  [JournalEntryStatus.AWAITING_MESSAGE]: JournalEntryStatus.AWAITING_TRIAGE,
  [JournalEntryStatus.AWAITING_TRIAGE]: JournalEntryStatus.AWAITING_DECISION,
  [JournalEntryStatus.AWAITING_DECISION]: JournalEntryStatus.AWAITING_COMPLETION,
  [JournalEntryStatus.AWAITING_COMPLETION]: JournalEntryStatus.COMPLETED,
  [JournalEntryStatus.COMPLETED]: JournalEntryStatus.COMPLETED,
};

export const JournalEntryStatusReset: Record<JournalEntryStatus, JournalEntryStatus | null> = {
  [JournalEntryStatus.AWAITING_MESSAGE]: null,
  [JournalEntryStatus.AWAITING_TRIAGE]: JournalEntryStatus.AWAITING_MESSAGE,
  [JournalEntryStatus.AWAITING_DECISION]: JournalEntryStatus.AWAITING_TRIAGE,
  [JournalEntryStatus.AWAITING_COMPLETION]: null,
  [JournalEntryStatus.COMPLETED]: null,
};

export const JournalEntryStatusDateField: Record<JournalEntryStatus, keyof JournalEntry | null> = {
  [JournalEntryStatus.AWAITING_MESSAGE]: null,
  [JournalEntryStatus.AWAITING_TRIAGE]: 'dateTriage',
  [JournalEntryStatus.AWAITING_DECISION]: 'dateDecision',
  [JournalEntryStatus.AWAITING_COMPLETION]: 'dateDecisionDelivered',
  [JournalEntryStatus.COMPLETED]: null,
};

export const JournalEntryStatusFields: Record<JournalEntryStatus, (keyof JournalEntry)[]> = {
  [JournalEntryStatus.AWAITING_MESSAGE]: [
    'messageNumber',
    'messageSubject',
    'messageContent',
    'dateMessage',
    'communicationType',
    'communicationDetails',
    'sender',
    'creator',
    'visumMessage',
  ],
  [JournalEntryStatus.AWAITING_TRIAGE]: ['isKeyMessage', 'department', 'visumTriage', 'dateTriage'],
  [JournalEntryStatus.AWAITING_DECISION]: ['decision', 'decisionReceiver', 'visumDecider', 'dateDecision'],
  [JournalEntryStatus.AWAITING_COMPLETION]: ['decisionSender', 'dateDecisionDelivered'],
  [JournalEntryStatus.COMPLETED]: [],
};

export const DepartmentValues = [
  'politische-behoerde',
  'chef-fuehrungsorgan',
  'stabschef',
  'fb-lage',
  'fb-information',
  'fb-oeffentliche-sicherheit',
  'fb-schutz-rettung',
  'fb-gesundheit',
  'fb-logistik',
  'fb-infrastrukturen',
] as const;
export type Department = (typeof DepartmentValues)[number] | null;

export const CommunicationTypeValues = {
  telefon: 'phone',
  funk: 'radio',
  email: 'mail',
  fax: 'fax',
  sms: 'sms',
  kurier: 'courier',
  andere: 'other',
} as const;

export type CommunicationType = keyof typeof CommunicationTypeValues | null;

export interface JournalEntry {
  id?: number;
  documentId?: string;
  createdAt?: Date;
  createdBy?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  operation?: {
    id: number;
    [key: string]: any;
  };
  organization?: {
    id: number;
    [key: string]: any;
  };

  entryStatus: JournalEntryStatus;

  messageNumber: number;
  messageSubject: string;
  messageContent: string;
  dateMessage: Date;
  communicationType: CommunicationType;
  communicationDetails: string;
  creator: string;
  sender: string;
  visumMessage: string;

  isKeyMessage: boolean;
  department: Department;
  visumTriage: string;
  dateTriage: Date | null;

  decision: string;
  decisionReceiver: string;
  visumDecider: string;
  dateDecision: Date | null;

  dateDecisionDelivered: Date | null;
  decisionSender: string;

  isDrawnOnMap: boolean;
  isDrawingOnMap: boolean;
}
