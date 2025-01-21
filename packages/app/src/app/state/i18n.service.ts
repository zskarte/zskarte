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
      fr: 'Expert view',
      en: "Point de vue d'expert",
    },
    defaultView: {
      de: 'Standard Ansicht',
      fr: 'Default view',
      en: 'Vue générale',
    },
    toastExpertView: {
      de: 'Experten Ansicht aktiviert',
      fr: 'Expert view activated',
      en: "Point de vue d'expert activée",
    },
    toastDefaultView: {
      de: 'Standard Ansicht aktiviert',
      fr: 'Default view activated',
      en: 'Vue générale activée',
    },
    color: {
      de: 'Farbe',
      fr: 'Couleur',
      en: 'Color',
    },
    colorPickerMode: {
      de: 'Farbauswahlmodus',
      fr: 'Mode sélecteur de couleurs',
      en: 'Color picker mode',
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
    symbolSize: {
      de: 'Grösse',
      en: 'Size',
      fr: 'Taille',
    },
    symbolAlignRight: {
      de: 'Rechts ausrichten',
      en: 'Align right',
      fr: 'Aligner à droite',
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
    groupLabel: {
      de: 'Gruppe',
      en: 'Group',
      fr: 'Groupe',
    },
    sign: {
      de: 'Zeichen',
      en: 'Sign',
      fr: 'Signe',
    },
    location: {
      de: 'Ort',
      en: 'Location',
      fr: 'Emplacement',
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
      de: 'Ebenentyp',
      en: 'Layer type',
      fr: 'Type de calque',
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
      de: 'Um vollständig offline arbeiten zu können, müssen folgende Dinge überprüft werden.',
      en: 'To allow working fully offline the following things have to be verified.',
      fr: 'Pour permettre de travailler entièrement hors ligne, les éléments suivants doivent être vérifiés.',
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
    throw new Error(`Was not able to find an entry in translation table for key ${key}`);
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
