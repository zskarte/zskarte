/**
 * ========================================
 * 📝 JOURNAL & COMMUNICATION TRANSLATIONS
 * ========================================
 * 
 * This module contains translation keys specifically for journal and communication functionality
 * in the ZSKarte disaster management application.
 * 
 * 🎯 SCOPE - This file should contain translations for:
 * 
 * ✅ Journal Entry Management:
 *    - Journal form fields and states (messageContent, messageDate, messageTime)
 *    - Entry status workflows (awaiting_message, awaiting_triage, completed)
 *    - Responsibility management (input, triage, decision, output)
 * 
 * ✅ Communication Systems:
 *    - Communication devices (phone, radio, email, sms, fax)
 *    - Message delivery (deliverer, receiver, courier)
 *    - Communication details (detailsChanel, visa, author)
 * 
 * ✅ Department & Workflow Management:
 *    - Department names (fb-lage, fb-information, fb-gesundheit, etc.)
 *    - Workflow processes (triage, decision, completion)
 *    - Administrative roles (stabschef, chef-fuehrungsorgan)
 * 
 * ✅ Journal-Specific Actions:
 *    - Entry editing and validation (wrongContent, backToInput)
 *    - Drawing integration (markAsDrawn, isDrawnOnMap)
 *    - Status management and display
 * 
 * ❌ DO NOT add to this file:
 *    - General UI actions used across multiple domains
 *    - Map-specific functionality or drawing tools
 *    - Help text or documentation content
 *    - Generic form controls (use core translations instead)
 * 
 * 📝 ADDING NEW KEYS:
 * When adding journal-related translations, follow this format:
 * 
 * yourJournalKey: {
 *   de: 'German translation',
 *   en: 'English translation',
 *   fr: 'French translation',
 * },
 * 
 * Current size: ~488 lines covering journal workflows, communication, and department management.
 * ========================================
 */
export const JOURNAL_TRANSLATIONS = {
  journal: {
    de: 'Journal',
    en: 'Journal',
    fr: 'Journal',
  },
  journalEntry_awaiting_message: {
    de: 'Meldung',
    en: 'Awaiting message',
    fr: 'En attente de message',
  },
  journalEntry_awaiting_triage: {
    de: 'Triage',
    en: 'Awaiting triage',
    fr: 'En attente de triage',
  },
  journalEntry_awaiting_decision: {
    de: 'Entscheidung',
    en: 'Awaiting decision',
    fr: 'En attente de décision',
  },
  journalEntry_awaiting_completion: {
    de: 'Abschluss',
    en: 'Awaiting completion',
    fr: 'En attente de finalisation',
  },
  journalEntry_completed: {
    de: 'Abgeschlossen',
    en: 'Completed',
    fr: 'Terminé',
  },
  journalEntryResponsibility_awaiting_triage: {
    de: 'Triage',
    en: 'Triage',
    fr: 'Triage',
  },
  journalEntryResponsibility_awaiting_completion: {
    de: 'Ausgang',
    en: 'Output',
    fr: 'Sortie',
  },
  journalEntryResponsibility_completed: {
    de: '-',
    en: '-',
    fr: '-',
  },
  noMessagesToProcess: {
    de: 'Keine Meldungen zu verarbeiten',
    en: 'No messages to process',
    fr: 'Aucun message à traiter',
  },
  messagesToDraw: {
    de: 'Zu zeichnende Meldungen',
    en: 'Messages to draw',
    fr: 'Messages à dessiner',
  },
  drawnMessages: {
    de: 'Gezeichnete Meldungen',
    en: 'Drawn messages',
    fr: 'Messages dessinés',
  },
  startDrawing: {
    de: 'Mit Zeichnen beginnen',
    en: 'Start Drawing',
    fr: 'Commencer à dessiner',
  },
  someoneIsDrawing: {
    de: 'Jemand hat mit Zeichnen begonnen',
    en: 'Someone started drawing',
    fr: "Quelqu'un a commencé à dessiner",
  },
  markAsDrawn: {
    de: 'Als gezeichnet markieren',
    en: 'Mark as drawn',
    fr: 'Marquer comme dessiné',
  },
  markAsNotDrawn: {
    de: 'Als nicht gezeichnet markieren',
    en: 'Mark as not drawn',
    fr: 'Marquer comme non dessiné',
  },
  isDrawnOnMap: {
    de: 'Eingezeichnet',
    en: 'Drawn',
    fr: 'Dessiné',
  },
  entryStatus: {
    de: 'Aktueller Status',
    en: 'Current state',
    fr: 'Statut actuel',
  },
  deliverer: {
    de: 'Absender',
    en: 'Deliverer',
    fr: 'Livreur',
  },
  receiver: {
    de: 'Empfänger',
    en: 'Receiver',
    fr: 'Destinataire',
  },
  communicationDevice: {
    de: 'Kommunikationsmittel',
    en: 'Communication device',
    fr: 'Dispositif de communication',
  },
  phone: {
    de: 'Telefon',
    en: 'Phone',
    fr: 'Téléphone',
  },
  radio: {
    de: 'Funk',
    en: 'Radio',
    fr: 'Radio',
  },
  mail: {
    de: 'E-Mail',
    en: 'eMail',
    fr: 'eMail',
  },
  fax: {
    de: 'Fax',
    en: 'Fax',
    fr: 'Fax',
  },
  email: {
    de: 'E-Mail',
    en: 'Email',
    fr: 'Email',
  },
  sms: {
    de: 'SMS',
    en: 'SMS',
    fr: 'SMS',
  },
  other: {
    de: 'Andere',
    en: 'Other',
    fr: 'Autre',
  },
  messageContent: {
    de: 'Meldungsinhalt',
    en: 'Message content',
    fr: 'Contenu du message',
  },
  messageTitle: {
    de: 'Betreff',
    en: 'Subject',
    fr: 'Sujet',
  },
  messageDate: {
    de: 'Meldungsdatum',
    en: 'Report date',
    fr: 'Date de rapport',
  },
  messageTime: {
    de: 'Meldungszeit',
    en: 'Report time',
    fr: 'Heure de rapport',
  },
  dateMessage: {
    de: 'Meldung Zeitpunkt',
    en: 'Report time',
    fr: 'Heure de rapport',
  },
  messageNumber: {
    de: 'Meldungsnummer',
    en: 'Report number',
    fr: 'Numéro de rapport',
  },
  messageNumberShort: {
    de: 'Nummer',
    en: 'Number',
    fr: 'Numéro',
  },
  messageNumberShort2: {
    de: 'Nr.',
    en: 'No.',
    fr: 'n°',
  },
  detailsChanel: {
    de: 'Nummer / Kanal',
    en: 'Number / channel',
    fr: 'Numéro / canal',
  },
  visa: {
    de: 'Visum',
    en: 'Visa',
    fr: 'Visa',
  },
  author: {
    de: 'Verfasser',
    en: 'Author',
    fr: 'Auteur',
  },
  keyMessage: {
    de: 'Schlüsselmeldung',
    en: 'Key message',
    fr: 'Message clé',
  },
  keyMessageShort: {
    de: 'Schlüssel',
    en: 'Key',
    fr: 'clé',
  },
  department: {
    de: 'Fachbereich',
    en: 'Department',
    fr: 'Département',
  },
  dateTriage: {
    de: 'Triage Zeitpunkt',
    en: 'Triage time',
    fr: 'Heure de triage',
  },
  visumTriage: {
    de: 'Visum Triage',
    en: 'Visa triage',
    fr: 'Visa de triage',
  },
  messageReceiver: {
    de: 'Empfänger der Entscheidung',
    en: 'Receiver of decision',
    fr: 'Destinataire de la décision',
  },
  dateDecision: {
    de: 'Entscheidungszeitpunkt',
    en: 'Decision time',
    fr: 'Heure de décision',
  },
  visumDecider: {
    de: 'Visum Entscheidung',
    en: 'Visa decision',
    fr: 'Visa de décision',
  },
  'politische-behoerde': {
    de: 'Politische Behörde',
    en: 'Political authority',
    fr: 'Autorité politique',
  },
  'chef-fuehrungsorgan': {
    de: 'Chef Führungsorgan',
    en: 'Chief executive body',
    fr: 'Organe directeur',
  },
  stabschef: {
    de: 'Stabschef',
    en: 'Chief staff',
    fr: 'Chef du personnel',
  },
  'fb-lage': {
    de: 'FB Lage',
    en: 'DP Location',
    fr: 'DP localisation',
  },
  'fb-information': {
    de: 'FB Information',
    en: 'DP Information',
    fr: 'DP Information',
  },
  'fb-oeffentliche-sicherheit': {
    de: 'FB Sicherheit',
    en: 'DP Safety',
    fr: 'DP Sécurité',
  },
  'fb-schutz-rettung': {
    de: 'FB Schutz und Rettung',
    en: 'DP Safety and Rescue',
    fr: 'DP Sécurité et sauvetage',
  },
  'fb-gesundheit': {
    de: 'FB Gesundheit',
    en: 'DP Health',
    fr: 'DP Santé',
  },
  'fb-logistik': {
    de: 'FB Logistik',
    en: 'DP Logistics',
    fr: 'DP Logistique',
  },
  'fb-infrastrukturen': {
    de: 'FB Infrastruktur',
    en: 'DP Infrastructure',
    fr: 'DP Infrastructure',
  },
  wrongContent: {
    de: 'Falscher Inhalt',
    en: 'Wrong content',
    fr: 'Mauvais contenu',
  },
  wrongContentMessage: {
    de: 'Falls dieser Journaleintrag nicht korrekt ist, gib ihn zurück an den Eingang.',
    en: 'If this journal entry is not correct, return it to the input.',
    fr: "Si cette entrée de journal n'est pas correcte, renvoyez-la à l'entrée.",
  },
  wrongContentInfo: {
    de: 'Beschreibe was falsch ist / korrigiert werden muss.',
    en: 'Describe what is wrong / needs to be corrected.',
    fr: 'Décrivez ce qui ne va pas/doit être corrigé.',
  },
  backToInput: {
    de: 'Zurück an Eingang senden',
    en: 'Return to input',
    fr: "Renvoyer à l'entrée",
  },
  wrongDepartment: {
    de: 'Falscher Fachbereich',
    en: 'Wrong department',
    fr: 'Mauvais département',
  },
  triage: {
    de: 'Triage',
    en: 'Triage',
    fr: 'Triage',
  },
  wrongTriage: {
    de: 'Falls dieser Journaleintrag nicht in deinen Fachbereich gehört gib ihn zurück an die Triage.',
    en: 'If this journal entry does not belong to your department, return it to the triage.',
    fr: 'Si cette entrée de journal ne vous appartient pas, renvoyez-la au triage.',
  },
  wrongTriageInfo: {
    de: 'Warum gehört er nicht in deinen Fachbereich?',
    en: "Why doesn't it belong to your department?",
    fr: "Pourquoi n'est-il pas à toi?",
  },
  backToTriage: {
    de: 'Zurück zur Triage',
    en: 'Back to triage',
    fr: 'Retour au triage',
  },
  allDepartments: {
    de: 'Alle Fachbereiche',
    en: 'All departments',
    fr: 'Tous les départements',
  },
  deliveryTime: {
    de: 'Übermittlungszeit',
    en: 'Delivery time',
    fr: 'Heure de livraison',
  },
  deliveredFrom: {
    de: 'Übermittelt durch',
    en: 'Delivered from',
    fr: 'Livré par',
  },
  input: {
    de: 'Eingang',
    en: 'Input',
    fr: 'Entrée',
  },
  output: {
    de: 'Ausgang',
    en: 'Output',
    fr: 'Sortie',
  },
  searchText: {
    de: 'Suche',
    en: 'Search',
    fr: 'Recherche',
  },
  noDepartment: {
    de: 'Kein Fachbereich',
    en: 'No department',
    fr: 'Pas de département',
  },
  select: {
    de: 'Auswählen',
    en: 'Select',
    fr: 'Sélectionner',
  },
  noInfo: {
    de: 'Keine Angabe',
    en: 'No information',
    fr: "Pas d'information",
  },
  view: {
    de: 'Darstellung',
    en: 'Appearance',
    fr: 'Apparence',
  },
  maps: {
    de: 'Karten',
    en: 'Maps',
    fr: 'Cartes',
  },
  responsibility: {
    de: 'Zuständigkeit',
    en: 'Responsibility',
    fr: 'Responsabilité',
  },
  status: {
    de: 'Status',
    en: 'Status',
    fr: 'Statut',
  },
  decision: {
    de: 'Entscheidung',
    en: 'Decision',
    fr: 'Décision',
  },
  messageSubject: {
    de: 'Betreff',
    en: 'Subject',
    fr: 'Sujet',
  },

  dateCreated: {
    de: 'Erstellungsdatum',
    en: 'Creation date',
    fr: 'Date de création',
  },
  time: {
    de: 'Zeit',
    en: 'Time',
    fr: 'Heure',
  },
  courier: {
    de: 'Übermittler',
    en: 'Messager',
    fr: 'Messager',
  },
  journalEntryTemplate: {
    de: 'Meldungs Vorlage',
    en: 'Message template',
    fr: 'Modèle de message',
  },
  errorLoadingJournalEntries: {
    de: 'Fehler beim laden der Journal Einträge.',
    en: 'Error loading journal entries.',
    fr: 'Erreur lors du chargement des entrées de journal.',
  },
  showCachedJournalEntries: {
    de: 'Es werden nur lokal gecachte Journal Einträge angezeigt.',
    en: 'Only locally cached journal entries are displayed.',
    fr: 'Seules les entrées de journal mises en cache localement sont affichées.',
  },
  localOnlyJournal: {
    de: 'Dieser Journal Eintrag existiert nur Lokal.',
    en: 'This journal entry only exists locally.',
    fr: 'Cette entrée de journal existe uniquement localement.',
  },
  localPatchJournal: {
    de: 'Dieser Journal Eintrag hat Änderungen die nur lokal sind.',
    en: 'This journal entry has changes that are only local.',
    fr: 'Cette entrée de journal comporte des modifications qui sont uniquement locales.',
  },
  edit: {
    de: 'Bearbeiten',
    en: 'Edit',
    fr: 'Modifier',
  },
  save: {
    de: 'Speichern',
    en: 'Save',
    fr: 'Enregistrer',
  },
  print: {
    de: 'Drucken',
    en: 'Print',
    fr: 'Imprimer',
  },
  createdAt: {
    de: 'Erstelldatum',
    en: 'Created at',
    fr: 'Date de création',
  },
  updatedAt: {
    de: 'Änderungsdatum',
    en: 'updated at',
    fr: 'mis à jour le',
  },
  yes: {
    de: 'Ja',
    en: 'Yes',
    fr: 'Oui',
  },
  no: {
    de: 'Nein',
    en: 'No',
    fr: 'Non',
  },
  showOnMap: {
    de: 'Auf Karte anzeigen',
    en: 'Show on map',
    fr: 'Afficher sur la carte',
  },
};
