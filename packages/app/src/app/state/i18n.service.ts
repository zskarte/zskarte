import { Injectable, inject } from '@angular/core';
import { SessionService } from '../session/session.service';
import { LOCALES, Sign } from '@zskarte/types';
import { DOCUMENTATION_TRANSLATIONS } from './translations/documentation.translations';
import { JOURNAL_TRANSLATIONS } from './translations/journal.translations';
import { MAP_TRANSLATIONS } from './translations/map.translations';

/**
 * Translation Management Guide - ZSKarte Application
 *
 * Supports: German (de), English (en), French (fr)
 *
 * ADDING NEW TRANSLATIONS:
 *
 * 1. Choose the RIGHT location:
 *    • CORE (this file): Cross-domain, common UI, auth, basic actions
 *    • JOURNAL: Message workflow, triage, departments, communication
 *    • DOCUMENTATION: Help text, guides, tutorials
 *    • MAP: Map tools, map interactions, sign selection
 *    • <Any new module needed>
 *
 * 2. Use this format:
 *    yourKey: {
 *      de: 'German text',
 *      en: 'English text',
 *      fr: 'French text',
 *    }
 * *
 * KEEP TRANSLATIONS MODULAR - Don't dump everything in core!
 */
@Injectable({
  providedIn: 'root',
})
export class I18NService {
  private _session = inject(SessionService);

  private static TRANSLATIONS = {
    local: {
      de: 'Lokal',
      en: 'Local',
      fr: 'Local',
    },
    de: {
      de: 'Deutsch',
      en: 'German',
      fr: 'Allemand',
    },
    fr: {
      de: 'Französisch',
      en: 'French',
      fr: 'Français',
    },
    en: {
      de: 'Englisch',
      en: 'English',
      fr: 'Anglais',
    },
    language: {
      de: 'Sprache',
      en: 'Language',
      fr: 'Langue',
    },
    symbol: {
      de: 'Signatur',
      en: 'Symbol',
      fr: 'Symbole',
    },
    or: {
      de: 'oder',
      en: 'or',
      fr: 'ou',
    },
    name: {
      de: 'Name',
      en: 'Name',
      fr: 'Nom',
    },
    youAreOffline: {
      de: 'Sie sind offline',
      en: 'You are offline',
      fr: 'Vous êtes hors ligne',
    },
    myName: {
      de: 'Mein Name',
      en: 'My name',
      fr: 'Mon nom',
    },
    shareLocation: {
      de: 'Standort teilen',
      en: 'Share location',
      fr: 'Partager la position',
    },
    online: {
      de: 'Online',
      en: 'Online',
      fr: 'En ligne',
    },
    distance: {
      de: 'Distanz',
      en: 'Distance',
      fr: 'Distance',
    },
    area: {
      de: 'Fläche',
      en: 'Area',
      fr: 'Région',
    },
    password: {
      de: 'Passwort',
      en: 'Password',
      fr: 'Mot de passe',
    },
    wrongPassword: {
      de: 'Ungültiges Passwort',
      en: 'Wrong password',
      fr: 'Mauvais mot de passe',
    },
    eventname: {
      de: 'Ereignis',
      en: 'Happening',
      fr: "L'événement",
    },
    sessionOverdue: {
      de: 'Abgelaufen',
      en: 'Expired',
      fr: 'Expiré',
    },
    text: {
      de: 'Text',
      en: 'Text',
      fr: 'Texte',
    },
    draw: {
      de: 'Zeichnen',
      en: 'Draw',
      fr: 'Dessiner',
    },
    copy: {
      de: 'Kopie',
      en: 'Copy',
      fr: 'Copie',
    },
    editMap: {
      de: 'Ereignis bearbeiten',
      en: 'Edit event',
      fr: 'Modifier événement',
    },
    withHistory: {
      de: 'Mit History',
      en: 'With history',
      fr: 'Avec historique',
    },
    withoutHistory: {
      de: 'Ohne History',
      en: 'Without history',
      fr: 'Sans historique',
    },
    cancel: {
      de: 'Abbrechen',
      en: 'Cancel',
      fr: 'Annuler',
    },
    confirm: {
      de: 'Bestätigen',
      en: 'Confirm',
      fr: 'Confirmer',
    },
    download: {
      de: 'Herunterladen',
      en: 'Download',
      fr: 'Télécharger',
    },
    upload: {
      de: 'Hochladen',
      en: 'Upload',
      fr: 'Uploader',
    },
    exportOperation: {
      de: 'Ereignis exportieren',
      en: 'Export event',
      fr: 'Exporter événement',
    },
    archiveOperation: {
      de: 'Ereignis Archivieren',
      en: 'Archive event',
      fr: 'Archiver événement',
    },
    unarchiveOperation: {
      de: 'Ereignis wiederherstellen',
      en: 'Unarchive event',
      fr: 'Désarchiver événement',
    },
    deleteOperation: {
      de: 'Ereignis löschen',
      en: 'Delete event',
      fr: 'Supprimer événement',
    },
    deleteOperationConfirm: {
      de: 'Möchten Sie dieses Ereignis wirklich unwiderruflich löschen?',
      en: 'Do you really want to permanently delete this event?',
      fr: 'Voulez-vous vraiment supprimer définitivement cet événement ?',
    },
    lastModified: {
      de: 'Zuletzt geändert:',
      en: 'Last modified:',
      fr: 'Dernière modification:',
    },
    showArchivedScenarios: {
      de: 'Archivierte Ereignise anzeigen',
      en: 'View archived events',
      fr: 'Afficher les événements archivés',
    },
    showActiveScenarios: {
      de: 'Aktive Ereignise anzeigen',
      en: 'Show active events',
      fr: 'Afficher les événements actifs',
    },
    downloadMapCSV: {
      de: 'Als CSV exportieren',
      en: 'Export as CSV',
      fr: 'Exporter au format CSV',
    },
    filter: {
      de: 'Filter',
      en: 'Filter',
      fr: 'Filtre',
    },
    filterByCategory: {
      de: 'Nach Kategorie filtern',
      en: 'Filter by category',
      fr: 'Filtrer par catégorie',
    },
    noFilter: {
      de: 'Kein Filter',
      en: 'No filter',
      fr: 'Pas de filtre',
    },
    damage: {
      de: 'Beschädigung',
      en: 'Damage',
      fr: 'Dommage',
    },
    danger: {
      de: 'Gefahr',
      en: 'Danger',
      fr: 'Danger',
    },
    effects: {
      de: 'Auswirkungen',
      en: 'Effects',
      fr: 'Effets',
    },
    resources: {
      de: 'Einsatzmittel',
      en: 'Resources',
      fr: 'Moyens',
    },
    endHistoryMode: {
      de: 'History-Modus beenden',
      en: 'End history mode',
      fr: 'Quitter le mode historique',
    },
    loadFromFile: {
      de: 'Von Datei laden',
      en: 'Load from file',
      fr: 'Charger à partir du fichier',
    },
    createdBy: {
      de: 'Erstellt von',
      en: 'Created by',
      fr: 'Créé par',
    },
    import: {
      de: 'Importieren',
      en: 'Import',
      fr: 'Importer',
    },
    rewokeShareLinkFailedMessage: {
      de: 'Fehler beim löschen des Links.',
      en: 'Error while deleting the link.',
      fr: 'Erreur lors de la suppression du lien.',
    },
    rotate: {
      de: 'Rotieren',
      en: 'Rotate',
      fr: 'Tourner',
    },
    opacity: {
      de: 'Deckkraft',
      en: 'Opacity',
      fr: 'Opacité',
    },
    defaultValues: {
      de: 'Standardwerte zurücksetzen',
      en: 'Reset Default Values',
      fr: 'Valeurs par défaut',
    },
    solidLine: {
      de: 'Durchgezogen',
      en: 'Solid',
      fr: 'Continue',
    },
    dottedLine: {
      de: 'Gepunktet',
      en: 'Dotted',
      fr: 'Pointillés',
    },
    dashedLine: {
      de: 'Gestrichelt',
      en: 'Dashed',
      fr: 'Tirets',
    },
    thinDashedLine: {
      de: 'Gestrichelt (Dünn)',
      en: 'Dashed (thin)',
      fr: 'Tirets (fins)',
    },
    lineWidth: {
      de: 'Linien-Dicke',
      en: 'Line width',
      fr: 'Largeur de ligne',
    },
    delete: {
      de: 'Löschen',
      en: 'Delete',
      fr: 'Effacer',
    },
    ok: {
      de: 'OK',
      en: 'OK',
      fr: 'OK',
    },
    yourText: {
      de: 'Ihr Text',
      en: 'Your text',
      fr: 'Votre texte',
    },
    viewArchivedOperation: {
      de: 'Dies ist ein archiviertes Ereignis',
      en: 'Ceci est un événement archivé',
      fr: 'Ceci est un événement archivé',
    },
    history: {
      de: 'History- / Lese-Modus',
      en: 'History / read mode',
      fr: 'Mode historique / lecture',
    },
    toastExpertView: {
      de: 'Experten Ansicht aktiviert',
      en: 'Expert view activated',
      fr: "Point de vue d'expert activé",
    },
    toastDefaultView: {
      de: 'Standard Ansicht aktiviert',
      en: 'Default view activated',
      fr: 'Vue générale activée',
    },
    color: {
      de: 'Farbe',
      en: 'Color',
      fr: 'Couleur',
    },
    colorPickerMode: {
      de: 'Weitere Farben',
      en: 'More colors',
      fr: 'Plus de couleurs',
    },
    drawHole: {
      de: 'Loch zeichnen',
      en: 'Draw a hole',
      fr: 'Dessiner un trou',
    },
    moveToTop: {
      de: 'In den Vordergrund',
      en: 'Send to front',
      fr: 'Passer au premier plan',
    },
    moveToBottom: {
      de: 'In den Hintergrund',
      en: 'Send to back',
      fr: 'Passer au fond',
    },
    chooseGroupingArea: {
      de: 'Zu gruppierende Fläche auswählen',
      en: 'Choose the element to group with',
      fr: 'Sélectionnez la zone à grouper',
    },
    ungroup: {
      de: 'Gruppierung aufheben',
      en: 'Ungroup',
      fr: 'Dégrouper',
    },
    group: {
      de: 'Gruppieren',
      en: 'Group',
      fr: 'Grouper',
    },
    cancelGrouping: {
      de: 'Gruppieren abbrechen',
      en: 'Cancel grouping',
      fr: 'Annuler le groupement',
    },
    sessionCreatorTitle: {
      de: 'Willkommen bei Zivilschutz-Karte!',
      en: 'Welcome to Zivilschutz-Karte!',
      fr: 'Bienvenue à Zivilschutz-Karte!',
    },
    sessionCreatorInstructions: {
      de: 'Bitte beachten Sie: Die Daten werden nur auf Ihrem Browser gehalten - sie werden nicht mit einem Server geteilt! Falls Sie die Karte mit anderen zusätzlich sichern oder teilen möchten, können Sie diese exportieren (und erneut importieren).<br/><br/> <strong>Wichtig</strong>: Wenn Sie Ihre Browserdaten löschen, so werden auch die gespeicherten Karten entfernt!',
      en: 'Please note: The data is only kept in your browser - it is not shared with a server! If you would like to additionally save or share the map with others, you can export (and re-import) the map.<br/><br/> <strong>Important</strong>: If you delete your browser data, the saved maps will also be removed',
      fr: "Remarque : les données sont uniquement conservées sur votre navigateur - elles ne sont pas partagées avec un serveur ! Si vous souhaitez enregistrer ou partager la carte avec d'autres personnes, vous pouvez exporter (et réimporter) la carte. <br/><br/><strong>Important</strong>: Si vous supprimez les données de votre navigateur, les cartes enregistrées seront également supprimées.",
    },
    zso: {
      de: 'ZSO',
      en: 'CPO',
      fr: 'PCi',
    },
    sessionLoaderInstructions: {
      de: 'Bitte beachten Sie: Wenn Sie eine Karte laden wird die bestehende nicht gelöscht - Sie können diese jederzeit hier wieder laden.',
      en: 'Please note: When you load a map, the existing map is not deleted - you can reload it here at any time.',
      fr: "Remarque : lorsque vous chargez une carte, la carte existante n'est pas supprimée - vous pouvez la recharger ici à tout moment.",
    },
    importSessionInstructions: {
      de: 'Verwenden Sie eine <strong>.zsjson</strong> Datei um eine vollständige Karte zu importieren.',
      en: 'Use a <strong>.zsjson</strong> file to import a complete map.',
      fr: 'Utilisez un fichier <strong>.zsjson</strong> pour importer une carte complète.',
    },
    confirmImportDrawing: {
      de: 'Wollen Sie die entsprechende Zeichnung wirklich importieren? Die aktuelle Zeichnung wird dabei ersetzt, die History bleibt aber bestehen!',
      en: 'Do you really want to import this drawing? The current drawing will be replaced - the history of the map will remain though!',
      fr: "Voulez-vous vraiment importer le dessin correspondant ? Le dessin actuel sera remplacé, mais l'histoire restera !",
    },
    confirmImportDrawingNoReplace: {
      de: 'Wollen Sie die entsprechende Zeichnung wirklich importieren? Die aktuelle Zeichnung wird dabei mit den enthaltenen Elementen ergänzt!',
      en: 'Do you really want to import the corresponding drawing? The current drawing will be extended with the contained elements!',
      fr: 'Voulez-vous vraiment importer le dessin correspondant ? Le dessin actuel sera étendu avec les éléments contenus !',
    },
    map: {
      de: 'Karte',
      en: 'Map',
      fr: 'Carte',
    },
    legendNotLoaded: {
      de: 'Die Legende für diese Karte konnte leider nicht geladen werden',
      en: 'The legend for this map could not be loaded',
      fr: "La légende de cette carte n'a pas pu être chargée",
    },
    fontSize: {
      de: 'Schriftgrösse',
      en: 'Font size',
      fr: 'Taille de police',
    },
    yourTag: {
      de: 'Ihr Tag',
      en: 'Your tag',
      fr: 'Votre tag',
    },
    tagState: {
      de: 'Taggen',
      en: 'Tag',
      fr: 'Taguer',
    },
    filterHistory: {
      de: 'Gefiltert (nur markierte / alle 30 min)',
      en: 'Filtered (tagged / every 30 mins only)',
      fr: 'Filtré (uniquement marqué / toutes les 30 min)',
    },
    removeTag: {
      de: 'Tag entfernen',
      en: 'Remove tag',
      fr: 'Supprimer le tag',
    },
    fillPattern: {
      de: 'Muster',
      en: 'Pattern',
      fr: 'Modèle',
    },
    filled: {
      de: 'Gefüllt',
      en: 'Filled',
      fr: 'Rempli',
    },
    hatched: {
      de: 'Schraffiert',
      en: 'Hatched',
      fr: 'Hachuré',
    },
    crossed: {
      de: 'Gekreuzt',
      en: 'Crossed',
      fr: 'Croisé',
    },
    spacing: {
      de: 'Abstand',
      en: 'Spacing',
      fr: 'Espacement',
    },
    angle: {
      de: 'Winkel',
      en: 'Angle',
      fr: 'Angle',
    },
    type: {
      de: 'Typ',
      en: 'Type',
      fr: 'Type',
    },
    font: {
      de: 'Schrift',
      en: 'Font',
      fr: 'Police',
    },
    width: {
      de: 'Dicke',
      en: 'Width',
      fr: 'Largeur',
    },
    functions: {
      de: 'Funktionen',
      en: 'Functions',
      fr: 'Fonctions',
    },
    hideSymbol: {
      de: 'Signatur auf Karte verstecken',
      en: 'Hide symbol on map',
      fr: 'Cacher le symbole sur la carte',
    },
    lockFeature: {
      de: 'Position fixieren',
      en: 'Fix position',
      fr: 'Fixer la position',
    },
    labelShow: {
      de: 'Namen anzeigen',
      en: 'Show name',
      fr: 'Afficher le nom',
    },
    replaceSymbol: {
      de: 'Ersetzen',
      en: 'Replace',
      fr: 'Remplacer',
    },
    selectSymbol: {
      de: 'Auswählen',
      en: 'Select',
      fr: 'Sélectionner',
    },
    removeSymbol: {
      de: 'Entfernen',
      en: 'Remove',
      fr: 'Supprimer',
    },
    symbolOffset: {
      de: 'Versatz',
      en: 'Offset',
      fr: 'Décalage',
    },
    symbolOffsetEnd: {
      de: 'Versatz Ende',
      en: 'Offset End',
      fr: 'Décalage fin',
    },
    endHasDifferentOffset: {
      de: 'Ende hat einen anderen Versatz',
      en: 'End has a different offset',
      fr: 'La fin a un décalage différent',
    },
    symbolSize: {
      de: 'Grösse',
      en: 'Size',
      fr: 'Taille',
    },
    addSymbol: {
      de: 'Hinzufügen',
      en: 'Add',
      fr: 'Ajouter',
    },
    deleteLastPointOnFeature: {
      de: 'Diese Form besteht aus dem Minimum nötiger Punkte.',
      en: 'This shape consists of a minimal number of points.',
      fr: 'Cette forme consiste en un nombre minimum de points.',
    },
    shareWithOtherMaps: {
      de: 'Mit anderen Karten teilen',
      en: 'Share with other maps',
      fr: "Partager avec d'autres cartes",
    },
    keepOriginal: {
      de: 'Original-Bild behalten (grössenreduziert)',
      en: 'Keep original image (reduced in size)',
      fr: "Conserver l'image originale (taille réduite)",
    },
    keepOriginalWarning: {
      de: 'Vorsicht: Die Einbettung von zahlreichen Original-Bildern kann die Performanz der Applikation aufgrund der zusätzlichen Datenmenge einschränken!',
      en: 'Caution: The embedding of numerous original images can limit the performance of the application due to the additional data volume!',
      fr: "Attention : l'intégration de nombreuses images originales peut limiter les performances de l'application en raison du volume de données supplémentaires !",
    },
    german: {
      de: 'Deutsch',
      en: 'German',
      fr: 'Allemand',
    },
    french: {
      de: 'Französisch',
      en: 'French',
      fr: 'Français',
    },
    english: {
      de: 'Englisch',
      en: 'English',
      fr: 'Anglais',
    },
    deleteSymbolConfirm: {
      de: 'Wollen Sie diese Signatur wirklich löschen?',
      en: 'Do you really want to delete this symbol?',
      fr: 'Voulez-vous vraiment supprimer ce symbole ?',
    },
    selectFormat: {
      de: 'Format wählen',
      en: 'Select format',
      fr: 'Sélectionnez le format',
    },
    numerical: {
      de: 'numerisch',
      en: 'numerical',
      fr: 'numérique',
    },
    replaceByImport: {
      de: 'Existierende Elemente mit Import ersetzen',
      en: 'Replace existing elements with import',
      fr: "Remplacer les éléments existants par l'import",
    },
    importFromFile: {
      de: 'Von Datei',
      en: 'From File',
      fr: 'Du fichier',
    },
    importFromGeoadmin: {
      de: 'Von Geoadmin',
      en: 'From Geoadmin',
      fr: 'De Geoadmin',
    },
    importFromGeoadminDescription: {
      de: 'Um Formen von Geoadmin importieren zu können, benötigen Sie den Layer-Namen (z.B. "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill") sowie einen Suchschlüssel und dessen Wert, nach welchen die Metadaten gefiltert werden (z.B. "kanton" als Schlüssel und "FR" als Wert um alle Gemeinden von Fribourg zu importieren)',
      en: 'To import forms of geoadmin, you need the layer name (e.g. "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill") as well as a search key and its value, according to which the metadata will be filtered (e.g. "kanton" as key and "FR" as value to import all communes of Fribourg)',
      fr: 'Pour importer des formes de geoadmin, vous avez besoin du nom de la couche (par exemple "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill") ainsi que d\'une clé de recherche et de sa valeur, selon laquelle les métadonnées seront filtrées (par exemple "kanton" comme clé et "FR" comme valeur pour importer toutes les communes de Fribourg)',
    },
    geoadminImportLayer: {
      de: 'Layer',
      en: 'Layer',
      fr: 'Couche',
    },
    geoadminImportKey: {
      de: 'Such-Schlüssel',
      en: 'Search key',
      fr: 'Clé de recherche',
    },
    geoadminImportValue: {
      de: 'Wert',
      en: 'Value',
      fr: 'Valeur',
    },
    currentState: {
      de: 'Aktuell',
      en: 'Most recent',
      fr: 'Actuel',
    },
    description: {
      de: 'Beschreibung',
      en: 'Description',
      fr: 'Description',
    },
    arrow: {
      de: 'Pfeil',
      en: 'Arrow',
      fr: 'Flèche',
    },
    none: {
      de: 'Keiner',
      en: 'None',
      fr: 'Aucun',
    },
    thin: {
      de: 'Dünn',
      en: 'Thin',
      fr: 'Fine',
    },
    paperFormat: {
      de: 'Papierformat',
      en: 'paper format',
      fr: 'Format papier',
    },
    orientation: {
      de: 'Orientierung',
      en: 'orientation',
      fr: 'orientation',
    },
    landscape: {
      de: 'Querformat',
      en: 'landscape',
      fr: 'format paysage',
    },
    portrait: {
      de: 'Hochformat',
      en: 'portrait',
      fr: 'format portrait',
    },
    printMargin: {
      de: 'Druckrand',
      en: 'Print margin',
      fr: 'Marge imprimante',
    },
    resolution: {
      de: 'Auflösung',
      en: 'resolution',
      fr: 'résolution',
    },
    autoScale: {
      de: 'Automatische Skalierung',
      en: 'auto scale',
      fr: 'échelle automatique',
    },
    printScale: {
      de: 'Massstab drucken',
      en: 'Print scale',
      fr: "imprimer l'échelle",
    },
    hideAllInfos: {
      de: '​alle Signaturen und Informationen ausblenden',
      en: 'hide all signatures and infos',
      fr: 'masquer toutes les signatures et informations',
    },
    qrCode: {
      de: 'QR-Code',
      en: 'QR code',
      fr: 'code QR',
    },
    addQRCode: {
      de: 'QR-Code hinzufügen',
      en: 'Add QR code',
      fr: 'Ajouter un code QR',
    },
    withShare: {
      de: 'mit Freigabe',
      en: 'with share',
      fr: 'avec partage',
    },
    generatePdf: {
      de: 'PDF generieren',
      en: 'generate PDF',
      fr: 'générer le PDF',
    },
    deactivateWebGL: {
      de: 'Der angeforderte Export ist zu gross für den WebGL-Renderer. Seite mit deaktivierter WebGL-Unterstützung neu laden?',
      en: 'The requested export is too large for the WebGL renderer. Reload the page with WebGL support disabled?',
      fr: "L'exportation demandée est trop volumineuse pour le moteur de rendu WebGL. Recharger la page avec le support WebGL désactivé?",
    },
    protocol: {
      de: 'Protokoll',
      en: 'Protocol',
      fr: 'Protocole',
    },
    protocolTable: {
      de: 'Tabelle anzeigen',
      en: 'Show Table',
      fr: 'Afficher Tableau',
    },
    saveAsExcel: {
      de: 'Als Excel exportieren',
      en: 'Export as Excel',
      fr: 'Exporter en Excel',
    },
    images: {
      de: 'Bilder',
      en: 'Images',
      fr: 'Images',
    },
    search: {
      de: 'Signatur suchen',
      en: 'Search symbol',
      fr: 'Rechercher un symbole',
    },
    unknown: {
      de: 'Unbekannt',
      en: 'Unknown',
      fr: 'Inconnu',
    },
    help: {
      de: 'Hilfe',
      en: 'Help',
      fr: 'Aide',
    },
    keyboardShortcutsTitle: {
      de: 'Tastenbelegungen',
      en: 'Keyboard shortcuts',
      fr: 'Attributions clés',
    },
    close: {
      de: 'Schliessen',
      en: 'Close',
      fr: 'Conclure',
    },
    keyboardShortcuts: {
      de: 'TBD',
      en: 'TBD',
      fr: 'TBD',
    },
    favoriteLayers: {
      de: 'Favoriten',
      en: 'Favorites',
      fr: 'Favoris',
    },
    noMoreFavorites: {
      de: 'Keine Favoriten mehr vorhanden',
      en: 'No more favorites available',
      fr: 'Pas de favoris',
    },
    freeHand: {
      de: 'Freihand',
      en: 'Free hand',
      fr: 'TBD',
    },
    signPlace: {
      de: 'Einrichtungen',
      en: 'Facilities',
      fr: 'Équipement',
    },
    signFks: {
      de: 'Feuerwehr',
      en: 'Fire department',
      fr: 'Pompiers',
    },
    signAction: {
      de: 'Aktionen',
      en: 'Actions',
      fr: 'Actions',
    },
    signDamage: {
      de: 'Schäden',
      en: 'Damage',
      fr: 'Damage',
    },
    signIncident: {
      de: 'Ereignis',
      en: 'Incident',
      fr: 'Incident',
    },
    signFormation: {
      de: 'Formationen',
      en: 'Formations',
      fr: 'Formations',
    },
    signEffect: {
      de: 'Auswirkungen',
      en: 'Effects',
      fr: 'Effets',
    },
    signDanger: {
      de: 'Gefahren',
      en: 'Dangers',
      fr: 'Dangers',
    },
    signLabel: {
      de: 'Markierungen',
      en: 'Labels',
      fr: 'Marquages',
    },
    allCategories: {
      de: 'Alle Kategorien',
      en: 'All categories',
      fr: 'Toutes catégories',
    },
    categories: {
      de: 'Kategorien',
      en: 'Categories',
      fr: 'Catégories',
    },
    navigateOperations: {
      de: 'Zurück zu Ereignisse',
      en: 'Back to events',
      fr: 'Retour aux événements',
    },
    expand: {
      de: 'Ansicht wechseln',
      en: 'Change view',
      fr: 'Aligner la vue',
    },
    filters: {
      de: 'Filter',
      en: 'Filters',
      fr: 'Filtre',
    },
    undo: {
      de: 'Rückgängig',
      en: 'Undo',
      fr: 'Annuler',
    },
    redo: {
      de: 'Wiederherstellen',
      en: 'Redo',
      fr: 'Rétablir',
    },
    connections: {
      de: 'Verbindungen',
      en: 'Connections',
      fr: 'Connexions',
    },
    hideShow: {
      de: 'anzeigen/verstecken',
      en: 'show/hide',
      fr: 'afficher/cacher',
    },
    csvGroupArea: {
      de: 'Bereich',
      en: 'Area',
      fr: 'Zone',
    },
    tooltipSession: {
      de: 'Gültigkeitsdauer Ihrer Gastsitzung',
      en: 'Period of validity of your guest session',
      fr: 'Période de validité de votre session',
    },
    toastHistory: {
      de: 'Lesemodus aktiviert',
      en: 'Reading mode enabled',
      fr: 'Mode lecture activé',
    },
    toastDrawing: {
      de: 'Zeichnenmodus aktiviert',
      en: 'Drawing mode enabled',
      fr: 'Mode dessin activé',
    },
    recentlyUsedSigns: {
      de: 'Kürzlich verwendete Signaturen',
      en: 'Recently used signatures',
      fr: 'Signatures récemment utilisées',
    },
    date: {
      de: 'Datum',
      en: 'Date',
      fr: 'Date',
    },
    label: {
      de: 'Beschriftung',
      en: 'Label',
      fr: 'Etiquette',
    },
    deletionNotification: {
      de: 'Die erfassten Daten werden jeden Abend um 00:00 Uhr gelöscht. Die Daten sind nach diesem Vorgang nicht mehr vorhanden.',
      en: 'The recorded data is deleted every evening at 00:00. The data is no longer available after this process.',
      fr: 'Les données saisies sont effacées chaque soir à 00:00. Les données ne sont plus disponibles après ce processus.',
    },
    guestLogin: {
      de: 'Als Gast fortfahren',
      en: 'Continue as guest',
      fr: 'Connexion en tant que visiteur',
    },
    codeLogin: {
      de: 'Login mit Code',
      en: 'Login with code',
      fr: 'Connexion avec code',
    },
    workLocal: {
      de: 'Offline/lokal arbeiten',
      en: 'Work offline/locally',
      fr: 'Travailler hors ligne/localement',
    },
    localNotification: {
      de: 'Die erfassten Daten sind nur im Browser gespeichert, bitte exportiert sie um sie zu sichern.',
      en: 'The collected data is only stored in the browser, please export it to save it.',
      fr: 'Les données collectées sont uniquement enregistrées dans le navigateur, veuillez les exporter pour les enregistrer.',
    },
    addSignatureManually: {
      de: 'Bitte fügen Sie die Signatur manuell ein',
      en: 'Please add the signature manually',
      fr: 'Veuillez ajouter la signature manuellement',
    },
    share: {
      de: 'Freigeben',
      en: 'Share',
      fr: 'Partager',
    },
    expiresOn: {
      de: 'Ablaufdatum',
      en: 'Expires on',
      fr: 'Date dexpiration',
    },
    read: {
      de: 'Lesen',
      en: 'Read',
      fr: 'Lire',
    },
    write: {
      de: 'Schreiben',
      en: 'Write',
      fr: 'Ecrire',
    },
    generateMultiUseShareLink: {
      de: 'Mehrfach-Link generieren',
      en: 'Generate share link',
      fr: 'Copier le lien de partage',
    },
    generateSingleUseShareLink: {
      de: 'Einweg-Link generieren',
      en: 'Generate one way link',
      fr: 'Copier le qr code de partage',
    },
    revokeAccess: {
      de: 'Freigabelinks verwalten',
      en: 'Revoke share link',
      fr: 'Arranger les liens de partage',
    },
    logout: {
      de: 'Logout',
      en: 'Logout',
      fr: 'Logout',
    },
    copiedToClipboard: {
      de: 'In Zwischenablage kopiert',
      en: 'Copied to clipboard',
      fr: 'Copié dans le presse-papiers',
    },

    reportNumber: {
      de: 'Meldenummer',
      en: 'Report number',
      fr: 'Numéro de rapport',
    },
    snapshotTimestamp: {
      de: 'Sicherungszeitpunkt',
      en: 'Backup time',
      fr: 'Date de sauvegarde',
    },
    noSnapshots: {
      de: 'Keine Sicherungen gefunden',
      en: 'No backups found',
      fr: 'Aucune sauvegarde trouvée',
    },
    toastSnapshotApplied: {
      de: 'Sicherung angewendet',
      en: 'Backup applied',
      fr: 'Sauvegarde appliqué',
    },
    noSignature: {
      de: 'Ohne Signatur',
      en: 'Without signature',
      fr: 'Sans signature',
    },
    back: {
      de: 'Zurück',
      en: 'Back',
      fr: 'Retour',
    },
    newScenario: {
      de: 'Neues Ereignis',
      en: 'New Scenario',
      fr: 'Nouvel Événement',
    },
    importScenario: {
      de: 'Ereignis importieren',
      en: 'Import Scenario',
      fr: 'Importer événement',
    },
    localOperation: {
      de: 'Ereignis nur lokal verfügbar',
      en: 'Scenario available locally only',
      fr: 'Événement disponible localement uniquement',
    },
    featureClustering: {
      de: 'Symbole Gruppieren',
      en: 'Sign clustering',
      fr: 'Regroupement de formes',
    },
    eventState: {
      de: 'Situationslage',
      en: 'Event state',
      fr: 'Situation',
    },
    affectedPersons: {
      de: 'Betroffene Personen',
      en: 'Affected Persons',
      fr: 'Persones affectés',
    },
    newLayerType: {
      de: 'Wählen sie den Ebenentyp',
      en: 'Choose layer type',
      fr: 'Choisissez le type de calque',
    },
    persistLayers: {
      de: 'Ebenen auf Ereignis speichern',
      en: 'Save layers to event',
      fr: "Enregistrer les couches dans l'événement",
    },
    toastPersistLayers: {
      de: 'Ebenen auf Ereignis gespeichert',
      en: 'Layers saved on event',
      fr: 'Couches enregistrées sur événement',
    },
    allSources: {
      de: 'Alle Quellen',
      en: 'all sources',
      fr: 'toutes les sources',
    },
    globalMapLayerTitleSuffix: {
      de: 'geteilt',
      en: 'shared',
      fr: 'partagée',
    },
    searchableLayer: {
      de: 'offline durchsuchbar',
      en: 'offline searchable',
      fr: 'recherche hors ligne',
    },
    editWmsSources: {
      de: 'WMS/WMTS Quellen Bearbeiten',
      en: 'Edit WMS/WMTS Sources',
      fr: 'Modifier les sources WMS/WMTS',
    },
    addLayerSource: {
      de: 'Neue Quelle Hinzufügen',
      en: 'Add new source',
      fr: 'Ajouter une nouvelle source',
    },
    selectLayerSource: {
      de: 'Quelle auswählen',
      en: 'select source',
      fr: 'sélectionner la source',
    },
    publicSource: {
      de: 'Öffentliche Quelle',
      en: 'public source',
      fr: 'source publique',
    },
    publicSourceInfo: {
      de: 'Quelle darf von anderen Organisationen verwendet werden.',
      en: 'Source may be used by other organizations.',
      fr: "La source peut être utilisée par d'autres organisations.",
    },
    sourceAttribution: {
      de: 'Quellenangabe',
      en: 'source attribution',
      fr: 'attribution de la source',
    },
    sourceAttributionInfo: {
      de: 'Hier gepflegte Quellenangaben überschreiben die Angaben aus der Ebenen Quelle.',
      en: 'Source attribution maintained here overwrites the information from the layer source.',
      fr: 'Les attribution de la source conservées ici écrasent les informations de la source du couche.',
    },
    removeSource: {
      de: 'entfernen',
      en: 'remove',
      fr: 'supprimer',
    },
    addSource: {
      de: 'Hinzufügen',
      en: 'Add',
      fr: 'Ajouter',
    },
    wmsLayerSettings: {
      de: 'Einstellungen der WMS-Ebene',
      en: 'WMS layer settings',
      fr: 'Paramètres de calque WMS',
    },
    wmsLayerName: {
      de: 'Ebenenname',
      en: 'layer name',
      fr: 'nom du calque',
    },
    wmsLayerRenderType: {
      de: 'Ebenen Generierung',
      en: 'Layer generation',
      fr: 'Génération de calque',
    },
    wmsLayerRenderTypeTiled: {
      de: 'gekachelt',
      en: 'tiled',
      fr: 'carrelé',
    },
    wmsLayerRenderTypeFullImage: {
      de: 'Vollbild',
      en: 'fullimage',
      fr: 'image complète',
    },
    hideSubLayers: {
      de: 'Unterebenen ausblenden',
      en: 'hide sub layers',
      fr: 'masquer les sous-calque',
    },
    wmsLayerDrawingMode: {
      de: 'Ebenen-Zeichenmodus',
      en: 'Layers drawing mode',
      fr: 'Mode de dessin des calques',
    },
    mergedLayers: {
      de: 'zusammengeführte Ebenen',
      en: 'merged layers',
      fr: 'calques fusionnés',
    },
    separatedLevels: {
      de: 'aufgetrennte Ebenen',
      en: 'separated layers',
      fr: 'calques séparés',
    },
    tileFormat: {
      de: 'Inhaltstyp',
      en: 'content type',
      fr: 'type de contenu',
    },
    tileSize: {
      de: 'Kachelgrösse',
      en: 'Tile size',
      fr: 'Dimension des carreaux',
    },
    MinScaleDenominator: {
      de: 'Min. Skalennenner',
      en: 'Min scale denominator',
      fr: "Dénominateur d'échelle minimum",
    },
    MaxScaleDenominator: {
      de: 'Max. Skalennenner',
      en: 'Max scale denominator',
      fr: "Dénominateur d'échelle maximum",
    },
    geojsonLayerSettings: {
      de: 'Einstellungen der GeoJSON/CSV-Ebene',
      en: 'GeoJSON/CSV layer settings',
      fr: 'Paramètres de calque GeoJSON/CSV',
    },
    delimiter: {
      de: 'Trennzeichen',
      en: 'delimiter',
      fr: 'délimiteur',
    },
    fieldX: {
      de: 'Feldname der X-Koordinate',
      en: 'field name of the X coordinate ',
      fr: 'nom du champ de la coordonnée X',
    },
    fieldY: {
      de: 'Feldname der Y-Koordinate',
      en: 'field name of the Y coordinate ',
      fr: 'nom du champ de la coordonnée Y',
    },
    dataProjection: {
      de: 'Konfigurationscode für die Datenprojektion',
      en: 'Data projection configuration code',
      fr: 'Code de configuration de la projection de données',
    },
    filterRegExPattern: {
      de: 'RegEx Muster für Daten Filter',
      en: 'RegEx pattern for data filters',
      fr: 'Modèle RegEx pour les filtres de données',
    },
    filterRegExPatternInfo: {
      de: 'Mehrere Werte als Wertegruppe zulassen, z.B.',
      en: 'Allow multiple values be value group e.g.',
      fr: 'Autoriser plusieurs valeurs à être un groupe de valeurs, par ex.',
    },
    filterRegExPatternInfo2: {
      de: 'Werte durch negatives Lookbehind ausschliessen, z.B.',
      en: 'Exclude values by negative lookbehind e.g.',
      fr: 'Exclure les valeurs par lookbehind négatif, par ex.',
    },
    Field: {
      de: 'Feld',
      en: 'Field',
      fr: 'Champ',
    },
    extent: {
      de: 'Gültiger Bereich',
      en: 'Valid area extent',
      fr: 'Étendue de zone valide',
    },
    limitExtent: {
      de: 'Beschränken Sie die Daten auf einen bestimmten Bereich.',
      en: 'Limit the data to a specific area.',
      fr: 'Limitez les données à une zone spécifique.',
    },
    extentInfo: {
      de: 'Der Bereich muss in Datenprojektion angegeben werden. Wenn kein Bereich definiert ist, wird es auf die Schweiz beschränkt.',
      en: 'The area must be specified in dataProjection. If no area is defined, it will be limited to Switzerland.',
      fr: "La zone doit être spécifiée dans projection de données. Si aucune zone n'est définie, le champ d'application est limité à la Suisse.",
    },
    styleSourceType: {
      de: 'Stilquellentyp',
      en: 'Style source Type',
      fr: 'Type de source de style',
    },
    styleSourceTypeUrl: {
      de: 'URL',
      en: 'URL',
      fr: 'Url',
    },
    styleSourceTypeText: {
      de: 'Text',
      en: 'Text',
      fr: 'Texte',
    },
    styleFormat: {
      de: 'Stilformat',
      en: 'Style format',
      fr: 'Format des styles',
    },
    styleFormatMapBox: {
      de: 'MapBox GL Style',
      en: 'MapBox GL Style',
      fr: 'MapBox GL Style',
    },
    styleFormatOlFlat: {
      de: 'OpenLayers Flat',
      en: 'OpenLayers Flat',
      fr: 'OpenLayers Flat',
    },
    styleFormatSpec: {
      de: 'Spezifikation',
      en: 'Specification',
      fr: 'Spécification',
    },
    styleSourceName: {
      de: 'Name der Stilquelle',
      en: 'Style source name',
      fr: 'Nom de la source du style',
    },
    styleSourceUrl: {
      de: 'Stil URL',
      en: 'Style URL',
      fr: 'URL du style',
    },
    styleSourceText: {
      de: 'Stil Konfig',
      en: 'style config',
      fr: 'Configuration du style',
    },
    layerSearchable: {
      de: 'Ist die Ebene durchsuchbar?',
      en: 'Can the layer be searched?',
      fr: 'La couche est-elle consultable?',
    },
    searchResultLabelMask: {
      de: 'Suchergebnis Beschriftungs-Maske',
      en: 'Search result label mask',
      fr: "Masque d'étiquette de résultat de recherche",
    },
    searchResultLabelMaskInfo: {
      de: 'Definieren Sie, was bei der Auswahl der Suchergebnisse angezeigt wird. Verwenden Sie Feature-Eigenschaftsfelder, z. B.',
      en: "Define what's displayed on search result selection: Use feature property fields e.g.",
      fr: 'Définissez ce qui est affiché dans la sélection des résultats de recherche. Utilisez les champs de propriété de fonctionnalité, par ex.',
    },
    searchRegExPattern: {
      de: 'RegEx Muster für Suche',
      en: 'RegEx pattern for search',
      fr: 'Modèle RegEx pour la recherche',
    },
    searchRegExPatternInfo: {
      de: 'Verwenden Sie Regex mit benannten Gruppen, um Sucheingabemuster zu definieren. Der Name muss der Eigenschaftsname sein, in dem gesucht werden soll, z.B.',
      en: 'Use regex with named groups to define search input patterns, the name need to be the property name to search in e.g.',
      fr: "Utilisez l'expression régulière avec des groupes nommés pour définir des modèles d'entrée de recherche, le nom doit être le nom de la propriété dans laquelle rechercher, par exemple",
    },
    searchRegExPatternFullMatch: {
      de: 'Die RegEx werden so angepasst, dass sie nach vollständiger übereinstimmung Suchen',
      en: 'The RegEx will be adjusted to match full search',
      fr: 'Le RegEx sera ajusté pour correspondre à la recherche complète',
    },
    searchRegExPatternOptionsTitle: {
      de: 'Optionen',
      en: 'options',
      fr: 'paramètres',
    },
    searchResultGrouping: {
      de: 'Gruppierung der Ergebnisse',
      en: 'Grouping of results',
      fr: 'Groupement de résultats',
    },
    searchResultGroupingInfo: {
      de: 'Gruppieren der Ergebnisse nach diesen Eigenschaften. Bei zu vielen Ergebnissen wird das erste Ergebnis jeder Gruppe (sortiert nach Beschriftung) angezeigt.',
      en: 'Group results by these properties. If there are too many results, the first result of each group (sorted by label) is displayed.',
      fr: "Regroupez les résultats par ces propriétés. S'il y a trop de résultats, le premier résultat de chaque groupe (trié par étiquette) est affiché.",
    },
    searchMaxResultCount: {
      de: 'Max Anzahl Suchergebnisse',
      en: 'Max number of search results',
      fr: 'Nombre maximum de résultats de recherche',
    },
    organisationSettings: {
      de: 'Organisationseinstellungen',
      en: 'Organization settings',
      fr: "Paramètres de l'organisation",
    },
    organisationLayerSettings: {
      de: 'Organisationseinstellungen für Map-Layer',
      en: 'Organizational settings for map layers',
      fr: "Paramètres d'organisation de la couche de carte",
    },
    preSelectedWmsSources: {
      de: 'Vorab ausgewählte WMS-Quellen',
      en: 'Pre-selected WMS sources',
      fr: 'Sources WMS présélectionnées',
    },
    noWmsSourcesAvailable: {
      de: 'Keine WMS-Quellen verfügbar',
      en: 'No WMS sources available',
      fr: 'Aucune source WMS disponible',
    },
    favoriteLayersSettings: {
      de: 'Ebenen favoriten',
      en: 'Favorite layers',
      fr: 'Calques favoris',
    },
    addFromActive: {
      de: 'Von aktiven hinzufügen',
      en: 'Add from active',
      fr: 'Ajouter depuis actif',
    },
    noActiveLayers: {
      de: 'Keine aktiven Ebenen verfügbar',
      en: 'No active layers available',
      fr: 'Aucune couche active disponible',
    },
    addFromList: {
      de: 'Aus Liste hinzufügen',
      en: 'Add from list',
      fr: 'Ajouter à partir de la liste',
    },
    useCurrentSources: {
      de: 'aktuelle Quellen nutzen',
      en: 'use current sources',
      fr: 'utiliser les sources actuelles',
    },
    addAllActiveOnes: {
      de: 'Alle aktiven hinzufügen',
      en: 'Add all active ones',
      fr: 'Ajouter tous les actifs',
    },
    askReplaceExistingLayerSettings: {
      de: 'Ebene {0} existiert bereits. Bestehende Einstellung aktualisieren (OK) oder neue hinzufügen (Abbrechen)?',
      en: 'Layer {0} already exist. Update existing setting (ok) or add new one (cancel)?',
      fr: 'La calque {0} existe déjà. Mettre à jour le paramètre existant (ok) ou en ajouter un nouveau (annuler)?',
    },
    blobMetaTitle: {
      de: 'Offlineverfügbarkeit des Map-Layers',
      en: 'Offline availability of the map layer',
      fr: 'Disponibilité hors ligne de la couche de carte',
    },
    blobMetaDataTitle: {
      de: 'Karten Daten',
      en: 'Map data',
      fr: 'Données de la carte',
    },
    blobMetaDataDefaultUrl: {
      de: 'Karten Daten URL aus der Konfiguration',
      en: 'Map data URL from config',
      fr: 'URL des données de la carte à partir de la configuration',
    },
    blobMetaDataUrl: {
      de: 'Karten Daten URL lokaler Daten',
      en: 'Map data URL of local data',
      fr: 'URL des données de la carte des données locales',
    },
    blobMetaBlobSource: {
      de: 'lokale Datenquelle:',
      en: 'local data source:',
      fr: 'source de données locale:',
    },
    blobMetaStyleTitle: {
      de: 'Stil',
      en: 'Style',
      fr: 'Style',
    },
    blobMetaStyleLayerSetting: {
      de: '',
      en: 'This layer have text style, pleace adjust in the layer settings (possibly activate expert mode needed)',
      fr: '',
    },
    blobMetaStyleDefaultUrl: {
      de: 'Stil-URL aus der Konfiguration',
      en: 'Style url from config',
      fr: 'URL de style à partir de la configuration',
    },
    blobMetaStyleUrl: {
      de: 'Stil-URL lokaler Daten',
      en: 'Style URL of local data',
      fr: 'URL de style des données locales',
    },
    blobMetaStyleText: {
      de: 'Stil Konfig',
      en: 'style config',
      fr: 'Configuration du style',
    },
    blobMetaNotOfflineLayer: {
      de: 'Diese Ebene kann nicht offline zugänglich gemacht werden.',
      en: 'This layer cannot be made offline accessible.',
      fr: 'Cette Couches cartographiques ne peut pas être rendue accessible hors ligne.',
    },
    blobMetaNotOfflineMap: {
      de: 'Diese Basiskarte kann nicht offline zugänglich gemacht werden.',
      en: 'This base map cannot be made offline accessible.',
      fr: 'Cette carte de base ne peut pas être rendue accessible hors ligne.',
    },
    localAvailabilityStepsIntro: {
      de: 'Um vollständig offline arbeiten zu können, müssen folgende Dinge überprüft werden:',
      en: 'The following things have to be verified to allow working offline:',
      fr: 'Pour permettre de travailler entièrement hors ligne, les éléments suivants doivent être vérifiés:',
    },
    localAvailabilitySteps: {
      de: 'Schritte zum Offline-Arbeiten.',
      en: 'Steps to work offline.',
      fr: 'Étapes pour travailler hors ligne.',
    },
    useLocalBaseMap: {
      de: '"Lokal" Basiskarte vewenden.',
      en: 'Use "Local" base map.',
      fr: 'Utiliser la carte de base "Local".',
    },
    downloadLocalBaseMap: {
      de: '"Lokal" Basiskarte herunterladen.',
      en: 'Download "local" base map.',
      fr: 'Télécharger la carte de base "locale".',
    },
    hideUnavailableLayers: {
      de: 'Alle Kartenebenen ohne Offline-Funktion ausblenden (/entfernen).',
      en: 'Hide(/remove) all map layers without offline capability.',
      fr: 'Masquer (/supprimer) toutes les couches de carte sans fonctionnalité hors ligne.',
    },
    downloadAvailableLayers: {
      de: 'Daten aller aktiven Kartenebenen mit Offline-Funktion herunterladen.',
      en: 'Download data from all active map layers with offline capability.',
      fr: 'Téléchargez les données de toutes les couches de carte actives avec une fonctionnalité hors ligne.',
    },
    haveSearchCapability: {
      de: 'Verwenden von Kartenebene(n) mit Offline-Suchfunktion.',
      en: 'Use map layer(s) with offline search capability.',
      fr: 'Utilisez des couches de carte avec une fonctionnalité de recherche hors ligne.',
    },
    howtoFindSearchCapability: {
      de: 'Kartenebene(n) mit Offline-Suchfunktion zeigen in der Liste der „Verfügbaren Ebenen“ ein Lupensymbol an und gehören zur Ebenen Quelle „Geteilte Ebenen“.',
      en: 'Map layer(s) with offline search capability show a Magnifying glass symbol on the list of "Available layers" and they are of "Shared layers" Layer Source.',
      fr: 'Les couches de carte avec capacité de recherche hors ligne affichent un symbole de loupe sur la liste des "Couches cartographiques disponibles" et elles appartiennent à la source de couche "Couches partagées".',
    },
    offlineDialogTitle: {
      de: 'Offline-Warnung',
      en: 'Offline Warning',
      fr: 'Avertissement hors ligne',
    },
    offlineDialogMain: {
      de: 'Sie sind derzeit offline. Wenn Sie die Seite aktualisieren oder verlassen, werden Sie abgemeldet und können sich erst wieder anmelden, wenn Sie eine Internetverbindung haben. Sind Sie sicher, dass Sie fortfahren möchten?',
      en: "You are currently offline. Refreshing or exiting the page will log you out and you won't be able to log back in until you have an internet connection. Are you sure you want to proceed?",
      fr: "Vous êtes actuellement hors ligne. Actualiser ou quitter la page vous déconnectera et vous ne pourrez pas vous reconnecter tant que vous ne disposerez pas d'une connexion internet. Êtes-vous sûr de vouloir continuer ?",
    },
    personRecoveryOverview: {
      de: 'Personenbergungsübersicht',
      en: 'Person recovery overview',
      fr: 'Aperçu des personnes hébergées',
    },
    noMissingPersons: {
      de: 'Keine auswirkungen auf Personen gefunden',
      en: 'No impacts on persons found',
      fr: 'Aucun effet sur les personnes',
    },
    message_number: {
      de: 'Nummer',
      en: 'Number',
      fr: 'Numéro',
    },
    message_subject: {
      de: 'Betreff',
      en: 'Subject',
      fr: 'Sujet',
    },
    message_content: {
      de: 'Meldungsinhalt',
      en: 'Message content',
      fr: 'Contenu du message',
    },
    date_created: {
      de: 'Erstellungsdatum',
      en: 'Creation date',
      fr: 'Date de création',
    },
    guestLimitReachedShort: {
      de: 'Gastmodus Limit erreicht',
      en: 'Guest limit reached',
      fr: "Limite d'invités atteinte",
    },
    guestLimitReached: {
      de: 'Die maximale Anzahl von Elementen für den Gastzugang ist erreicht. Wenn Sie Interesse an einem dauerhaften Zugang zur ZSKarte haben, wenden Sie sich bitte an info@zskarte.ch.',
      en: "The maximum number of elements for guest access has been reached. If yo're interested in having permanent access to the ZSKarte, please contact info@zskarte.ch.",
      fr: "Le nombre maximum d'éléments pour l'accès invité a été atteint. Si vous êtes intéressé par un accès permanent à la ZSKarte, veuillez contacter info@zskarte.ch.",
    },
    guestLimitElements: {
      de: 'Elemente auf der Karte im Gastmodus',
      en: 'Elements on the map in guest mode',
      fr: 'Éléments de la carte en mode invité',
    },

    pressEnter: {
      de: 'Drücken Sie Enter, um die Meldenummer hinzuzufügen',
      en: 'Press enter to add the report number',
      fr: 'Appuyez sur Entrée pour ajouter le numéro du rapport',
    },

    errorSaving: {
      de: 'Fehler beim Speichern',
      en: 'Error saving',
      fr: "Erreur lors de l'enregistrement",
    },
    storedLocallyOnly: {
      de: 'Nur lokal gespeichert.',
      en: 'Stored locally only.',
      fr: 'Stocké localement uniquement.',
    },
    pdfDesignerHelp: {
      de: `
        Im Designer links können Sie Elemente grafisch hinzufügen oder bearbeiten, die Änderungen werden rechts in der technischen Ansicht live aktualisiert.<br>
        In der technischen Ansicht habe Sie die Möglichkeit z.B. positionen einfacher einheitlich anzupassen, welche auch im Designer mit leichter Verzögerung akualisiert werden.<br>
        Mit dem Slider/Splitter in der Mitte können Sie die Aufteilung der Bereiche verändern.<br>
        <br>
        Platzhalter welche mit den Daten gefüllt werden soll, müssen entsprechende Infos im "name" Attribut haben. Mögliche Werte sind alle Werte des Ausgabeobjekts "entry" z.b. "entry.messageNumber" sowie folgende Werte:
        <ul>
          <li>organization.documentId</li>
          <li>organization.name</li>
          <li>organization.url</li>
          <li>organization.logo_url</li>
          <li>operation.documentId</li>
          <li>operation.name</li>
          <li>url_entry</li>
        </ul>
        Texte welche fix sind, können einfach direkt im Designer definert werden (technisch im "content" Attribut) wobei das Feld auf NICHT editierbar (readOnly: true) gesetzt werden muss.<br>
        Wenn Sie einen sprachabhängigen Text wollen, können Sie als name "i18n:&lt;text key&gt;" verwenden oder dies als Textinhalt ("content") angeben, da der Wert dann dynamisch ist, muss das Feld editierbar sein (readOnly: false).<br>
        Möchten Sie den sprachabhängigen Text gefolgt von einem Doppelpunkt haben, verwenden sie stattdessen  "i18n_colon:&lt;text key&gt;".<br>
        Wenn Sie die Daten z.B. "entry.department" nicht mit seinem technischen Wert sondern als sprachabhängigen Text ausgeben, können Sie "i18n_val:" voranstellen also z.B. "name" auf "i18n_val:entry.department" setzen.<br>
        <br>
        Wenn Sie die Daten/Infos eines Wertes mit fixer Werteliste nicht als Text sondern mehreren checkboxen ausgeben möchten, kann die Bedingung mit welchem Wert die Checkbox aktiv ist im "name" Attribut über die Notation "equals:&lt;name&gt;=&lt;Wert&gt;" also z.B. "equals:entry.communicationType=telefon" definiert werden.<br>
        `,
      en: `
        In the Designer on the left, you can graphically add or edit elements, and the changes are updated live in the technical view on the right.<br>
        In the technical view, you have the option to adjust positions more easily and uniformly, which are also updated in the Designer with a slight delay.<br>
        With the slider/splitter in the middle, you can change the division of the areas.<br>
        <br>
        Placeholders that should be filled with data must have corresponding information in the "name" attribute. Possible values are all values of the output object "entry", e.g., "entry.messageNumber", as well as the following values:
        <ul>
          <li>organization.documentId</li>
          <li>organization.name</li>
          <li>organization.url</li>
          <li>organization.logo_url</li>
          <li>operation.documentId</li>
          <li>operation.name</li>
          <li>url_entry</li>
        </ul>
        Texts that are fixed can be defined directly in the Designer (technically in the "content" attribute), and the field must be set to NOT editable (readOnly: true).<br>
        If you want a language-dependent text, you can use "i18n:&lt;text key&gt;" as the name or specify it as text content ("content"). Since the value is then dynamic, the field must be editable (readOnly: false).<br>
        If you want the language-dependent text followed by a colon, use "i18n_colon:&lt;text key&gt;" instead.<br>
        If you want to output the data, e.g., "entry.department", not with it's technical value but as a language-dependent text, you can prefix it with "i18n_val:", so set "name" to "i18n_val:entry.department".<br>
        <br>
        If you want to output the data/information of a value with a fixed value list not as text but as multiple checkboxes, the condition for which value activates the checkbox can be defined in the "name" attribute using the notation "equals:&lt;name&gt;=&lt;value&gt;", e.g., "equals:entry.communicationType=telefon".
        `,
      fr: `
        Dans le Designer à gauche, vous pouvez ajouter ou modifier graphiquement des éléments, les changements sont mis à jour en direct dans la vue technique à droite.<br>
        Dans la vue technique, vous avez la possibilité d'ajuster plus facilement et uniformément les positions, qui sont également mises à jour dans le Designer avec un léger délai.<br>
        Avec le curseur/diviseur au milieu, vous pouvez modifier la répartition des zones.<br>
        <br>
        Les espaces réservés qui doivent être remplis avec des données doivent avoir des informations correspondantes dans l'attribut "name". Les valeurs possibles sont toutes les valeurs de l'objet de sortie "entry", par exemple "entry.messageNumber", ainsi que les valeurs suivantes:
        <ul>
          <li>organization.documentId</li>
          <li>organization.name</li>
          <li>organization.url</li>
          <li>organization.logo_url</li>
          <li>operation.documentId</li>
          <li>operation.name</li>
          <li>url_entry</li>
        </ul>
        Les textes qui sont fixes peuvent être définis directement dans le Designer (techniquement dans l'attribut "content") et le champ doit être défini comme NON modifiable (readOnly: true).<br>
        Si vous voulez un texte dépendant de la langue, vous pouvez utiliser "i18n:&lt;clé du texte&gt;" comme nom ou le spécifier comme contenu du texte ("content"). Comme la valeur est alors dynamique, le champ doit être modifiable (readOnly: false).<br>
        Si vous voulez le texte dépendant de la langue suivi d'un deux-points, utilisez plutôt "i18n_colon:&lt;clé du texte&gt;".<br>
        Si vous voulez afficher les données, par exemple "entry.department", non pas avec sa valeur technique mais comme un texte dépendant de la langue, vous pouvez le préfixer avec "i18n_val:", donc définir "name" sur "i18n_val:entry.department".<br>
        <br>
        Si vous souhaitez afficher les données/informations d'une valeur avec une liste de valeurs fixes non pas sous forme de texte mais sous forme de plusieurs cases à cocher, la condition pour laquelle la valeur active la case à cocher peut être définie dans l'attribut "name" en utilisant la notation "equals:&lt;nom&gt;=&lt;valeur&gt;", par exemple "equals:entry.communicationType=telefon".<br>
      `,
    },
    fillAllFields: {
      de: 'Bitte füllen Sie alle benötigten Felder.',
      en: 'Please fill in all required fields.',
      fr: 'Veuillez remplir tous les champs obligatoires.',
    },
    closeNotSaved: {
      de: 'Sie haben noch nicht gespeicherte Änderungen, möchten Sie diese verwerfen?',
      en: 'You have unsaved changes, do you want to discard them?',
      fr: 'Vous avez des modifications non enregistrées, souhaitez-vous les ignorer?',
    },
    customizePrintForm: {
      de: 'Druckformular anpassen',
      en: 'Customize print form',
      fr: "Personnaliser le formulaire d'impression",
    },
    reloadFromServer: {
      de: 'Neu laden vom Server',
      en: 'Reload from server',
      fr: 'Recharger depuis le serveur',
    },
    streetSearch: {
      de: 'Strassensuche',
      en: 'Street search',
      fr: 'Recherche dans la rue',
    },
    waterSearch: {
      de: 'Gewässersuche (Abschnitt)',
      en: 'Water search (section)',
      fr: "Recherche d'eau (section)",
    },
    filterMapSection: {
      de: 'Nur Ergebnisse aus Kartenausschnitt',
      en: 'Only results from map section',
      fr: 'Seuls les résultats de la section de la carte',
    },
    filterByDistance: {
      de: 'Nur Ergebnisse bis max Distanz',
      en: 'Only results up to max distance',
      fr: "Résultats uniquement jusqu'à la distance maximale",
    },
    maxDistance: {
      de: 'Max Distanz',
      en: 'Max distance',
      fr: 'Distance maximale',
    },
    filterByArea: {
      de: 'Nur Ergebnisse aus definiertem Bereich',
      en: 'Only results from a defined area',
      fr: 'Résulte uniquement d’une zone définie',
    },
    defineArea: {
      de: 'Bereich definieren',
      en: 'Define area',
      fr: 'Définir la zone',
    },
    endDefineArea: {
      de: 'Bereich definieren beenden',
      en: 'End define area',
      fr: 'Quitter définir la zone',
    },
    sortedByDistance: {
      de: 'Sortiert nach Distanz',
      en: 'Sorted by distance',
      fr: 'Triés par distance',
    },
    noSearchResult: {
      de: 'Kein Suchergebnis gefunden.',
      en: 'No search results found',
      fr: 'Aucun résultat de recherche trouvé',
    },
    searchAddress: {
      de: 'Adresse suchen',
      en: 'Search address',
      fr: 'Rechercher une adresse',
    },
    searchAddressUsageHint: {
      de: 'Um Adressinformationen einzufügen, geben Sie "addr:" ein oder drücken Sie Ctrl+Leertaste.\nZum Bearbeiten doppelklicken Sie in den Bereich oder drücken Sie Ctrl+Leertaste.',
      en: 'To insert address information, type "addr:" or press Ctrl+Space.\nTo edit, double-click in the area or press Ctrl+Space.',
      fr: 'Pour insérer une adresse, saisissez "addr:" ou appuyez sur Ctrl+Espace.\nPour la modifier, double-cliquez dans la zone ou appuyez sur Ctrl+Espace.',
    },
    showMap: {
      de: 'Map anzeigen',
      en: 'Show map',
      fr: 'afficher la carte',
    },
    showAllAddresses: {
      de: 'Alle Adressen anzeigen',
      en: 'Show all addresses',
      fr: 'Afficher toutes les adresses',
    },
    showAddresses: {
      de: 'Adressen anzeigen',
      en: 'Show addresses',
      fr: 'Afficher les adresses',
    },
    showLinkedText: {
      de: 'Adressen als Links anzeigen',
      en: 'Display addresses as links',
      fr: 'Afficher les adresses sous forme de liens',
    },
    markPotentialAddresses: {
      de: 'Adressen erkennen',
      en: 'Recognize addresses',
      fr: 'Repérer adresses',
    },
    unmarkPotentialAddresses: {
      de: 'Adressen bereinigen',
      en: 'Clean up addresses',
      fr: 'Nettoyer adresses',
    },
    ...JOURNAL_TRANSLATIONS,
    ...DOCUMENTATION_TRANSLATIONS,
    ...MAP_TRANSLATIONS,
  };

  public get(key: string): string {
    if (!key?.trim()) {
      console.warn('Empty translation key provided');
      return '';
    }

    const element = I18NService.TRANSLATIONS[key];
    if (!element) {
      console.warn(`Missing translation key: ${key}`);
      return key;
    }

    return this.getFallbackTranslation(element, key);
  }

  public getLabelForSign(sign: Sign): string {
    return this.getFallbackSignTranslation(sign);
  }

  public has(key: string): boolean {
    const element = I18NService.TRANSLATIONS[key];
    if (!element) return false;

    return this.getFallbackTranslation(element) !== '';
  }

  // Private helper methods
  private getFallbackTranslation(translations: Record<string, string>, key?: string): string {
    const userLocale = this._session.getLocale();
    const preferred = translations[userLocale];

    if (preferred) return preferred;

    // Log when user's preferred locale is missing
    const keyInfo = key ? ` for key '${key}'` : '';
    console.warn(`Translation missing${keyInfo} for user locale '${userLocale}'`);

    for (const locale of LOCALES) {
      if (translations[locale]) return translations[locale];
    }
    return '';
  }

  private getFallbackSignTranslation(sign: Sign): string {
    const userLocale = this._session.getLocale();
    const preferred = sign[userLocale];

    if (preferred) return preferred;

    console.warn(`Sign translation missing for user locale '${userLocale}'`);

    for (const locale of LOCALES) {
      if (sign[locale]) return sign[locale];
    }
    return '';
  }
}
