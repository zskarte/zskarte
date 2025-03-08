import { Injectable, inject } from '@angular/core';
import { SessionService } from '../session/session.service';
import { LOCALES, Sign } from '@zskarte/types';

@Injectable({
  providedIn: 'root',
})
export class I18NService {
  private _session = inject(SessionService);

  private static TRANSLATIONS = {
    local: {
      de: 'Lokal',
      end: 'Local',
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
      fr: 'Francais',
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
      fr: 'Mot de passe',
      en: 'Password',
    },
    wrongPassword: {
      de: 'Ungültiges Passwort',
      fr: 'Mauvais mot de passe',
      en: 'Wrong password',
    },
    eventname: {
      de: 'Ereignis',
      fr: "L'événement",
      en: 'Happening',
    },
    mapDataOvertake: {
      de: 'Kartendaten übernehmen',
      fr: 'Appliquer les données de la carte',
      en: 'Overtake map data',
    },
    sessionOverdue: {
      de: 'Abgelaufen',
      fr: 'Expired',
      en: 'Expiré',
    },
    text: {
      de: 'Text',
      en: 'Text',
      fr: 'Texte',
    },
    draw: {
      de: 'Zeichnen',
      fr: 'Dessiner',
      en: 'Draw',
    },
    newMap: {
      de: 'Neue Karte erstellen',
      en: 'Create new map',
      fr: 'Créer une nouvelle carte',
    },
    loadMap: {
      de: 'Bestehende Karte laden',
      en: 'Load existing map',
      fr: 'Charger une carte existante',
    },
    copy: {
      de: 'Kopie',
      fr: 'Copie',
      en: 'Copy',
    },
    importMap: {
      de: 'Karte importieren',
      en: 'Import map',
      fr: 'Importer carte',
    },
    importMapConflict: {
      de: 'Die zu importierende Karte existiert bereits. Möchten Sie sie ersetzen? Ansonsten wird eine Kopie angelegt.',
      fr: 'La carte à importer existe déjà. Souhaitez-vous le remplacer ? Sinon, une copie est créée.',
      en: 'The map to be imported already exists. Do you want to replace it? If not, a copy will be created.',
    },
    editMap: {
      de: 'Ereignis bearbeiten',
      en: 'Edit event',
      fr: 'Modifier événement',
    },
    downloadCurrentDrawing: {
      de: 'Aktuelle Zeichnung herunterladen',
      fr: 'Télécharger le dessin actuel',
      en: 'Download the current drawing',
    },
    exportSession: {
      de: 'Ereignis exportieren',
      en: 'Export event',
      fr: 'Exporter événement',
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
      fr: 'Voulez-vous vraiment supprimer définitivement cet événement ?',
      en: 'Do you really want to permanently delete this event?',
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
      fr: 'Exporter a CSV',
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
    polygon: {
      de: 'Polygon',
      en: 'Polygon',
      fr: 'Polygone',
    },
    point: {
      de: 'Punkt',
      en: 'Point',
      fr: 'Point',
    },
    circle: {
      de: 'Kreis',
      en: 'Circle',
      fr: 'Cercle',
    },
    line: {
      de: 'Linie',
      en: 'Line',
      fr: 'Ligne',
    },
    freehand: {
      de: 'Freihand',
      en: 'Draw free',
      fr: 'Dessiner libre',
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
    findPlace: {
      de: 'Ort finden',
      fr: 'Trouver emplacement',
      en: 'Find a place',
    },
    endHistoryMode: {
      de: 'History-Modus beenden',
      fr: 'Quitter le mode historique',
      en: 'End history mode',
    },
    loadFromFile: {
      de: 'Von Datei laden',
      fr: 'Charger à partir du fichier',
      en: 'Load from file',
    },
    createdBy: {
      de: 'Erstellt von',
      en: 'Created by',
      fr: 'Créé par',
    },
    import: {
      de: 'Importieren',
      fr: 'Importer',
      en: 'Import',
    },
    rewokeShareLinkFailedMessage: {
      de: 'Fehler beim löschen des Links.',
      fr: 'Erreur lors de la suppression du lien.',
      en: 'Error while deleting the link.',
    },
    drawLayer: {
      de: 'Zeichnungsebene',
      fr: 'Couche de dessin',
      en: 'Drawing layer',
    },
    layers: {
      de: 'Ebenen',
      fr: 'Couches cartographiques',
      en: 'Layers',
    },
    rotate: {
      de: 'Rotieren',
      fr: 'Tourner',
      en: 'Rotate',
    },
    opacity: {
      de: 'Deckkraft',
      fr: 'Opacité',
      en: 'Opacity',
    },
    defaultValues: {
      de: 'Standardwerte zurücksetzen',
      fr: 'Valeurs par défaut',
      en: 'Reset Default Values',
    },
    solidLine: {
      de: 'Durchgezogen',
      fr: 'Continue',
      en: 'Solid',
    },
    dottedLine: {
      de: 'Gepunktet',
      en: 'Dotted',
      fr: 'Pointé',
    },
    dashedLine: {
      de: 'Gestrichelt',
      en: 'Dashed',
      fr: 'Pointillée',
    },
    thinDashedLine: {
      de: 'Gestrichelt (Dünn)',
      en: 'Dashed (thin)',
      fr: 'Pointillée (maigrir)',
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
      fr: 'Votre texte',
      en: 'Your text',
    },
    drawing: {
      de: 'Zeichnung',
      fr: 'Dessin',
      en: 'Drawing',
    },
    currentDrawing: {
      de: 'Aktuelle Zeichnung',
      fr: 'Dessin actuel',
      en: 'Current drawing',
    },
    viewArchivedOperation: {
      de: 'Dies ist ein archiviertes Ereignis',
      fr: 'This is an archived event',
      en: 'Ceci est un événement archivé',
    },
    history: {
      de: 'History- / Lese-Modus',
      fr: 'Mode historique / lecture',
      en: 'History / read mode',
    },
    drawMode: {
      de: 'Zeichnungsmodus',
      fr: 'Mode de dessin',
      en: 'Drawing mode',
    },
    expertView: {
      de: 'Experten Ansicht',
      en: 'Expert view',
      fr: "Point de vue d'expert",
    },
    defaultView: {
      de: 'Standard Ansicht',
      en: 'Default view',
      fr: 'Vue générale',
    },
    toastExpertView: {
      de: 'Experten Ansicht aktiviert',
      en: 'Expert view activated',
      fr: "Point de vue d'expert activée",
    },
    toastDefaultView: {
      de: 'Standard Ansicht aktiviert',
      en: 'Default view activated',
      fr: 'Vue générale activée',
    },
    color: {
      de: 'Farbe',
      fr: 'Couleur',
      en: 'Color',
    },
    colorPickerMode: {
      de: 'Weitere Farben',
      fr: 'Plus de couleurs',
      en: 'More colors',
    },
    drawHole: {
      de: 'Loch zeichnen',
      fr: 'Dessiner un trou',
      en: 'Draw a hole',
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
      fr: 'Dégrouper',
      en: 'Ungroup',
    },
    group: {
      de: 'Gruppieren',
      fr: 'Grouper',
      en: 'Group',
    },
    cancelGrouping: {
      de: 'Gruppieren abbrechen',
      fr: 'Annuler le groupement',
      en: 'Cancel grouping',
    },
    sessionCreatorTitle: {
      de: 'Willkommen bei Zivilschutz-Karte!',
      fr: 'Bienvenue à Zivilschutz-Karte!',
      en: 'Welcome to Zivilschutz-Karte!',
    },
    sessionCreatorInstructions: {
      de: 'Bitte beachten Sie: Die Daten werden nur auf Ihrem Browser gehalten - sie werden nicht mit einem Server geteilt! Falls Sie die Karte mit anderen zusätzlich sichern oder teilen möchten, können Sie diese exportieren (und erneut importieren).<br/><br/> <strong>Wichtig</strong>: Wenn Sie Ihre Browserdaten löschen, so werden auch die gespeicherten Karten entfernt!',
      fr: "Remarque : les données sont uniquement conservées sur votre navigateur - elles ne sont pas partagées avec un serveur ! Si vous souhaitez enregistrer ou partager la carte avec d'autres personnes, vous pouvez exporter (et réimporter) la carte. <br/><br/><strong>Important</strong>: Si vous supprimez les données de votre navigateur, les cartes enregistrées seront également supprimées.",
      en: 'Please note: The data is only kept in your browser - it is not shared with a server! If you would like to additionally save or share the map with others, you can export (and re-import) the map.<br/><br/> <strong>Important</strong>: If you delete your browser data, the saved maps will also be removed',
    },
    zso: {
      de: 'ZSO',
      fr: 'PCi',
      en: 'CPO',
    },
    sessionLoaderInstructions: {
      de: 'Bitte beachten Sie: Wenn Sie eine Karte laden wird die bestehende nicht gelöscht - Sie können diese jederzeit hier wieder laden.',
      fr: "Remarque : lorsque vous chargez une carte, la carte existante n'est pas supprimée - vous pouvez la recharger ici à tout moment.",
      en: 'Please note: When you load a map, the existing map is not deleted - you can reload it here at any time.',
    },
    importSessionInstructions: {
      de: 'Verwenden Sie eine <strong>.zsjson</strong> Datei um eine vollständige Karte zu importieren.',
      fr: 'Utilisez un fichier <strong>.zsjson</strong> pour importer une carte complète.',
      en: 'Use a <strong>.zsjson</strong> file to import a complete map.',
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
    availableLayers: {
      de: 'Verfügbare Ebenen',
      en: 'Available layers',
      fr: 'Couches cartographiques disponibles',
    },
    currentMap: {
      de: 'Basiskarten',
      fr: 'Carte de base',
      en: 'Base map',
    },
    otherMaps: {
      de: 'Andere Karten',
      fr: 'Autre cartes',
      en: 'Other map',
    },
    map: {
      de: 'Karte',
      fr: 'Carte',
      en: 'Map',
    },
    legendNotLoaded: {
      de: 'Die Legende für diese Karte konnte leider nicht geladen werden',
      fr: "La légende de cette carte n'a pas pu être chargée",
      en: 'The legend for this map could not be loaded',
    },
    fontSize: {
      de: 'Schriftgrösse',
      fr: 'Taille de police',
      en: 'Font size',
    },
    yourTag: {
      de: 'Ihr Tag',
      fr: 'Votre tag',
      en: 'Your tag',
    },
    tagState: {
      de: 'Taggen',
      en: 'Tag',
      fr: 'Taguer',
    },
    filterHistory: {
      de: 'Gefiltert (nur markierte / alle 30 min)',
      fr: 'Filtré (uniquement marqué / toutes les 30 min)',
      en: 'Filtered (tagged / every 30 mins only)',
    },
    removeTag: {
      de: 'Tag entfernen',
      fr: 'Supprimer le tag',
      en: 'Remove tag',
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
      fr: 'Cette forme consiste en un nombre minimum de points.',
      en: 'This shape consists of a minimal number of points.',
    },
    removeFeatureFromMapConfirm: {
      de: 'Möchten Sie dieses Element wirklich von der Karte entfernen?',
      fr: 'Souhaitez-vous vraiment supprimer cet élément de la carte ?',
      en: 'Do you really want to remove this element from the map?',
    },
    shareWithOtherMaps: {
      de: 'Mit anderen Karten teilen',
      fr: "Partager avec d'autres cartes",
      en: 'Share with other maps',
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
      fr: 'Allemand',
      en: 'German',
    },
    french: {
      de: 'Französisch',
      fr: 'Français',
      en: 'French',
    },
    english: {
      de: 'Englisch',
      fr: 'Anglais',
      en: 'English',
    },
    deleteSymbolConfirm: {
      de: 'Wollen Sie diese Signatur wirklich löschen?',
      fr: 'Voulez-vous vraiment supprimer ce symbole ?',
      en: 'Do you really want to delete this symbol?',
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
    defineCoordinates: {
      de: 'Koordinaten definieren',
      en: 'Define coordinates',
      fr: 'Définir les coordonnées',
    },
    replaceByImport: {
      de: 'Existierende Elemente mit Import ersetzen',
      fr: "Remplacer les éléments existants par l'import",
      en: 'Replace existing elements with import',
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
      fr: 'Pour importer des formes de geoadmin, vous avez besoin du nom de la couche (par exemple "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill") ainsi que d\'une clé de recherche et de sa valeur, selon laquelle les métadonnées seront filtrées (par exemple "kanton" comme clé et "FR" comme valeur pour importer toutes les communes de Fribourg)',
      en: 'To import forms of geoadmin, you need the layer name (e.g. "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill") as well as a search key and its value, according to which the metadata will be filtered (e.g. "kanton" as key and "FR" as value to import all communes of Fribourg)',
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
    print: {
      de: 'Drucken',
      en: 'Print',
      fr: 'Imprimer',
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
    scale: {
      de: 'Massstab',
      en: 'scale',
      fr: 'échelle',
    },
    autoScale: {
      de: 'Automatische Skalierung',
      en: 'auto scale',
      fr: 'échelle automatique',
    },
    emptyMap: {
      de: 'Leere Karte',
      en: 'empty map',
      fr: 'carte vide',
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
      fr: 'Ajouter code QR',
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
    protocolSaveAsExcel: {
      de: 'Als Excel exportieren',
      en: 'Export as Excel',
      fr: 'Exporter en Excel',
    },
    save: {
      de: 'Speichern',
      en: 'Save',
      fr: 'Enregistrer',
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
    zoomOut: {
      de: 'Heraus zoomen',
      en: 'Zoom out',
      fr: 'Zoom out',
    },
    zoomIn: {
      de: 'Hinein zoomen',
      en: 'Zoom in',
      fr: 'Zoom in',
    },
    zoomToScale: {
      de: 'massstabsgetreu vergrössern',
      en: 'zoom to scale',
      fr: "zoomer à l'échelle",
    },
    scaleToUse: {
      de: 'Massstab (1:xxx)',
      en: 'scale (1:xxx)',
      fr: 'échelle (1:xxx)',
    },
    filters: {
      de: 'Filter',
      en: 'Filters',
      fr: 'Filtre',
    },
    myLocation: {
      de: 'Aktuelle position',
      en: 'Current location',
      fr: 'Emplacement actuel',
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
    selectedFeature: {
      de: 'Ausgewähltes Feature',
      en: 'Selected Feature',
      fr: 'Fonctionnalité sélectionnée',
    },
    generalFilters: {
      de: 'Globale Filter',
      en: 'Global filters',
      fr: 'Filtre globale',
    },
    showAllElements: {
      de: 'Alle Elemente anzeigen',
      en: 'Show all elements',
      fr: 'Afficher tout',
    },
    hideAllElements: {
      de: 'Alle Elemente verstecken',
      en: 'Hide all elements',
      fr: 'Tout cacher',
    },
    hideShow: {
      de: 'anzeigen/verstecken',
      en: 'show/hide',
      fr: 'afficher/cacher',
    },
    csvSearchFor: {
      de: 'Suche nach ...',
      en: 'Search for ...',
      fr: 'Chercher ...',
    },
    csvID: {
      de: 'ID',
      en: 'ID',
      fr: 'ID',
    },
    csvDate: {
      de: 'Erstelldatum',
      en: 'Date created',
      fr: 'Date de creation',
    },
    csvGroup: {
      de: 'Gruppe',
      en: 'Group',
      fr: 'Groupe',
    },
    csvGroupArea: {
      de: 'Bereich',
      en: 'Area',
      fr: 'Zone',
    },
    csvSignatur: {
      de: 'Signatur',
      en: 'Sign',
      fr: 'Signature',
    },
    csvLocation: {
      de: 'Koordinaten',
      en: 'Coordinates',
      fr: 'Coordonnées',
    },
    csvCentroid: {
      de: 'Koordinaten Zentrum',
      en: 'Centroid',
      fr: 'Centre coordonnées',
    },
    csvSize: {
      de: 'Grösse',
      en: 'Size',
      fr: 'Dimension',
    },
    csvReportNumber: {
      de: 'Meldenummer',
      en: 'Report number',
      fr: 'Numéro de rapport',
    },
    csvLabel: {
      de: 'Bezeichnung',
      en: 'Label',
      fr: 'Désignation',
    },
    csvDescription: {
      de: 'Beschreibung',
      en: 'Description',
      fr: 'Description',
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
    protocolExport: {
      de: 'ProtokollExport',
      en: 'ProtocolExport',
      fr: 'ExportationProtocole',
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
    createdAt: {
      de: 'Erstelldatum',
      en: 'Created at',
      fr: 'Date de création',
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
    docLoginTitle: {
      de: 'Login',
      en: 'Login',
      fr: 'Connexion',
    },
    docLogin: {
      de: `Melden Sie sich <strong>über Ihre Zivilschutzorganisation</strong> an. Wenden Sie sich dafür an diese, falls Sie Anmeldeinformationen benötigen.<br/>
  Zusätzlich besteht die Möglichkeit, die Applikation in einer <strong>Gast-Sitzung</strong> zu testen. Bitte beachten Sie, dass diese jeden Abend um 00:00 Uhr <strong>zurückgesetzt wird</strong> und <strong>nicht für den Ernstfall geeignet</strong> ist.`,
      en: `Log in <strong>via your civil protection organization</strong>. Please contact them if you need login information.<br/>
    In addition, you can test the application in a <strong>guest session</strong>. Please note that this is <strong>reset every evening at 00:00</strong> and <strong>not suitable for the real emergency</strong>.`,
      fr: `Connectez-vous <strong>via votre organisation de protection civile</strong>. Veuillez contacter cette dernière si vous avez besoin d'informations de connexion.<br/>
    En outre, vous pouvez tester l'application dans une <strong>session d'invité</strong>. Veuillez noter que celle-ci est <strong>réinitialisée chaque soir à 00:00</strong> et <strong>non adaptée à l'urgence réelle</strong>.`,
    },
    docCreateOrLoadTitle: {
      de: 'Ereignis auswählen',
      en: 'Select event',
      fr: 'Sélectionner un événement',
    },

    docCreateOrLoad: {
      de: '<p> Auf diesem Bildschirm können Sie <strong>bereits erstellte Ereignisse bearbeiten</strong> oder <strong>neue Ereignisse erstellen</strong>. Die Ereignisse und deren Lagekarten werden <strong>in Echtzeit unter allen Benutzern synchronisiert</strong>.</p>',
      fr: '<p> Sur cet écran, vous pouvez <strong>modifier des événements déjà créés</strong> ou <strong>créer de nouveaux événements</strong>. Les événements et leurs cartes de localisation sont <strong>synchronisés en temps réel avec tous les utilisateurs</strong>.</p>',
      en: '<p> On this screen you can <strong>edit already created events</strong> or <strong>create new events</strong>. The events and their location maps are <strong>synchronized in real-time among all users</strong>.</p>',
    },
    docMainViewTitle: {
      de: 'Kartenansicht',
      en: 'Map view',
      fr: 'Vue de la carte',
    },

    docMapMenuTitle: {
      de: 'Kartenmenü',
      en: 'Map menu',
      fr: 'Menu de la carte',
    },
    docMapMenu: {
      de: 'Die Funktionen des Kartenmenüs sind von oben nach unten:<ul><li>Umschalten zwischen History- / Lese-Modus und Zeichnungsmodus</li><li>Sprache auswählen</li><li>Karte Drucken</li><li>Protokoll der auf der Karte dargestellten Zeichnungen anzeigen oder exportieren</li><li>Hilfefunktion öffnen</li><li>Ausloggen oder Ereignis wechseln</li></ul>',
      fr: "Les fonctions du menu de la carte sont de haut en bas:<ul><li>Basculer entre le mode Histoire / Lecture et le mode de dessin</li><li>Sélectionner la langue</li><li>Imprimer la carte</li><li>Afficher ou exporter le journal des dessins affichés sur la carte</li><li>Ouvrir l'aide</li><li>Se déconnecter ou changer d'événement</li></ul>",
      en: 'The functions of the map menu are from top to bottom:<ul><li>Switch between History / Read-Only mode and Drawing mode</li><li>Select language</li><li>Print map</li><li>Show or export log of drawings displayed on the map</li><li>Open help</li><li>Log out or change event</li></ul>',
    },
    docMainView: {
      de: `<p>Die <strong>Lagekarte</strong> stellt die <strong>Hauptansicht</strong> der ZS Karten App dar. Wichtige Informationen und Funktionen sind hier zugänglich:
      <ol>
        <li>Die ZSO und das aktuell ausgewählte Ereignis</li>
        <li>Die Möglichkeit Orte, Straßen und Gebäude auf der Karte mittels <strong>Suchfunktion</strong> zu finden</li>
        <li>Die aktuelle Zeit wird angezeigt, das Hamburgersymbol öffnet das <strong>Kartenmenü</strong></li>
        <li>Zugriff auf verschiedene <strong>Kartenfunktionen</strong></li>
        <li>Möglichkeit zum Hinzufügen von <strong>Zeichnungselementen</strong> auf der Karte</li>
      </ol>
      </p>`,
      fr: `<p>La <strong>carte</strong> représente la <strong>vue principale</strong> de l'application de cartes ZS. Les informations et fonctions importantes sont accessibles ici:
      <ol>
        <li>L'organisation de défense civile et l'événement sélectionné</li>
        <li>La <strong>fonction de recherche</strong>, qui permet de trouver des points sur la carte (lieux, rues, bâtiments)</li>
        <li>Ici est affiché l'<strong>heure actuelle</strong>, cliquez sur l'icône de hamburger pour ouvrir le menu de la carte</li>
        <li>Fonctionnalités de la carte</li>
        <li>Fonctionnalités de dessin, ajout d'éléments à la carte</li>
      </ol>
      </p>`,
      en: `<p>The <strong>map</strong> represents the <strong>main view</strong> of the ZS map app. Important information and functions are accessible here:
      <ol>
        <li>Here you can see the civil defense organization and the selected event</li>
        <li>The <strong>search function</strong>, which allows you to find points on the map (places, streets, buildings)</li>
        <li>Here the <strong>current time</strong> is displayed, click on the hamburger icon to open the map menu</li>
        <li>Map functions</li>
        <li>Drawing functions, add elements to the map</li>
      </ol>
      </p>`,
    },

    docSearch: {
      de: '<p>Die <strong>Suche</strong> kann dazu verwendet werden, <strong>Adressen und andere Orte</strong> zu finden und mittels Selektion den entsprechenden Ort auf der Karte mit einem <strong>Standortmarker</strong> hervorzuheben.</p>',
      fr: "<p>La <strong>recherche</strong> peut être utilisée pour trouver des <strong>adresses et d'autres lieux</strong> et pour mettre en évidence le lieu correspondant sur la carte à l'aide d'un <strong>marqueur de position</strong> en le sélectionnant.</p>",
      en: '<p>The <strong>search</strong> can be used to find <strong>addresses and other places</strong> and to highlight the corresponding place on the map using a <strong>location marker</strong> by selecting it.</p>',
    },

    docMarker: {
      de: '<p>Ein Klick auf den Standortmarker zeigt die beiden Symbole, das <strong>X-Symbol</strong> entfernt den Standortmarker von der Karte. Mit dem <strong>Sternsymbol</strong> wird der Zeichnungsdialog geöffnet und es kann an dem markierten Ort eine Signatur eingefügt werden.</p>',
      fr: "<p>Un clic sur le marqueur de position affiche les deux icônes, l'icône <strong>X</strong> supprime le marqueur de position de la carte. Avec l'icône <strong>étoile</strong>, la boîte de dialogue de dessin s'ouvre et vous pouvez insérer une signature à l'endroit marqué.</p>",
      en: '<p>A click on the location marker displays the two icons, the <strong>X icon</strong> removes the location marker from the map. With the <strong>star icon</strong>, the drawing dialog opens and you can insert a signature at the marked location.</p>',
    },

    docDraw: {
      de: `<p>Dieses Menü ermöglicht das Zeichnen verschiedener Elemente auf die Karte:</p>
            <ol>
            <li>Text: Ein Dialogfeld wird geöffnet, in dem Sie einen Text definieren können. Nach dem Schließen des Dialogfelds kann eine Linie auf der Karte gezeichnet werden, indem auf die Karte geklickt wird (beenden durch Doppelklick). Der Text wird anschließend angezeigt und unten links erscheint die Auswahlansicht.</li>
            <li>Polygon: Sie können direkt mit dem Zeichnen einer Fläche beginnen (später kann über die Auswahlansicht eine Signatur definiert werden, falls gewünscht).</li>
            <li>Linie: Analog zum Polygon können Sie direkt mit dem Zeichnen einer Linie beginnen. Eine Linie kann über die Auswahlansicht auch in einen Pfeil umgewandelt werden.</li>
            <li>Freihand: Sie können direkt mit dem Zeichnen in Freihand beginnen. </li>
            <li>Signatur: Es öffnet sich ein Dialogfeld zur Auswahl der Signatur - nach der entsprechenden Auswahl kann (je nach Signatur) ein Punkt, eine Linie oder eine Fläche (Polygon) gezeichnet werden.</li>
            </ol>
            </p>`,
      fr: `<p>Ce menu permet de dessiner différents éléments sur la carte:</p>
            <ol>
            <li>Texte: Une boîte de dialogue s'ouvre dans laquelle vous pouvez définir un texte. Après la fermeture de la boîte de dialogue, vous pouvez dessiner une ligne sur la carte en cliquant sur la carte (terminer par un double clic). Le texte s'affiche ensuite et la vue de sélection apparaît en bas à gauche.</li>
            <li>Polygone: Vous pouvez commencer à dessiner une surface directement (vous pouvez définir une signature via la vue de sélection, si vous le souhaitez).</li>
            <li>Ligne: De la même manière que pour le polygone, vous pouvez commencer à dessiner une ligne directement. Une ligne peut également être convertie en flèche via la vue de sélection.</li>
            <li>Libre: Vous pouvez commencer à dessiner librement directement.</li>
            <li>Signature: Une boîte de dialogue s'ouvre pour sélectionner la signature - après la sélection appropriée, vous pouvez dessiner un point, une ligne ou une surface (polygone) (selon la signature).</li>
            </ol>
            </p>`,
      en: `<p>This menu allows you to draw different elements on the map:</p>
            <ol>
            <li>Text: A dialog box opens in which you can define a text. After closing the dialog box, you can draw a line on the map by clicking on the map (finish by double-click). The text is then displayed and the selection view appears in the bottom left.</li>
            <li>Polygon: You can start drawing a surface directly (you can define a signature via the selection view, if desired).</li>
            <li>Line: In the same way as for the polygon, you can start drawing a line directly. A line can also be converted into an arrow via the selection view.</li>
            <li>Free: You can start drawing freely directly.</li>
            <li>Signature: A dialog box opens to select the signature - after the appropriate selection, you can draw a point, a line or a surface (polygon) (depending on the signature).</li>
            </ol>
            </p>`,
    },
    docSymbolSelectionTitle: {
      de: 'Signaturauswahl',
      en: 'Symbol selection',
      fr: 'Séléction de symbole',
    },
    docSymbolSelection: {
      de: '<p>In dieser Ansicht können <strong>Signaturen</strong> ausgewählt werden. Nutzen Sie die <strong>Such- und Filterfunktion</strong> um Symbole einfacher zu finden. <strong>Kürzlich verwendete Signaturen</strong> werden hier angezeigt. Die dritte Spalte der Tabelle enthält Icons, die den <strong>Typen der Signatur</strong> darstellen. Es gibt: normale Signaturen (Stern), Polygone (vier Qudrate) und Linien (gezackte Linie).</p>',
      fr: '<p>Dans cette vue, vous pouvez sélectionner des <strong>symboles</strong>. Utilisez la <strong>fonction de recherche et de filtrage</strong> pour trouver des symboles plus facilement. Les <strong>derniers symboles utilisés</strong> sont affichés ici. La troisième colonne du tableau contient des icônes qui représentent le <strong>type de symbole</strong>. Il y a: symboles normaux (étoile), polygones (quatre carrés) et lignes (ligne ondulée).</p>',
      en: '<p>In this view, you can select <strong>symbols</strong>. Use the <strong>search and filter function</strong> to find symbols more easily. <strong>Recently used symbols</strong> are displayed here. The third column of the table contains icons that represent the <strong>type of symbol</strong>. There are: normal symbols (star), polygons (four squares) and lines (wavy line).</p>',
    },
    docSelectionTitle: {
      de: 'Detailansicht der Zeichnung',
      en: 'Detail view of the drawing',
      fr: 'Vue détaillée du dessin',
    },
    docSelection: {
      de: '<p>Die Detailansicht öffnet sich, wenn ein gezeichnetes Element auf der Karte ausgewählt wird. Die Funktionen sind in verschiedene Untergruppen gruppiert. Von oben nach unten sind das:</p><p><strong>Name der Zeichnung ändern</strong></p><p><strong>Farbauswahlmodus ändern (Aktivierung ermöglicht stufenlose Farbauswahl)</strong></p><p><strong>Farbe der Zeichnung ändern</strong></p><p><strong>Zeichnung auf Karte fixieren (Zeichnung kann nicht mehr bewegt werden)</strong></p><p><strong>Namen der Zeichnung auf Karte anzeigen</strong></p><p><strong>Beschreibung:</strong><ul><li>Beschreibung hinzufügen. Die Beschreibung dient zur Dokumentation und ist auf der Karte nicht sichtbar, erscheint jedoch im Export.</li></ul></p><p><strong>Signatur:</strong><ul><li>Signatur hinzufügen/ersetzen</li><li>Signatur auf Karte verstecken</li><li>Größe der Signatur auf Karte ändern</li><li>Versatz der Signatur auf Karte ändern (Diese Funktion kann hilfreich sein, wenn sich mehrere Signaturen am gleichen Ort befinden)</li><li>Signatur rotieren</li><li>Deckkraft der Signatur ändern</li></ul></p><p><strong>Linie:</strong><ul><li>Linientyp definieren</li><li>Liniendicke definieren</li><li>Linie mit Pfeil versehen</li></ul></p><p><strong>Funktionen:</strong><ul><li>In den Vordergrund</li><li>In den Hintergrund</li><li>Zeichnung an Koordinaten verschieben</li></ul></p><p><strong>Kopie der Zeichnung anfertigen.</strong> Diese Funktion ist nur für Signaturen verfügbar. Die Signatur kann anschließend auf der Karte eingefügt werden.</p><p><strong>Signatur löschen</strong></p><p>Bitte beachten Sie, dass je nach Kontext bestimmte Funktionen nicht verfügbar sind.</p>',
      fr: "<p>La vue détaillée s'ouvre lorsque vous sélectionnez un élément dessiné sur la carte. Les fonctions sont regroupées en différentes sous-groupes. De haut en bas, ce sont:</p><p><strong>Changer le nom du dessin</strong></p><p><strong>Changer le mode de sélection de la couleur (l'activation permet une sélection de couleur continue)</strong></p><p><strong>Changer la couleur du dessin</strong></p><p><strong>Fixer le dessin sur la carte (le dessin ne peut plus être déplacé)</strong></p><p><strong>Afficher le nom du dessin sur la carte</strong></p><p><strong>Description:</strong><ul><li>Ajouter une description. La description sert à la documentation et n'est pas visible sur la carte, mais apparaît dans l'export.</li></ul></p><p><strong>Symbole:</strong><ul><li>Ajouter / remplacer le symbole</li><li>Masquer le symbole sur la carte</li><li>Modifier la taille du symbole sur la carte</li><li>Modifier le décalage du symbole sur la carte (Cette fonction peut être utile si plusieurs symboles se trouvent au même endroit)</li><li>Faire pivoter le symbole</li><li>Modifier l'opacité du symbole</li></ul></p><p><strong>Ligne:</strong><ul><li>Définir le type de ligne</li><li>Définir l'épaisseur de la ligne</li><li>Marquer la ligne avec une flèche</li></ul></p><p><strong>Fonctions:</strong><ul><li>Mettre au premier plan</li><li>Mettre au dernier plan</li><li>Déplacer le dessin aux coordonnées</li></ul></p><p><strong>Copier le dessin.</strong> Cette fonction est uniquement disponible pour les symboles. Le symbole peut ensuite être inséré sur la carte.</p><p><strong>Supprimer le symbole</strong></p><p>Veuillez noter que certaines fonctions ne sont pas disponibles dans certains contextes.</p>",
      en: '<p>The detailed view opens when a drawn element on the map is selected. The functions are grouped in different subgroups. From top to bottom, these are:</p><p><strong>Change the name of the drawing</strong></p><p><strong>Change the color selection mode (activation allows for continuous color selection)</strong></p><p><strong>Change the color of the drawing</strong></p><p><strong>Fix the drawing on the map (the drawing can no longer be moved)</strong></p><p><strong>Show the name of the drawing on the map</strong></p><p><strong>Description:</strong><ul><li>Add a description. The description serves for documentation and is not visible on the map, but appears in the export.</li></ul></p><p><strong>Symbol:</strong><ul><li>Add / replace the symbol</li><li>Hide the symbol on the map</li><li>Change the size of the symbol on the map</li><li>Change the offset of the symbol on the map (This function can be useful if several symbols are located at the same place)</li><li>Rotate the symbol</li><li>Change the opacity of the symbol</li></ul></p><p><strong>Line:</strong><ul><li>Define the line type</li><li>Define the line thickness</li><li>Mark the line with an arrow</li></ul></p><p><strong>Functions:</strong><ul><li>Bring to the front</li><li>Bring to the back</li><li>Move the drawing to the coordinates</li></ul></p><p><strong>Copy the drawing.</strong> This function is only available for symbols. The symbol can then be inserted on the map.</p><p><strong>Delete the symbol</strong></p><p>Please note that certain functions are not available in certain contexts.</p>',
    },
    docMapFunctionsTitle: {
      de: 'Kartenfunktionen',
      fr: 'Fonctions de la carte',
      en: 'Map functions',
    },
    docMapFunctions: {
      de: 'Die Kartenfunktionen von oben nach unten sind: <ul><li>Hineinzoomen</li><li>Herauszoomen</li><li>Ebenen: Hier kann die Art der Karte verändert werden und es können weitere Ebenen überlagert und ein- und ausgeblendet werden.</li><li>Filter: Hier können Zeichnungen entsprechend Kategorie oder Typ ein- und ausgeblendet werden.</li><li>Ortungsfunktion: Ihr Standort wird auf der Karte angezeigt und die Karte wird auf diesen Standort zentriert.</li></ul>',
      fr: 'Les fonctions de la carte de haut en bas sont: <ul><li>Zoom avant</li><li>Zoom arrière</li><li>Niveaux: Ici, vous pouvez changer le type de carte et superposer et afficher ou masquer des niveaux supplémentaires.</li><li>Filtres: Ici, vous pouvez afficher ou masquer les dessins en fonction de la catégorie ou du type.</li><li>Fonction de localisation: Votre emplacement est affiché sur la carte et la carte est centrée sur cet emplacement.</li></ul>',
      en: 'The map functions from top to bottom are: <ul><li>Zoom in</li><li>Zoom out</li><li>Layers: Here you can change the map type and overlay and show or hide additional layers.</li><li>Filters: Here you can show or hide drawings according to category or type.</li><li>Location function: Your location is displayed on the map and the map is centered on this location.</li></ul>',
    },
    docQuickFunctionsTitle: {
      de: 'Schnellfunktionen',
      fr: 'Fonctions rapides',
      en: 'Quick functions',
    },
    docQuickFunctions: {
      de: 'Klicken Sie auf eine <strong>Zeichnung</strong> auf der Karte, um die <strong>Schnellfunktionen</strong> anzuzeigen. Diese beinhalten: <ul><li>Zeichnung oder Ankerpunkt löschen</li><li>Zeichnung <strong>kopieren</strong>: Klicken Sie erneut auf die Karte, um die <strong>Kopie</strong> der Zeichnung einzufügen</li><li>Signatur <strong>rotieren</strong></li></ul>',
      fr: "Cliquez sur un <strong>dessin</strong> sur la carte pour afficher les <strong>fonctions rapides</strong>. Cela comprend: <ul><li>Supprimer le dessin ou le point d'ancrage</li><li>Copier le dessin: Cliquez à nouveau sur la carte pour insérer la <strong>copie</strong> du dessin</li><li>Rotation de la signature</li></ul>",
      en: 'Click on a <strong>drawing</strong> on the map to display the <strong>quick functions</strong>. This includes: <ul><li>Delete the drawing or anchor point</li><li>Copy the drawing: Click again on the map to insert the <strong>copy</strong> of the drawing</li><li>Rotate the signature</li></ul>',
    },
    docExpertIntroTitle: {
      de: 'Standard Ansicht vs Experten Ansicht',
      fr: 'Default view vs Expert view',
      en: "Vue générale vs Point de vue d'expert",
    },
    docExpertIntro: {
      de: `Die Standard Ansicht ist die welche normalerweise verwendet wird.<br>
          In dieser Ansicht sind alle Dinge möglich um mit Basiskarten, Ebenen, Favoriten und den vordefinierten Verfügbare Ebenen zu arbeiten.<br>
          <br>
          Die Experten Ansicht ist für die gedacht, welche spezielle Map Layer hinzufügen wollen.<br>
          Diese Spezielle Ansicht ermöglicht es:
          <ul>
            <li>externe WMS / WMTS Quellen zu definieren</li>
            <li>WMS/WMTS Ebenen zu konfigurieren</li>
            <li>externe GeoJSON Ebenen hinzuzufügen</li>
            <li>externe CSV Ebenen hinzuzufügen</li>
            <li>Aktive Ebenen auf Operation persistieren</li>
            <li>Default Ebenen Favoriten für die Organisation zu setzen</li>
          </ul>`,
      fr: `La vue par défaut est celle qui est normalement utilisée.<br>
          Dans cette vue, il est possible de travailler avec des cartes de base, des couches, des favoris et des couches prédéfinies disponibles.<br>
          <br>
          La vue expert est destinée à ceux qui souhaitent ajouter des couches cartographiques spéciales.<br>
          Cette vue spéciale permet de :
          <ul>
            <li>définir des sources WMS / WMTS externes</li>
            <li>configurer des couches WMS/WMTS</li>
            <li>ajouter des couches GeoJSON externes</li>
            <li>ajouter des couches CSV externes</li>
            <li>persister les couches actives sur l'opération</li>
            <li>définir des couches favorites par défaut pour l'organisation</li>
          </ul>`,
      en: `The default view is the one normally used.<br>
          In this view, all things are possible to work with base maps, layers, favorites and the predefined available layers.<br>
          <br>
          The expert view is intended for those who want to add special map layers.<br>
          This special view allows:
          <ul>
            <li>defining external WMS / WMTS sources</li>
            <li>configuring WMS/WMTS layers</li>
            <li>adding external GeoJSON layers</li>
            <li>adding external CSV layers</li>
            <li>persisting active layers on operation</li>
            <li>setting default layer favorites for the organization</li>
          </ul>`,
    },
    docExpertWmsSourceTitle: {
      de: 'WMS / WMTS Quellen',
      fr: 'WMS/WMTS Sources',
      en: "sources WMS/WMTS",
    },
    docExpertWmsSourceButton: {
      de: `Wenn die Experten Ansicht aktiv ist, wird unter "Verfügbare Ebenen" neben dem "Ebenen Quelle" dropdown ein editier Symbol / Button angezeigt(1)`,
      fr: `Lorsque la vue expert est active, un symbole/bouton d'édition s'affiche à côté du menu déroulant "Source de couche" sous "Couches disponibles" (1)`,
      en: `When the expert view is active, an edit symbol/button is displayed next to the "Layer Source" dropdown under "Available Layers" (1)`,
    },
    docExpertWmsSource: {
      de: `Durch den klick darauf erhält man die Möglichkeit über "Quelle auswählen"(1) eine bestehende, als Öffentlich markierte (oder eine eigene Gespeicherte), Quelle zur aktuellen Ansicht hinzuzufügen.<br>
          Alternativ kann man über "Neue Quelle Hinzufügen"(2) die Informationen eines WMS / WMTS Anbieters hinterlegen.`,
      fr: `En cliquant dessus, on a la possibilité d'ajouter une source existante, marquée comme publique (ou une source personnelle sauvegardée) à la vue actuelle via "Sélectionner la source" (1).<br>
          Alternativement, on peut saisir les informations d'un fournisseur WMS / WMTS via "Ajouter une nouvelle source" (2).`,
      en: `By clicking on it, you have the option to add an existing source, marked as public (or a saved personal source) to the current view via "Select source" (1).<br>
          Alternatively, you can enter the information of a WMS / WMTS provider via "Add new source" (2).`,
    },
    docExpertWmsSourceDetails: {
      de: `Nachdem man eine vorhandene Quelle oder eine Neue hinzugefüght hat, ist diese im Dropdown(1) ausgewählt und die Details der Quelle werden angezeigt.<br>
          Man kann über das Dropdown weitere Quellen hinzufügen oder eine auswählen um dessen Details zu sehen.<br>
          Wenn man auf [OK](2) klickt werden die hinzugefügten / geänderten Quellen unter "Verfügbare Ebenen" in den "Ebenen Quelle" aktualisiert.<br>
          <br>
          Wenn man eine neue Quelle angelegt hat, müssen die Felder entsprechend gefüllt werden.<br>
          Es muss darauf geachtet werden das der richtige "Ebenentype"(3) ausgewählt wird, da die Verarbeitung der Capabilities und daraus die verfügbaren Map-Layer für die Typen unterschiedlich sind.<br>
          Wenn bei der "Quell-URL" nur die Haupt domain/URL ohne den Capabilities Teil angegeben wird, ergänzt das System den Capabilities Teil automatisch.<br>
          Die effektiv verwendete URL wird beim verlassen des Feldes darunter angezeigt/aktualisert(4). Sollte diese nicht den Infos des Anbieters entsprechen, muss die volle URL zu den Capabilities angegeben werden.<br>
          <br>
          Alle WMS / WMTS Anbieter haben entsprechende Copyright Bedingungen, welche sagen unter welchen Bedingungen die Services gebraucht werden dürfen.<br>
          Viele Kantonale Anbieter sind Kostenlos und daher hier verwendbar, sie verlangen aber die Nennung der entsprechenden "Quellenabgabe"(5).<br>
          Hier können die geforderten Texte mit entsprecheder Verlinkung gemäss Anbieter hinterlegt werden.<br>
          <br>
          Wenn die Copyright Bedingungen des Anbieters eine generelle Nutzung oder eine welche mit ZS Karte kompatibel ist zulassen, kann "Öffentliche Quelle"(6) aktiviert werden damit andere ZSO auch auf diese Quelle zugreiffen können.<br>
          <br>
          Wurde versehentlich eine neue Quelle angelegt, oder wird eine ausgewählte nicht mehr gebraucht kann sie über [entfernen](7) wieder aus den aktiven Quellen gelöscht werden.`,
      fr: `Après avoir ajouté une source existante ou une nouvelle, celle-ci est sélectionnée dans le menu déroulant (1) et les détails de la source sont affichés.<br>
          On peut ajouter d'autres sources via le menu déroulant ou en sélectionner une pour voir ses détails.<br>
          En cliquant sur [OK] (2), les sources ajoutées / modifiées sont mises à jour dans "Source de couche" sous "Couches disponibles".<br>
          <br>
          Si on a créé une nouvelle source, les champs doivent être remplis en conséquence.<br>
          Il faut veiller à sélectionner le bon "Type de couche" (3), car le traitement des capacités et les couches cartographiques disponibles qui en résultent sont différents pour les types.<br>
          Si seul le domaine/URL principal sans la partie Capabilities est spécifié dans "URL source", le système complète automatiquement la partie Capabilities.<br>
          L'URL effectivement utilisée est affichée/mise à jour (4) lorsqu'on quitte le champ. Si celle-ci ne correspond pas aux informations du fournisseur, l'URL complète des Capabilities doit être spécifiée.<br>
          <br>
          Tous les fournisseurs WMS / WMTS ont des conditions de copyright correspondantes, qui indiquent dans quelles conditions les services peuvent être utilisés.<br>
          De nombreux fournisseurs cantonaux sont gratuits et donc utilisables ici, mais ils exigent la mention de l'"Attribution de la source" correspondante (5).<br>
          Les textes requis avec les liens correspondants selon le fournisseur peuvent être saisis ici.<br>
          <br>
          Si les conditions de copyright du fournisseur permettent une utilisation générale ou une utilisation compatible avec ZS Karte, "Source publique" (6) peut être activé pour que d'autres ZSO puissent également accéder à cette source.<br>
          <br>
          Si une nouvelle source a été créée par erreur ou si une source sélectionnée n'est plus nécessaire, elle peut être supprimée des sources actives via [supprimer] (7).`,
      en: `After adding an existing source or a new one, it is selected in the dropdown (1) and the details of the source are displayed.<br>
          You can add more sources via the dropdown or select one to see its details.<br>
          Clicking on [OK] (2) updates the added / modified sources in "Layer Source" under "Available Layers".<br>
          <br>
          If you have created a new source, the fields must be filled in accordingly.<br>
          Care must be taken to select the correct "Layer type" (3), as the processing of capabilities and the resulting available map layers are different for the types.<br>
          If only the main domain/URL without the Capabilities part is specified in "Source URL", the system automatically completes the Capabilities part.<br>
          The effectively used URL is displayed/updated (4) when leaving the field. If this does not correspond to the provider's information, the full URL to the Capabilities must be specified.<br>
          <br>
          All WMS / WMTS providers have corresponding copyright conditions, which state under what conditions the services may be used.<br>
          Many cantonal providers are free and therefore usable here, but they require the mention of the corresponding "Source attribution" (5).<br>
          The required texts with corresponding links according to the provider can be entered here.<br>
          <br>
          If the provider's copyright conditions allow general use or one that is compatible with ZS Karte, "Public source" (6) can be activated so that other ZSOs can also access this source.<br>
          <br>
          If a new source was created by mistake, or if a selected one is no longer needed, it can be deleted from the active sources via [remove] (7).`,
    },
    docExpertWmsLayersTitle: {
      de: 'WMS/WMTS Ebenen konfigurieren',
      fr: 'Configurer les couches WMS/WMTS',
      en: 'Configure WMS/WMTS layers',
    },
    docExpertAvailableLayers: {
      de: `Wenn spezielle Ebenen Quellen hinzugefügt wurden, werden dessen Ebenen aus den Capabilities ausgelesen und unter "Verfügbare Ebenen"(1) entspechend aufgelistet(2).<br>
          Über "Ebenen Quelle"(3) kann die Anzeige der Ebenen entsprechend auf spezifische Quellen und über das "Filter"(4) Feld weiter eingeschränkt / durchsucht werden.`,
      fr: `Lorsque des sources de couches spéciales ont été ajoutées, leurs couches sont lues à partir des capacités et listées en conséquence sous "Couches disponibles" (1) (2).<br>
          L'affichage des couches peut être limité à des sources spécifiques via "Source de couche" (3) et peut être davantage restreint / recherché via le champ "Filtre" (4).`,
      en: `When special layer sources have been added, their layers are read from the capabilities and listed accordingly under "Available Layers" (1) (2).<br>
          The display of layers can be limited to specific sources via "Layer Source" (3) and can be further restricted / searched via the "Filter" (4) field.`,
    },
    docExpertSelectedLayers: {
      de: `Ausgewählte/angeklickte Ebenen werden automatisch unter "Ebenen"(1) hinzugefügt.<br>
          In der Experten Ansicht wird bei den Ebenen ein zusätzliches Zahnrad(2) Symbol angezeigt, welches die Konfigurations Ansicht der WMS Ebene öffnen Läst.<br>
          Bei WMTS Ebenen (oder standard Ebenen der GeoAdmin Quelle) gibt es kein Zahnrad, da WMTS Ebenen per Definition nicht Konfigurierbar sind, da es sich um fixe vorgerenderte Bilder/Tiles handelt.`,
      fr: `Les couches sélectionnées/cliquées sont automatiquement ajoutées sous "Couches" (1).<br>
          Dans la vue expert, un symbole d'engrenage supplémentaire (2) est affiché pour les couches, qui ouvre la vue de configuration de la couche WMS.<br>
          Pour les couches WMTS (ou les couches standard de la source GeoAdmin), il n'y a pas d'engrenage, car les couches WMTS ne sont par définition pas configurables, s'agissant d'images/tuiles pré-rendues fixes.`,
      en: `Selected/clicked layers are automatically added under "Layers" (1).<br>
          In the expert view, an additional gear (2) symbol is displayed for the layers, which opens the configuration view of the WMS layer.<br>
          For WMTS layers (or standard layers of the GeoAdmin source), there is no gear, as WMTS layers are by definition not configurable, being fixed pre-rendered images/tiles.`,
    },
    docExpertWmsLayers: {
      de: `In der Konfigurations Ansicht der WMS Ebene, werden die Informationen angezeigt welche aus den Capabilities extrahiert wurden.<br>
          Alle Ebenen haben einen "Ebenennamen"(1), welche die Datenquelle bestimmt was auf den einzelnen Bilder/Kacheln angezeigt werden soll.<br>
          <br>
          Wurde eine Ebenen Konfiguration erstellt welche einen effektiven Mehrwert zur standard Ebene darstellt und man Potential sieht das andere ZSO diese auch Benutzen können/wollen, kann sie als "Öffentliche Quelle"(2) markiert werden, damit andere ZSO sie als "geteilten Ebenen" angezeigt bekommen.<br>
          Wenn die Konfiguration einer Ebene geändert wird(und vor allem wenn Öffentlich), sollte die Beschriftung entsprechend angepasst werden, um sie von der standard Ebene zu unterscheiden(3).<br>
          Unter "Ebenen Generierung"(4) kann angegeben werden ob die Bilder vom WMS "gekachelt" und dadurch wiederverwendbar generiert werden sollen oder "Vollbilld" welches den ganzen Kartenausschnitt/Bildschirm bei jedem zoomen / scollen neu generiert. (Aus performance Sicht macht die 2. Option nur Sinn, wenn die gekachelte variante Artefakte/fehldarstellungen bei den Kachel übergänge hat.)<br>
          "Kachelgrösse"(5) überschreibt bei der gekachelten(4) Generierung wie gross eine Kachel sein soll, höhere Zahlen bedeuten das weniger Kacheln gebraucht werden, die Einzelnen Kachel aber länger zum generieren braucht. Ohne Angabe wird der standard aus den Capabilities verwendet. (Die Zahl sollten als 2er Potenz (128,256,512...) angegeben werden, da viele Systeme darauf optimiert sind.)<br>
          Über "Inhaltstyp"(6) könnte das Format png/jpg/... der Generierung überschrieben werden.<br>
          Die Felder "Max / Min Skalennenner"(7/8) Steuern bei welchen Zoomstufen (aber über Angabe der Skala) ein Layer angezeigt (oder oft auch verfügbar) ist/werden soll<br>
          Zu guter letzt können auf den einzelnen Ebenen die Quellenagaben(9), aus der WMS Quelle, überschrieben werden, falls dafür spezielle Angaben nötig sind.`,
      fr: `Dans la vue de configuration de la couche WMS, les informations extraites des capacités sont affichées.<br>
          Toutes les couches ont un "Nom de couche" (1), qui détermine la source de données de ce qui doit être affiché sur les images/tuiles individuelles.<br>
          <br>
          Si une configuration de couche a été créée qui représente une valeur ajoutée effective par rapport à la couche standard et que l'on voit un potentiel pour que d'autres ZSO puissent/veulent également l'utiliser, elle peut être marquée comme "Source publique" (2), afin que d'autres ZSO la voient comme "couches partagées".<br>
          Lorsque la configuration d'une couche est modifiée (et surtout si elle est publique), l'étiquette doit être ajustée en conséquence pour la distinguer de la couche standard (3).<br>
          Sous "Génération de couche" (4), on peut spécifier si les images du WMS doivent être "tuilées" et donc générées de manière réutilisable ou "Image complète" qui régénère l'ensemble de la vue/écran de la carte à chaque zoom/défilement. (Du point de vue des performances, la 2ème option n'a de sens que si la version tuilée présente des artefacts/défauts d'affichage aux transitions des tuiles.)<br>
          "Taille des tuiles" (5) remplace la taille d'une tuile lors de la génération tuilée (4), des nombres plus élevés signifient que moins de tuiles sont nécessaires, mais que chaque tuile prend plus de temps à générer. Sans spécification, le standard des capacités est utilisé. (Le nombre devrait être donné comme une puissance de 2 (128,256,512...), car de nombreux systèmes sont optimisés pour cela.)<br>
          Le "Type de contenu" (6) pourrait remplacer le format png/jpg/... de la génération.<br>
          Les champs "Dénominateur d'échelle max / min" (7/8) contrôlent à quels niveaux de zoom (mais en spécifiant l'échelle) une couche est/doit être affichée (ou souvent aussi disponible)<br>
          Enfin, les attributions de source (9) de la source WMS peuvent être remplacées sur les couches individuelles si des spécifications spéciales sont nécessaires.`,
      en: `In the configuration view of the WMS layer, the information extracted from the capabilities is displayed.<br>
          All layers have a "Layer name" (1), which determines the data source of what should be displayed on the individual images/tiles.<br>
          <br>
          If a layer configuration has been created that represents an effective added value compared to the standard layer and one sees potential for other ZSOs to also be able to/want to use it, it can be marked as a "Public source" (2), so that other ZSOs see it as "shared layers".<br>
          When the configuration of a layer is changed (and especially if it's public), the label should be adjusted accordingly to distinguish it from the standard layer (3).<br>
          Under "Layer generation" (4), it can be specified whether the images from the WMS should be "tiled" and thus generated reusably or "Full image" which regenerates the entire map view/screen with each zoom/scroll. (From a performance point of view, the 2nd option only makes sense if the tiled version has artifacts/display errors at the tile transitions.)<br>
          "Tile size" (5) overrides how large a tile should be in the tiled (4) generation, higher numbers mean that fewer tiles are needed, but each individual tile takes longer to generate. Without specification, the standard from the capabilities is used. (The number should be given as a power of 2 (128,256,512...), as many systems are optimized for this.)<br>
          The "Content type" (6) could override the png/jpg/... format of the generation.<br>
          The fields "Max / Min scale denominator" (7/8) control at which zoom levels (but by specifying the scale) a layer is/should be displayed (or often also available)<br>
          Finally, the source attributions (9) from the WMS source can be overridden on the individual layers if special specifications are necessary.`,
    },
    docExpertWmsLayersGroup: {
      de: `Viele WMS Anbieter haben auch vordefinierte Gruppen, welche aus eine Liste von Unterebenen(10) besteht aber der einfachheitshalber über den Gruppennamen als "Ebenennamen"(1) referenziet werden können.<br>
          Es ist aber auch möglich eigentlich getrennte Ebenen über eine Komma separierte Liste der entsprechenden Ebenen anzugeben(7), welche dann als eine Kachel gerendert werden.<br>
          (Um diese Funktion zu verwenden/Ebenennamen überschreiben zu können, muss der Ebenentyp auf "WMS (custom)" geändert werden.)<br>
          Wenn man eine Gruppe verwenden aber einige "Unterebenen ausblenden"(10) möchte, kann dies über die entsprechende Option eingestellt werden. (Hier übernimmt die Logik intern das auflisten aller anzuzeigender Unterebene als Komma separierte Liste.)<br>
          <br>
          Bei WMS Gruppen gibt es die Option "Ebenen-Zeichenmodus"(11), hier macht der default Wert "zusammengeführte Ebenen" am meisten sinn, ändert man dies auf "aufgetrennte Ebenen" behandelt das System jede Unterebene als währe sie in der Ebenen Liste separat aufgenommen und fordert für jede ein eigenes Bild an. (Bei Gruppen mit viel Unterebenen belastet dies das WMS system und die Performance stark. Sinnvoll ist dies nur unter Umständen wenn viele unterschiedliche Kombinationen aus diesen gleichen WMS Ebenen regelmässig verwendet werden, da dann jede Ebene separat gecached werden kann.)<br>
          Bei Ebenen Gruppen kommt es vor das die Unterebenen intern mit eigenen min/max Skalennennern ausgestatet werden, welche jedoch nicht sichtbar sind / angezeigt werden. Werden bei solchen Gruppen einzelne Unterebenen ausgeblendet funktioniert diese filterung nicht mehr, da dann nicht die Gruppe sondern die einzelnen noch sichtbaren Ebenen referenziert/übergeben werden.`,
      fr: `De nombreux fournisseurs WMS ont également des groupes prédéfinis, qui consistent en une liste de sous-couches (10) mais peuvent être référencés simplement par le nom du groupe comme "Nom de couche" (1).<br>
          Il est également possible de spécifier des couches normalement séparées via une liste séparée par des virgules des couches correspondantes (7), qui sont ensuite rendues comme une seule tuile.<br>
          (Pour utiliser cette fonction/pouvoir remplacer les noms de couche, le type de couche doit être changé en "WMS (personnalisé)")<br>
          Si l'on veut utiliser un groupe mais "masquer certaines sous-couches" (10), cela peut être configuré via l'option correspondante. (Ici, la logique prend en charge en interne la liste de toutes les sous-couches à afficher sous forme de liste séparée par des virgules.)<br>
          <br>
          Pour les groupes WMS, il existe l'option "Mode de dessin des couches" (11), ici la valeur par défaut "couches fusionnées" a le plus de sens, si on change cela en "couches séparées", le système traite chaque sous-couche comme si elle était incluse séparément dans la liste des couches et demande une image séparée pour chacune. (Pour les groupes avec beaucoup de sous-couches, cela charge fortement le système WMS et les performances. Cela n'a de sens que dans des circonstances où de nombreuses combinaisons différentes de ces mêmes couches WMS sont régulièrement utilisées, car alors chaque couche peut être mise en cache séparément.)<br>
          Dans les groupes de couches, il arrive que les sous-couches soient équipées en interne de leurs propres dénominateurs d'échelle min/max, qui ne sont cependant pas visibles / affichés. Si des sous-couches individuelles sont masquées dans de tels groupes, ce filtrage ne fonctionne plus, car ce n'est plus le groupe qui est référencé/transmis mais les couches individuelles encore visibles.`,
      en: `Many WMS providers also have predefined groups, which consist of a list of sublayers (10) but can be referenced simply by the group name as "Layer name" (1).<br>
          It is also possible to specify normally separate layers via a comma-separated list of the corresponding layers (7), which are then rendered as one tile.<br>
          (To use this function/be able to override layer names, the layer type must be changed to "WMS (custom)")<br>
          If you want to use a group but "hide some sublayers" (10), this can be set via the corresponding option. (Here, the logic internally takes over listing all sublayers to be displayed as a comma-separated list.)<br>
          <br>
          For WMS groups, there is the option "Layer drawing mode" (11), here the default value "merged layers" makes the most sense, if you change this to "separated layers", the system treats each sublayer as if it were included separately in the layer list and requests a separate image for each. (For groups with many sublayers, this heavily loads the WMS system and performance. This only makes sense under circumstances where many different combinations of these same WMS layers are regularly used, as then each layer can be cached separately.)<br>
          In layer groups, it happens that the sublayers are internally equipped with their own min/max scale denominators, which are not visible / displayed, however. If individual sublayers are hidden in such groups, this filtering no longer works, as then not the group but the individual still visible layers are referenced/passed.`,
    },
    docExpertGeoJsonLayersTitle: {
      de: 'GeoJSON Ebene',
      fr: 'Couche GeoJSON',
      en: 'GeoJSON Layer',
    },
    docExpertNewLayer: {
      de: `In der Experten Ansicht hat es am Ende des Ebenen Blocks ein Button [Neue Ebene erstellen](1), über diesen können neue Ebenen unabhängig von WMS Quellen erstellt werden.<br>
          Nach klick auf den Button muss nun ausgewählt werden ob eine WMS Ebene mit freien Feldeingabe, ein GeoJSON Layer oder ein CSV Layer erstellt werden soll.`,
      fr: `Dans la vue expert, il y a un bouton [Créer une nouvelle couche] (1) à la fin du bloc de couches, qui permet de créer de nouvelles couches indépendamment des sources WMS.<br>
          Après avoir cliqué sur le bouton, il faut maintenant choisir si une couche WMS avec saisie libre de champs, une couche GeoJSON ou une couche CSV doit être créée.`,
      en: `In the expert view, there is a button [Create new layer] (1) at the end of the layer block, through which new layers can be created independently of WMS sources.<br>
          After clicking the button, you now have to select whether a WMS layer with free field input, a GeoJSON layer or a CSV layer should be created.`,
    },
    docExpertGeoJsonLayers: {
      de: `Bei Angabe der Quell-URL(1) muss entsprechend eine URL zu einer geojson Datei angeben werden, entsprechende Dateien müssen über einen Webserver / online Storage gehostet und ohne Login aufgerufen werden können.<br>
          Damit GeoJSON Daten auf einer Karte angezeigt werden können, muss konfiguriert werden wie die einzelnen 'Features' gezeichnet werden sollen, als "StilFormat"(2) werden die Formate "MapBox GL Style" und "OpenLayers Flat" unterstützt. Die Spezifikationen wie eine solche Style Datei aufgebaut werden muss, ist entsprechend verlinkt.<br> 
          Bei MapBox können in einer Spezifikation mehrer Styles definiert werden, daher muss der "Name der Stillquelle"(3) welcher verwendet werden soll angegeben werden.<br>
          Anschliessend kann bei "Stillquellentype"(4) angegeben werden ob die Style Infos ebenfalls über eine URL referenziert oder sie direkt in der Ebenen definition als Text hinterlegt werden soll.<br>
          <br>
          Für Beschreibungen zu "Ist die Ebene durchsuchbar?"(5) siehe "Ebenen durchsuchbar machen" weiter unten.
          Die restlichen Felder sind die gleichen wie bereits unter "WMS/WMTS Ebenen konfigurieren" beschrieben.`,
      fr: `Lors de la spécification de l'URL source (1), une URL vers un fichier geojson doit être fournie en conséquence, les fichiers correspondants doivent être hébergés sur un serveur web / stockage en ligne et pouvoir être appelés sans connexion.<br>
          Pour que les données GeoJSON puissent être affichées sur une carte, il faut configurer comment les 'features' individuelles doivent être dessinées, les formats "MapBox GL Style" et "OpenLayers Flat" sont pris en charge comme "Format de style" (2). Les spécifications sur la façon dont un tel fichier de style doit être structuré sont liées en conséquence.<br>
          Avec MapBox, plusieurs styles peuvent être définis dans une spécification, donc le "Nom de la source de style" (3) à utiliser doit être spécifié.<br>
          Ensuite, sous "Type de source de style" (4), on peut spécifier si les informations de style doivent également être référencées via une URL ou si elles doivent être stockées directement dans la définition de la couche sous forme de texte.<br>
          <br>
          Pour les descriptions de "La couche est-elle consultable ?" (5), voir "Rendre les couches consultables" ci-dessous.
          Les autres champs sont les mêmes que ceux déjà décrits sous "Configurer les couches WMS/WMTS".`,
      en: `When specifying the Source URL (1), a URL to a geojson file must be provided accordingly, corresponding files must be hosted on a web server / online storage and be callable without login.<br>
          For GeoJSON data to be displayed on a map, it must be configured how the individual 'features' should be drawn, the formats "MapBox GL Style" and "OpenLayers Flat" are supported as "Style Format" (2). The specifications on how such a style file must be structured are linked accordingly.<br>
          With MapBox, multiple styles can be defined in one specification, so the "Style source name" (3) to be used must be specified.<br>
          Subsequently, under "Style source type" (4), it can be specified whether the style information should also be referenced via a URL or whether it should be stored directly in the layer definition as text.<br>
          <br>
          For descriptions of "Is the layer searchable?" (5), see "Making layers searchable" below.
          The remaining fields are the same as already described under "Configuring WMS/WMTS layers".`,
    },
    docExpertCsvLayersTitle: {
      de: 'CSV Ebene',
      fr: 'Couche CSV',
      en: 'CSV Layer',
    },
    docExpertCsvLayers: {
      de: `Wenn bei der Erstellung einer neuen Ebene der Ebenentyp CSV ausgewählt wird, sind die gleichen Felder verfügbar wie bei GeoJSON, aber zusätzlich noch ein paar CSV spezifische.<br>
          CSV Ebenen sind eigenlich auch GeoJSON Ebenen, da sie beim Laden der Datei gemäss konfiguration in ein GeoJSON convertiert werden. Dabei wird jede Zeile zu einem GeoJSON Feature und die Spalten zu einem Feld/Eigenschaft davon.<br>
          <br>
          Damit die Konvertierung funktioniert muss bei "Trennzeichen"(1) angegeben werden mit welchem Zeichen die einzelnen Felder im CSV getrennt sind, normalerweise ist das Komma "," oder Semikolon ";".<br>
          Bei "Feldname der X-Koordinate"(2) bzw "Feldname der Y-Koordinate"(3) muss der Feldname/Titel der entsprechenden Spalte angegeben werden in welcher die Zahl steht.<br>
          Die Koordinaten können auf verschiedene Arten kodiert sein, daher muss angegebn werden welchr "Konfigurationscode für die Datenprojektion"(4) diese kodierung beschreibt.<br>
          Die in ZS Karte verwendeten standard Codes mit ihrem Verwendungskontext sind aufgeführt, weitere können auf <a href="https://epsg.io/">https://epsg.io/</a> gesucht werden, bzw. sind bei der Datenquelle zu prüfen/erfragen.<br>`,
      fr: `Lorsque le type de couche CSV est sélectionné lors de la création d'une nouvelle couche, les mêmes champs sont disponibles que pour GeoJSON, mais avec quelques champs spécifiques au CSV en plus.<br>
          Les couches CSV sont en fait aussi des couches GeoJSON, car elles sont converties en GeoJSON lors du chargement du fichier selon la configuration. Chaque ligne devient alors une entité GeoJSON et les colonnes deviennent un champ/propriété de celle-ci.<br>
          <br>
          Pour que la conversion fonctionne, il faut spécifier dans "Délimiteur" (1) le caractère qui sépare les différents champs dans le CSV, généralement la virgule "," ou le point-virgule ";".<br>
          Pour "Nom du champ de la coordonnée X" (2) et "Nom du champ de la coordonnée Y" (3), il faut indiquer le nom/titre du champ de la colonne correspondante où se trouve le nombre.<br>
          Les coordonnées peuvent être codées de différentes manières, il faut donc spécifier quel "Code de configuration pour la projection des données" (4) décrit ce codage.<br>
          Les codes standard utilisés dans ZS Karte avec leur contexte d'utilisation sont listés, d'autres peuvent être recherchés sur <a href="https://epsg.io/">https://epsg.io/</a>, ou doivent être vérifiés/demandés auprès de la source de données.<br>`,
      en: `When creating a new layer and the layer type CSV is selected, the same fields are available as for GeoJSON, but with a few additional CSV-specific ones.<br>
          CSV layers are actually also GeoJSON layers, as they are converted to GeoJSON when loading the file according to the configuration. Each row becomes a GeoJSON feature and the columns become a field/property of it.<br>
          <br>
          For the conversion to work, the "Delimiter" (1) must be specified with which character the individual fields in the CSV are separated, usually the comma "," or semicolon ";".<br>
          For "Field name of the X coordinate" (2) and "Field name of the Y coordinate" (3), the field name/title of the corresponding column in which the number is located must be specified.<br>
          The coordinates can be encoded in different ways, so it must be specified which "Data projection configuration code" (4) describes this encoding.<br>
          The standard codes used in ZS Karte with their usage context are listed, others can be searched for on <a href="https://epsg.io/">https://epsg.io/</a>, or need to be checked/inquired with the data source.<br>`,
    },
    docExpertCsvLayersFilter: {
      de: `Optimalerweise sind die CSV Dateien aufbereitet und unpassende/ungewollte Zeilen wurden entfernt.<br>
          Wurde dies nicht gemacht können unter "RegEx Muster für Daten Filter"(5) Felder und RegEx Pattern definiert werden um die Daten zu filtern.<br>
          Wenn für ein Feld nur 1 Wert zugelassen werden soll, kann einfach der Wert ins RegEx Feld geschrieben werden.<br>
          Sollen mehrer bestimmte Werte zugelassen werden, müssen diese in ein Klammern paar eingehüllt und mit einem Pipe "|" getrennt angegeben werden, z.B. "(wert1|wert2|wert3)"<br>
          Sollen alle Werte erlaubt werden welche mit "test_" beginnen kann dieser Teil mit einem all match ".*" ergänzt werden, z.B. "test_.*<br>
          Sollen alle Werte erlaubt werden welche mit "test_" enden kann diesem Teil ein all match ".*" vorangestellt werden, z.B. ".*_test<br>
          Sollen alle Werte erlaubt werden welche mit "_test" enden kann dies über ".*_test" definiert werden<br>
          Eine fixe Werte Liste und erlaubte prefixes/suffixes können auch kombiniert werden, z.B. "(wert1|wert2|wert3|test_.*|.*_test)"<br>
          Wenn alles zugelassen werden soll ausser bestimmt Werte kann dies über ein all match ".*" (oder ein prefix/suffix/Werteliste wie vorher) gefolgt von einem negativen Lookbehind (nur fixe Werte keine prefix/suffixe logiken) für jeden auszuschliessenden Wert angegeben werden, z.B. ".*(?<!wert1)(?<!wert2)" oder "test_.*(?<!test_temp)(?<!test_klein)"<br>
          <br>
          Zusätzlich können über "Gültiger Bereich"(6) min/max X und Y Koordinaten angegeben werden für welche Features/Zeilen zugelassen werden. Diese Werte müssen mit dem gleichen System kodiert sein wie die X/Y Felder der Zeilen selbst.<br>
          Wird keine Einschränkung definiert, filtert das System automatisch alles raus, welcher ausserhalb eines Quadrates über der Schweiz hinausgehen. Dies hat hauptsächlich den Grund fehlerhafte Daten (z.B. mit Koordinaten 0/0) auszuschliessen da dies zu Problemen führen können.<br>
          Die restlichen Felder sind die gleichen wie bereits unter "GeoJSON Ebene" bzw. "WMS/WMTS Ebenen konfigurieren" beschrieben.`,
      fr: `Idéalement, les fichiers CSV sont préparés et les lignes inappropriées/non désirées ont été supprimées.<br>
          Si cela n'a pas été fait, des champs et des modèles RegEx peuvent être définis sous "Modèle RegEx pour les filtres de données" (5) pour filtrer les données.<br>
          Si une seule valeur doit être autorisée pour un champ, la valeur peut simplement être écrite dans le champ RegEx.<br>
          Si plusieurs valeurs spécifiques doivent être autorisées, elles doivent être enveloppées dans une paire de parenthèses et séparées par un pipe "|", par exemple "(valeur1|valeur2|valeur3)"<br>
          Si toutes les valeurs commençant par "test_" doivent être autorisées, cette partie peut être complétée par un all match ".*", par exemple "test_.*<br>
          Si toutes les valeurs se terminant par "test_" doivent être autorisées, un all match ".*" peut être préfixé à cette partie, par exemple ".*_test<br>
          Si toutes les valeurs se terminant par "_test" doivent être autorisées, cela peut être défini par ".*_test"<br>
          Une liste de valeurs fixes et des préfixes/suffixes autorisés peuvent également être combinés, par exemple "(valeur1|valeur2|valeur3|test_.*|.*_test)"<br>
          Si tout doit être autorisé sauf certaines valeurs, cela peut être spécifié par un all match ".*" (ou un préfixe/suffixe/liste de valeurs comme précédemment) suivi d'un lookbehind négatif (uniquement des valeurs fixes, pas de logiques de préfixe/suffixe) pour chaque valeur à exclure, par exemple ".*(?<!valeur1)(?<!valeur2)" ou "test_.*(?<!test_temp)(?<!test_petit)"<br>
          <br>
          De plus, des coordonnées X et Y min/max peuvent être spécifiées via "Étendue de zone valide" (6) pour lesquelles les entités/lignes sont autorisées. Ces valeurs doivent être codées avec le même système que les champs X/Y des lignes elles-mêmes.<br>
          Si aucune restriction n'est définie, le système filtre automatiquement tout ce qui sort d'un carré au-dessus de la Suisse. Cela a principalement pour but d'exclure les données erronées (par exemple avec des coordonnées 0/0) car cela peut conduire à des problèmes.<br>
          Les autres champs sont les mêmes que ceux déjà décrits sous "Couche GeoJSON" ou "Configurer les couches WMS/WMTS".`,
      en: `Ideally, the CSV files are prepared and inappropriate/unwanted rows have been removed.<br>
          If this has not been done, fields and RegEx patterns can be defined under "RegEx pattern for data filters" (5) to filter the data.<br>
          If only 1 value should be allowed for a field, the value can simply be written into the RegEx field.<br>
          If several specific values should be allowed, these must be wrapped in a pair of parentheses and specified separated by a pipe "|", e.g. "(value1|value2|value3)"<br>
          If all values starting with "test_" should be allowed, this part can be supplemented with an all match ".*", e.g. "test_.*<br>
          If all values ending with "test_" should be allowed, an all match ".*" can be prefixed to this part, e.g. ".*_test<br>
          If all values ending with "_test" should be allowed, this can be defined via ".*_test"<br>
          A fixed value list and allowed prefixes/suffixes can also be combined, e.g. "(value1|value2|value3|test_.*|.*_test)"<br>
          If everything should be allowed except certain values, this can be specified via an all match ".*" (or a prefix/suffix/value list as before) followed by a negative lookbehind (only fixed values no prefix/suffix logics) for each value to be excluded, e.g. ".*(?<!value1)(?<!value2)" or "test_.*(?<!test_temp)(?<!test_small)"<br>
          <br>
          Additionally, min/max X and Y coordinates can be specified via "Valid area extent" (6) for which features/rows are allowed. These values must be encoded with the same system as the X/Y fields of the rows themselves.<br>
          If no restriction is defined, the system automatically filters out everything that goes outside a square over Switzerland. This is mainly to exclude erroneous data (e.g. with coordinates 0/0) as this can lead to problems.<br>
          The remaining fields are the same as already described under "GeoJSON Layer" or "Configuring WMS/WMTS layers".`,
    },
    docExpertSucheTitle: {
      de: 'Ebenen durchsuchbar machen',
      fr: 'Rendre les couches consultables',
      en: 'Making layers searchable',
    },
    docExpertSuche: {
      de: `Bei GeoJSON und CSV Ebenen kann die Option "Ist die Ebene durchsuchbar?"(1) aktiviert werden das man in diesen Ebenen suchen kann.
        Dadurch sind weitere infos nötig welche die Suche konfiguriert.<br>
        Bei der "Suchergebnis Beschriftungs-Maske"(2) wird Angegeben was angezeigt werden soll, wenn ein Treffer gefunden wird. Dafür können die Feldnamen der Eigenschaften eines Features im GeoJSON/Spalten im CSV über die Notation <code>\${FeldName}</code> angegeben werden.<br>
        Bei "RegEx Muster für Suche"(3) müssen Suchmuster definiert werden für welche die Suche in der GeoJSON/CSV Ebene suchen soll. Da ein Feature/Zeile in einem GeoJSON/CSV unterschiedliche Felder hat muss in der Suchmaske kodiert werden welcher Teil der Maske in welchem GeoJSON/CSV Feld vorkommen muss.<br>
        Dies wird über sogenannte benannte Gruppen im RegEx gemacht welche die Form "<code>(?<FeldName>regex such maske)</code>" haben. Mehr informationen und Hilfe zum erstellen von RegEx Patterns kann z.B. auf https://regex101.com geholt werden, hier werden die relevanten Basics erklärt, inkl. Muster zum übernehmen.<br>
        <ul>
          <li>Wenn erlaubte Zeichen für die Suchmaske alle Zeichen sind welche in Worten vorkommen können (in allen Sprachen) kann dafür "<code>\\p{L}</code>" für ein einzelnes Zeichen verwendet werden.</li>
          <li>Soll eine Ziffer gesucht werden geht dies über "<code>\\d</code>".</li>
          <li>Sollen alle Zeichen (Wortzeichen, Zahlen, Sonderzeichen) möglich sein wird dies durch "<code>.</code>" angegeben.</li>
          <li>Soll nicht ein einzelnes Zeichen, sondern 1-mehrere kann dies durch "<code>+</code>" 0-mehrere mit "<code>*</code>" 0-1 mit "<code>?</code>" nach der Maske gekennzeichnet werden(sogenannte quantifier).</li>
          <li>Soll eine Gruppe einer RegexMaske mehrfach wiederholt werden können/optional sein, muss dies in eine sogenannte non-capturing group mit "<code>(?:maske)</code>" gepackt und einem quantifier <code>+/*/?</code> entsprechend markiert werden.</li>
        </ul>
        Daraus ergeben sich nun z.B. folgene Wiederverwendbaren notationen
        <ul>
          <li>"<code>(?<FeldName>.+)</code>" es wird nach der gesammten Suchmasken Eingabe in FeldName gesucht.</li>
          <li>"<code>(?<FeldName1>\\p{L}+)</code>" wenn genau 1 Wort mit 1 bis unendlich Zeichen in der Suchmaske eingegeben wird, wird in FeldName1 danach gesucht</li>
          <li>"<code>(?<FeldName2>\\d+)</code>" wenn genau eine Zahl mit 1 bis unendlich Ziffern in der Suchmaske eingegeben wird, wird in FeldName2 danach gesucht</li>
          <li>"<code>(?<FeldName3>\\p{L}+(?: \\p{L}+)*)</code>" wenn mindestens 1 Wort bis unendlich Worte alle jeweils mit einem Leerzeichen getrennt in der Suchmaske eingegeben werden, wird in FeldName3 danach gesucht</li>
          <li>"<code>(?<entranceNumber>\\d+ ?\\p{L}?)</code>" wenn eine Zahl mit 1 bis unendlich Ziffern, mit einem optionalen Leerzeichen und/oder einem einzelnen optionalen WortZeichen in der Suchmaske eingegeben werden, wird in entranceNumber danach gesucht</li>
          <li>"<code>(?<FeldName4>\\p{L}+(?: \\p{L}+)*), (?<FeldName5>\\p{L}+(?: \\p{L}+)*)</code>" wenn 1 - x Worte, gefolgt von einem Komme und Leerzeichen, und wieder 1 - x Worte angegeben werden, wird der Text entsprechend in FeldName4 und FeldName5 gesucht.<br>
              Die Felder mit etwas anderem als einem Leerzeichen zu Trennen ist hier wichtig, da sonnst alles bis auf des letzte Wort in FeldName4 gesucht wird und nur das letzte/einte pflicht Wort (da 1 - x) in FeldName5</li>
        </ul>
        In einem GeoJSON/CSV file können tausende von separate Objekte/Features/Zeilen sein und somit auch potentiel viele welche auf die Sucheingabe passen. Damit bei vielen ähnlichen gefundenen Features ein differenzierteres Ergebnis ausgegeben werden kann, können Feldnamen angegeben werden nach welchen die Ergebnisse gruppiert werden sollen wenn es ziviele gibt.<br>
        Weiter kann die "Max Anzahl Suchergebnisse"(4) definiert werden welche angezeigt werden sollen.<br>
        <br>
        Bei Suchergebnissen kann analog der standard Logik das Ergebnis angeklickt werden um zu diesem zu springen.<br>
        Zusätzlich wird während dem Suchen bei allen gefundenen Features das Feld "<code>ZsMapSearchResult</code>" auf den boolean Wert true gesetzt, dies kann in den Style definitionen entsprechend beachtet und die Features dadurch entsprechend hervorgehoben werden.<br>
        In einem MapBox Style z.B. roter statt schwarzer Text wenn Teil des Suchergebnisses über:<br>
        <pre><code>
        {
          ...
          "layers": [
            ...
            {
              ...
              "paint": {
                "text-color": ["case", ["get", "ZsMapSearchResult"], "#ff0000", "#000000"],
                ...
              }
            }
          ]
        }
        </code></pre>`,
      fr: `Pour les couches GeoJSON et CSV, l'option "La couche est-elle consultable ?" (1) peut être activée pour permettre la recherche dans ces couches.
        Cela nécessite des informations supplémentaires qui configurent la recherche.<br>
        Dans le "Masque d'étiquette de résultat de recherche" (2), on spécifie ce qui doit être affiché lorsqu'un résultat est trouvé. Pour cela, les noms de champs des propriétés d'une entité dans le GeoJSON/colonnes dans le CSV peuvent être spécifiés en utilisant la notation <code>\${NomDuChamp}</code>.<br>
        Dans "Modèle RegEx pour la recherche" (3), des modèles de recherche doivent être définis pour lesquels la recherche doit être effectuée dans la couche GeoJSON/CSV. Comme une entité/ligne dans un GeoJSON/CSV a différents champs, il faut coder dans le masque de recherche quelle partie du masque doit apparaître dans quel champ GeoJSON/CSV.<br>
        Cela se fait via des groupes nommés dans le RegEx qui ont la forme "<code>(?<NomDuChamp>masque de recherche regex)</code>". Plus d'informations et d'aide pour créer des modèles RegEx peuvent être trouvées par exemple sur https://regex101.com, les bases pertinentes sont expliquées ici, y compris des modèles à adopter.<br>
        <ul>
          <li>Si les caractères autorisés pour le masque de recherche sont tous les caractères qui peuvent apparaître dans les mots (dans toutes les langues), "<code>\\p{L}</code>" peut être utilisé pour un seul caractère.</li>
          <li>Pour rechercher un chiffre, cela se fait via "<code>\\d</code>".</li>
          <li>Si tous les caractères (caractères de mot, chiffres, caractères spéciaux) doivent être possibles, cela est indiqué par "<code>.</code>".</li>
          <li>S'il ne s'agit pas d'un seul caractère, mais de 1-plusieurs, cela peut être indiqué par "<code>+</code>", 0-plusieurs avec "<code>*</code>", 0-1 avec "<code>?</code>" après le masque (appelés quantificateurs).</li>
          <li>Si un groupe d'un masque Regex doit pouvoir être répété plusieurs fois/être optionnel, il doit être placé dans un groupe non capturant avec "<code>(?:masque)</code>" et marqué en conséquence avec un quantificateur <code>+/*/?</code>.</li>
        </ul>
        Cela donne maintenant par exemple les notations réutilisables suivantes
        <ul>
          <li>"<code>(?<NomDuChamp>.+)</code>" recherche l'ensemble de l'entrée du masque de recherche dans NomDuChamp.</li>
          <li>"<code>(?<NomDuChamp1>\\p{L}+)</code>" si exactement 1 mot avec 1 à l'infini caractères est entré dans le masque de recherche, il est recherché dans NomDuChamp1</li>
          <li>"<code>(?<NomDuChamp2>\\d+)</code>" si exactement un nombre avec 1 à l'infini chiffres est entré dans le masque de recherche, il est recherché dans NomDuChamp2</li>
          <li>"<code>(?<NomDuChamp3>\\p{L}+(?: \\p{L}+)*)</code>" si au moins 1 mot jusqu'à l'infini mots, tous séparés par un espace, sont entrés dans le masque de recherche, ils sont recherchés dans NomDuChamp3</li>
          <li>"<code>(?<numeroEntree>\\d+ ?\\p{L}?)</code>" si un nombre avec 1 à l'infini chiffres, avec un espace optionnel et/ou un seul caractère de mot optionnel est entré dans le masque de recherche, il est recherché dans numeroEntree</li>
          <li>"<code>(?<NomDuChamp4>\\p{L}+(?: \\p{L}+)*), (?<NomDuChamp5>\\p{L}+(?: \\p{L}+)*)</code>" si 1 - x mots, suivis d'une virgule et d'un espace, et à nouveau 1 - x mots sont spécifiés, le texte est recherché en conséquence dans NomDuChamp4 et NomDuChamp5.<br>
              Il est important ici de séparer les champs par autre chose qu'un espace, sinon tout sauf le dernier mot est recherché dans NomDuChamp4 et seul le dernier/unique mot obligatoire (car 1 - x) dans NomDuChamp5</li>
        </ul>
        Dans un fichier GeoJSON/CSV, il peut y avoir des milliers d'objets/entités/lignes séparés et donc potentiellement beaucoup qui correspondent à l'entrée de recherche. Afin qu'un résultat plus différencié puisse être produit lorsque de nombreuses entités similaires sont trouvées, des noms de champs peuvent être spécifiés selon lesquels les résultats doivent être groupés s'il y en a trop.<br>
        De plus, le "Nombre maximum de résultats de recherche" (4) à afficher peut être défini.<br>
        <br>
        Pour les résultats de recherche, comme dans la logique standard, le résultat peut être cliqué pour y sauter.<br>
        De plus, pendant la recherche, le champ "<code>ZsMapSearchResult</code>" est défini sur la valeur booléenne true pour toutes les entités trouvées, cela peut être pris en compte dans les définitions de style et les entités peuvent ainsi être mises en évidence en conséquence.<br>
        Dans un style MapBox, par exemple, du texte rouge au lieu de noir lorsqu'il fait partie du résultat de recherche via :<br>
        <pre><code>
        {
          ...
          "layers": [
            ...
            {
              ...
              "paint": {
                "text-color": ["case", ["get", "ZsMapSearchResult"], "#ff0000", "#000000"],
                ...
              }
            }
          ]
        }
        </code></pre>`,
      en: `For GeoJSON and CSV layers, the option "Is the layer searchable?" (1) can be activated to allow searching in these layers.
          This requires additional information that configures the search.<br>
          In the "Search result label mask" (2), you specify what should be displayed when a match is found. For this, the field names of the properties of a feature in the GeoJSON/columns in the CSV can be specified using the notation <code>\${FieldName}</code>.<br>
          In "RegEx pattern for search" (3), search patterns must be defined for which the search should look in the GeoJSON/CSV layer. Since a feature/row in a GeoJSON/CSV has different fields, it must be coded in the search mask which part of the mask must occur in which GeoJSON/CSV field.<br>
          This is done via so-called named groups in the RegEx which have the form "<code>(?<FieldName>regex search mask)</code>". More information and help on creating RegEx patterns can be found e.g. on https://regex101.com, the relevant basics are explained here, including patterns to adopt.<br>
          <ul>
            <li>If allowed characters for the search mask are all characters that can occur in words (in all languages), "<code>\\p{L}</code>" can be used for a single character.</li>
            <li>To search for a digit, this is done via "<code>\\d</code>".</li>
            <li>If all characters (word characters, numbers, special characters) should be possible, this is indicated by "<code>.</code>".</li>
            <li>If not a single character, but 1-several, this can be indicated by "<code>+</code>", 0-several with "<code>*</code>", 0-1 with "<code>?</code>" after the mask (so-called quantifiers).</li>
            <li>If a group of a Regex mask should be able to be repeated multiple times/be optional, this must be put in a so-called non-capturing group with "<code>(?:mask)</code>" and marked accordingly with a quantifier <code>+/*/?</code>.</li>
          </ul>
          This now results in, for example, the following reusable notations
          <ul>
            <li>"<code>(?<FieldName>.+)</code>" searches for the entire search mask input in FieldName.</li>
            <li>"<code>(?<FieldName1>\\p{L}+)</code>" if exactly 1 word with 1 to infinity characters is entered in the search mask, it is searched for in FieldName1</li>
            <li>"<code>(?<FieldName2>\\d+)</code>" if exactly one number with 1 to infinity digits is entered in the search mask, it is searched for in FieldName2</li>
            <li>"<code>(?<FieldName3>\\p{L}+(?: \\p{L}+)*)</code>" if at least 1 word up to infinity words, all separated by a space, are entered in the search mask, they are searched for in FieldName3</li>
            <li>"<code>(?<entranceNumber>\\d+ ?\\p{L}?)</code>" if a number with 1 to infinity digits, with an optional space and/or a single optional word character is entered in the search mask, it is searched for in entranceNumber</li>
            <li>"<code>(?<FieldName4>\\p{L}+(?: \\p{L}+)*), (?<FieldName5>\\p{L}+(?: \\p{L}+)*)</code>" if 1 - x words, followed by a comma and space, and again 1 - x words are specified, the text is searched for accordingly in FieldName4 and FieldName5.<br>
                It is important here to separate the fields with something other than a space, otherwise everything except the last word is searched for in FieldName4 and only the last/single mandatory word (since 1 - x) in FieldName5</li>
          </ul>
          In a GeoJSON/CSV file, there can be thousands of separate objects/features/rows and thus potentially many that match the search input. In order to output a more differentiated result when many similar features are found, field names can be specified according to which the results should be grouped if there are too many.<br>
          Furthermore, the "Max number of search results" (4) to be displayed can be defined.<br>
          <br>
          For search results, as in the standard logic, the result can be clicked to jump to it.<br>
          Additionally, during the search, the field "<code>ZsMapSearchResult</code>" is set to the boolean value true for all found features, this can be taken into account in the style definitions and the features can thus be highlighted accordingly.<br>
          In a MapBox style, for example, red instead of black text when part of the search result via:<br>
          <pre><code>
          {
            ...
            "layers": [
              ...
              {
                ...
                "paint": {
                  "text-color": ["case", ["get", "ZsMapSearchResult"], "#ff0000", "#000000"],
                  ...
                }
              }
            ]
          }
          </code></pre>`,
    },
    docExpertPersistLayersTitle: {
      de: 'Aktive Ebenen auf Ereignis persistieren',
      fr: "Persister les couches actives sur l'événement",
      en: 'Persist active layers to event',
    },
    docExpertPersistLayers: {
      de: `In der Experten Ansicht hat es am Ende des Ebenen Blocks ein Button [Ebenen auf Ereignis speichern](1).<br>
          Wird dieser gedrückt werden die aktuell verwendeten Ebenen inkl. all deren Einstellungen, der Reihenfolge, Transparent und sichtbarkeit auf dem Ereignis persistiert.<br>
          Wenn anschliessend jemand (/oder man selbst) sich an einem anderen Gerät neu anmeldet und somit noch keine eigene Ebnene Konfiguration hat wird diese aus dem Ereignis geladen.`,
      fr: `Dans la vue expert, il y a un bouton [Enregistrer les couches dans l'événement] (1) à la fin du bloc de couches.<br>
          Lorsqu'on appuie dessus, les couches actuellement utilisées, y compris tous leurs paramètres, leur ordre, leur transparence et leur visibilité, sont persistées sur l'événement.<br>
          Si par la suite quelqu'un (/ou soi-même) se connecte sur un autre appareil et n'a donc pas encore sa propre configuration de couches, celle-ci sera chargée à partir de l'événement.`,
      en: `In the expert view, there is a button [Save layers to event] (1) at the end of the layer block.<br>
          When this is pressed, the currently used layers including all their settings, order, transparency and visibility are persisted to the event.<br>
          If subsequently someone (/or oneself) logs in on another device and thus does not yet have their own layer configuration, this will be loaded from the event.`,
    },
    docExpertOrganisationDefaultsTitle: {
      de: 'Default Ebenen Favoriten für Organisation',
      fr: "Favoris de couches par défaut pour l'organisation",
      en: 'Default layer favorites for organization',
    },
    docExpertOrganisationDefaultsButton: {
      de: 'In der Experten Ansicht hat es ganz unten in der Ebenen Sidebar den Button [Organisationseinstellungen](1), dieser öffnet eine Ansicht um WMS/WMTS Quellen sowie die Favoriten Ebenen für die eigene Organisation Ereignis und Session übergreifend zu definieren.',
      fr: "Dans la vue expert, tout en bas de la barre latérale des couches, il y a le bouton [Paramètres de l'organisation] (1), qui ouvre une vue pour définir les sources WMS/WMTS ainsi que les couches favorites pour sa propre organisation, de manière transversale aux événements et aux sessions.",
      en: 'In the expert view, at the very bottom of the layer sidebar, there is the button [Organization settings] (1), which opens a view to define WMS/WMTS sources as well as the favorite layers for your own organization across events and sessions.',
    },
    docExpertOrganisationDefaults: {
      de: `Bei "Vorab ausgewählte WMS-Quellen"(1) werden alle Quellen angezeigt welche selbst erstellt wurden oder öffentlich sind. Hier ausgewählte Quellen sind nach dem Login auf ZS Karte automatisch geladen und werden auch in der Standard Ansicht unter den "Verfügbare Ebenen" angezeigt.<br>
          <br>
          Unter "Favoriten"(2) werden die aktiven Favoriten angezeigt.<br>
          Wenn man eigene Favoriten definiert werden zukünftig diese anstatt den Standard Favoriten von ZS Karte angezeigt.<br>
          Man kann durch anklicken einer Ebene aus "Von aktiven hinzufügen"(3) oder "Aus Liste hinzufügen"(4) entsprechende Favoriten auswählen, bzw. durch anklicken eines der Favoriten diese aus den Favoriten entfernen.<br>
          In der Liste der Favoriten wird unter der Beschriftung der Ebene auch die Quelle(4) angegeben aus welcher diese stammt.<br>              
          <br>
          Bei den aktiven Ebenen/Favoriten wird über *modified* angezeigt das es keine standard Ebene (bzw. zuvor gespeicherte) ist, sondern eine bei der die Einstellungen angepasst wurden.<br>
          Wenn eine solche Ebene als öffentlich definiert wurde, wird diese erst dann effektiv in der Datenbank gespeichert und ist öffentlich verwendbar wenn diese mindestens einmalig als Favorit gespeichert wurde.<br>
          Bei bereits zuvor mal gespeicherte Ebenen welche nochmals angepasst wurden, kann beim klick auf [OK](5) definiert werden ob die bestehende Einstellung angepasst oder es als neue Ebene gespeichert werden soll`,
      fr: `Sous "Sources WMS présélectionnées" (1), toutes les sources qui ont été créées par soi-même ou qui sont publiques sont affichées. Les sources sélectionnées ici sont automatiquement chargées après la connexion à ZS Karte et sont également affichées dans la vue standard sous "Couches disponibles".<br>
          <br>
          Sous "Favoris" (2), les favoris actifs sont affichés.<br>
          Si l'on définit ses propres favoris, ceux-ci seront affichés à l'avenir à la place des favoris standard de ZS Karte.<br>
          On peut sélectionner les favoris correspondants en cliquant sur une couche dans "Ajouter depuis actif" (3) ou "Ajouter à partir de la liste" (4), ou les supprimer des favoris en cliquant sur l'un des favoris.<br>
          Dans la liste des favoris, la source (4) d'où provient la couche est également indiquée sous l'étiquette de la couche.<br>              
          <br>
          Pour les couches/favoris actifs, *modified* indique qu'il ne s'agit pas d'une couche standard (ou précédemment enregistrée), mais d'une couche dont les paramètres ont été ajustés.<br>
          Si une telle couche a été définie comme publique, elle ne sera effectivement enregistrée dans la base de données et utilisable publiquement que lorsqu'elle aura été enregistrée au moins une fois comme favori.<br>
          Pour les couches déjà enregistrées précédemment qui ont été à nouveau ajustées, on peut définir en cliquant sur [OK] (5) si le paramètre existant doit être ajusté ou s'il doit être enregistré comme nouvelle couche`,
      en: `Under "Pre-selected WMS sources" (1), all sources that have been self-created or are public are displayed. Sources selected here are automatically loaded after logging into ZS Karte and are also displayed in the standard view under "Available Layers".<br>
          <br>
          Under "Favorites" (2), the active favorites are displayed.<br>
          If you define your own favorites, these will be displayed in the future instead of the standard favorites from ZS Karte.<br>
          You can select corresponding favorites by clicking on a layer from "Add from active" (3) or "Add from list" (4), or remove them from favorites by clicking on one of the favorites.<br>
          In the list of favorites, the source (4) from which the layer originates is also indicated under the layer label.<br>              
          <br>
          For active layers/favorites, *modified* indicates that it is not a standard layer (or previously saved), but one where the settings have been adjusted.<br>
          If such a layer has been defined as public, it will only be effectively saved in the database and publicly usable when it has been saved at least once as a favorite.<br>
          For previously saved layers that have been adjusted again, it can be defined when clicking on [OK] (5) whether the existing setting should be adjusted or it should be saved as a new layer`,
    },
    openStreetMap: {
      de: 'OpenStreetMap',
      fr: 'OpenStreetMap',
      en: 'OpenStreetMap',
    },
    geoAdminSwissImage: {
      de: 'SWISSIMAGE',
      fr: 'SWISSIMAGE',
      en: 'SWISSIMAGE',
    },
    geoAdminPixel: {
      de: 'Pixelkarte farbig',
      fr: 'Carte pixelisée en couleur',
      en: 'Colored pixel map',
    },
    geoAdminPixelBW: {
      de: 'Pixelkarte grau',
      fr: 'Carte pixelisée en gris',
      en: 'Gray pixel map',
    },
    noBaseMap: {
      de: 'keine Basiskarte',
      fr: 'pas de carte de base',
      en: 'no base Map',
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
    edit: {
      de: 'Bearbeiten',
      en: 'Edit',
      fr: 'Modifier',
    },
    eventState: {
      de: 'Situationslage',
      en: 'Event state',
      fr: 'Sutiation',
    },
    affectedPersons: {
      de: 'Betroffene Personen',
      en: 'Affected Persons',
      fr: 'Persones affectés',
    },
    addNewLayer: {
      de: 'Neue Ebene erstellen',
      en: 'Create new layer',
      fr: 'Créer un nouveau couche',
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
      fr: "Couches enregistrées sur événement",
    },
    layerSource: {
      de: 'Ebenen Quelle',
      en: 'Layer Source',
      fr: 'Source du couche',
    },
    allSources: {
      de: 'Alle Quellen',
      en: 'all sources',
      fr: 'toutes les sources',
    },
    globalMapLayers: {
      de: 'Geteilte Ebenen',
      en: 'Shared layers',
      fr: 'Couche partagées',
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
    layerSourceUrl: {
      de: 'Quell-URL',
      en: 'source URL',
      fr: 'URL source',
    },
    mapLayerType: {
      de: 'Ebenentyp',
      en: 'Layer type',
      fr: 'Type de calque',
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
      fr: 'Ètendue de zone valide',
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
    creator: {
      de: 'Empfänger',
      en: 'Receiver',
      fr: 'Destinataire',
    },
    coordinates: {
      de: 'Koordinaten',
      en: 'Coordinates',
      fr: 'Coordonnées',
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
    showOnMap: {
      de: 'Auf Karte anzeigen',
      en: 'Show on map',
      fr: 'Afficher sur la carte',
    },
    journal: {
      de: 'Journal',
      en: 'Journal',
      fr: 'Journal',
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
    keyMessage: {
      de: 'Schlüsselmeldung',
      en: 'Key message',
      fr: 'Message clé',
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
    "politische-behoerde": {
      de: 'Politische Behörde',
      en: 'Political authority',
      fr: 'Autorité politique',
    },
    "chef-fuehrungsorgan": {
      de: 'Chef Führungsorgan',
      en: 'Chief executive body',
      fr: 'Organe directeur',
    },
    "stabschef": {
      de: 'Stabschef',
      en: 'Chief staff',
      fr: 'Chef du personnel',
    },
    "fb-lage": {
      de: 'FB Lage',
      en: 'DP Location',
      fr: 'DP localisation',
    },
    "fb-information": {
      de: 'FB Information',
      en: 'DP Information',
      fr: 'DP Information',
    },
    "fb-oeffentliche-sicherheit": {
      de: 'FB Sicherheit',
      en: 'DP Safety',
      fr: 'DP Sécurité',
    },
    "fb-schutz-rettung": {
      de: 'FB Schutz und Rettung',
      en: 'DP Safety and Rescue',
      fr: 'DP Sécurité et sauvetage',
    },
    "fb-gesundheit": {
      de: 'FB Gesundheit',
      en: 'DP Health',
      fr: 'DP Santé',
    },
    "fb-logistik": {
      de: 'FB Logistik',
      en: 'DP Logistics',
      fr: 'DP Logistique',
    },
    "fb-infrastrukturen": {
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
      fr: 'Si cette entrée de journal n\'est pas correcte, renvoyez-la à l\'entrée.',
    },
    wrongContentInfo:  {
      de: 'Beschreibe was falsch ist / korrigiert werden muss.',
      en: 'Describe what is wrong / needs to be corrected.',
      fr: 'Décrivez ce qui ne va pas/doit être corrigé.',
    },
    backToInput: {
      de: 'Zurück an Eingang senden',
      en: 'Return to input',
      fr: 'Renvoyer à l\'entrée',
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
    searchText:{
      de: 'Suche',
      en: 'Search',
      fr: 'Recherche',
    },
    noDepartment:{
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
      fr: 'Pas d\'information',
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
    pressEnter: {
      de: 'Drücken Sie Enter, um die Meldenummer hinzuzufügen',
      en: 'Press enter to add the report number',
      fr: 'Appuyez sur Entrée pour ajouter le numéro du rapport'
    },
    drawnSymbols: {
      de: 'Gezeichnete Signaturen',
      en: 'Drawn symbols',
      fr: 'Symboles dessinés'
    },
    zoomToAll: {
      de: 'Auf alle gezeichnete Signaturen zoomen',
      en: 'Zoom to all drawn signatures',
      fr: 'Zoomez sur toutes les signatures dessinées',
    },
    highlightAll: {
      de: 'Alle gezeichnete Signaturen hervorheben',
      en: 'Highlight all drawn symbols',
      fr: 'Surlignez tous les symboles dessinés',
    },
  };

  public getLabelForSign(sign: Sign): string {
    const chosenLang = sign[this._session.getLocale()];
    if (chosenLang) {
      return chosenLang;
    } else {
      for (const locale of LOCALES) {
        if (sign[locale]) {
          return sign[locale] ?? '';
        }
      }
    }
    return '';
  }

  public get(key: string): string {
    const element = I18NService.TRANSLATIONS[key];
    if (element) {
      const chosenLang = element[this._session.getLocale()];
      if (chosenLang) {
        return chosenLang;
      } else {
        for (const locale of LOCALES) {
          if (element[locale]) {
            return element[locale];
          }
        }
      }
    }
    console.error(`Was not able to find an entry in translation table for key ${key}`);
    return key;
  }
  public has(key: string): boolean {
    const element = I18NService.TRANSLATIONS[key];
    if (element) {
      const chosenLang = element[this._session.getLocale()];
      if (chosenLang) {
        return true;
      } else {
        for (const locale of LOCALES) {
          if (element[locale]) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
