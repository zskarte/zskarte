/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {PreferencesService} from "./preferences.service";
import {Sign} from "./entity/sign";

export const LOCALES: string[] = ["de", "fr", "en"];
export const DEFAULT_LOCALE: string = LOCALES[0];

@Injectable({
    providedIn: 'root'
})
export class I18NService {
    private _locale: string = DEFAULT_LOCALE;
    private localeSource = new BehaviorSubject<string>(null);
    public currentLocale = this.localeSource.asObservable();

    constructor(private preferences: PreferencesService) {
        this.locale = preferences.getLocale();
    }

    set locale(newLocale: string) {
        this._locale = newLocale ? newLocale : DEFAULT_LOCALE;
        if (this._locale) {
            this.preferences.setLocale(this._locale);
        }
        this.localeSource.next(this._locale);
    }

    get locale(): string {
        return this._locale;
    }

    public getLabelForSign(sign:Sign){
        let chosenLang = sign[this.locale];
        if(chosenLang){
            return chosenLang;
        }
        else{
            for(let locale of LOCALES){
                if(sign[locale]){
                    return sign[locale];
                }
            }
        }
        return null;
    }

    public get(key: string): string {
        const element = I18NService.TRANSLATIONS[key];
        if (element) {
            const chosenLang = element[this.locale];
            if (chosenLang) {
                return chosenLang;
            } else{
                for(let locale of LOCALES){
                    if(element[locale]){
                        return element[locale];
                    }
                }
            }
        }
        throw new Error("Was not able to find an entry in translation table for key " + key);
    }

    private static TRANSLATIONS = {
        symbol: {
            de: "Symbol",
            en: "Symbol",
            fr: "Symbole"
        },
        name: {
            de: "Name",
            en: "Name",
            fr: "Nom"
        },
        password: {
            de: "Passwort",
            fr: "Mot de passe",
            en: "Password"
        },
        wrongPassword: {
            de: "Ungültiges Passwort",
            fr: "Mauvais mot de passe",
            en: "Wrong password"
        },
        eventname: {
            de: "Ereignis",
            fr: "L'événement",
            en: "Happening"
        },
        text: {
            de: "Text",
            en: "Text",
            fr: "Texte"
        },
        draw: {
            de: "Zeichnen",
            fr: "Dessiner",
            en: "Draw"
        },
        createOrLoad: {
            de: "Karte erstellen / laden",
            fr: "Créer / charger une carte",
            en: "Create / load map"
        },
        newMap: {
            de: "Neue Karte erstellen",
            en: "Create new map",
            fr: "Créer une nouvelle carte"
        },
        loadMap: {
            de: "Bestehende Karte laden",
            en: "Load existing map",
            fr: "Charger une carte existante"
        },
        copy: {
            de: "Kopie",
            fr: "Copie",
            en: "Copy"
        },
        importMap: {
            de: "Karte von Datei importieren",
            en: "Load map from file",
            fr: "Importer une carte à partir d'un fichier"
        },
        importMapConflict: {
            de: "Die zu importierende Karte existiert bereits. Möchten Sie sie ersetzen? Ansonsten wird eine Kopie angelegt.",
            fr: "La carte à importer existe déjà. Souhaitez-vous le remplacer ? Sinon, une copie est créée.",
            en: "The map to be imported already exists. Do you want to replace it? If not, a copy will be created."
        },
        deleteMap: {
            de: "Karte löschen",
            en: "Delete map",
            fr: "Supprimer la carte"
        },
        confirmDeleteMap: {
            de: "Wollen Sie diese Karte wirklich unwiederruflich löschen?",
            en: "Do you really want to delete this card irrevocably?",
            fr: "Voulez-vous vraiment supprimer cette carte de façon irrévocable ?"
        },
        editMap: {
            de: "Karteninformationen bearbeiten",
            en: "Edit map information",
            fr: "Modifier les informations de la carte"
        },
        downloadCurrentDrawing: {
            de: "Aktuelle Zeichnung herunterladen",
            fr: "Télécharger le dessin actuel",
            en: "Download the current drawing"
        },
        exportSession: {
            de: "Karte exportieren",
            en: "Export map",
            fr: "Exporter la carte"
        },
        withHistory: {
            de: "Mit History",
            en: "With history",
            fr: "Avec historique"
        },
        withoutHistory: {
            de: "Ohne History",
            en: "Without history",
            fr: "Sans historique"
        },
        cancel: {
            de: "Abbrechen",
            en: "Cancel",
            fr: "Annuler"
        },
        download: {
            de: "Herunterladen",
            en: "Download",
            fr: "Télécharger"
        },
        filter: {
            de: "Filter",
            en: "Filter",
            fr: "Filtre"
        },
        polygon: {
            de: "Polygon",
            en: "Polygon",
            fr: "Polygone"
        },
        point: {
          de: "Punkt",
          en: "Point",
          fr: "Point"
        },
        circle: {
            de: "Kreis",
            en: "Circle",
            fr: "Cercle"
        },
        line: {
            de: "Linie",
            en: "Line",
            fr: "Ligne"
        },
        noFilter: {
            de: "Kein Filter",
            en: "No filter",
            fr: "Pas de filtre"
        },
        damage: {
            de: "Beschädigung",
            en: "Damage",
            fr: "Dommage"
        },
        danger: {
            de: "Gefahr",
            en: "Danger",
            fr: "Danger"
        },
        resources: {
            de: "Einsatzmittel",
            en: "Resources",
            fr: "Moyens"
        },
        findPlace: {
            de: "Ort finden",
            fr: "Trouver emplacement",
            en: "Find a place"
        },
        endHistoryMode: {
            de: "History-Modus beenden",
            fr: "Quitter le mode historique",
            en: "End history mode"
        },
        loadFromFile: {
            de: "Von Datei laden",
            fr: "Charger à partir du fichier",
            en: "Load from file"
        },
        import: {
            de: "Importieren",
            fr: "Importer",
            en: "Import"
        },
        drawLayer: {
            de: "Zeichnungsebene",
            fr: "Couche de dessin",
            en: "Drawing layer"
        },
        layers: {
            de: "Ebenen",
            fr: "Couches cartographiques",
            en: "Layers"
        },
        rotate: {
            de: "Rotieren",
            fr: "Tourner",
            en: "Rotate"
        },
        opacity: {
            de: "Deckkraft",
            fr: "Opacité",
            en: "Opacity"
        },
        solidLine: {
            de: "Durchgezogen",
            fr: "Continue",
            en: "Solid"
        },
        dashedLine: {
            de: "Gestrichelt",
            en: "Dashed",
            fr: "Pointillée"
        },
        lineWidth: {
            de: "Linien-Dicke",
            en: "Line width",
            fr: "Largeur de ligne"
        },
        delete: {
            de: "Löschen",
            en: "Delete",
            fr: "Effacer"
        },
        ok: {
            de: "OK",
            en: "OK",
            fr: "OK"
        },
        yes: {
            de: "Ja",
            en: "Yes",
            fr: "Oui"
        },
        no: {
            de: "Nein",
            en: "No",
            fr: "Non"
        },
        yourText: {
            de: "Ihr Text",
            fr: "Votre texte",
            en: "Your text"
        },
        drawing: {
            de: "Zeichnung",
            fr: "Dessin",
            en: "Drawing"
        },
        currentDrawing: {
            de: "Aktuelle Zeichnung",
            fr: "Dessin actuel",
            en: "Current drawing"
        },
        history: {
            de: "History- / Lese-Modus",
            fr: "Mode historique / lecture",
            en: "History / read mode"
        },
        drawMode: {
            de: "Zeichnungsmodus",
            fr: "Mode de dessin",
            en: "Drawing mode"
        },
        color: {
            de: "Farbe",
            fr: "Couleur",
            en: "Color"
        },
        drawHole: {
            de: "Loch zeichnen",
            fr: "Dessiner un trou",
            en: "Draw a hole"
        }
        ,
        moveToTop: {
            de: "In den Vordergrund",
            en: "Send to front",
            fr: "Passer au premier plan"
        },
        moveToBottom: {
            de: "In den Hintergrund",
            en: "Send to back",
            fr: "Passer au fond"
        },
        chooseGroupingArea:{
            de: "Zu gruppierende Fläche auswählen",
            en: "Choose the element to group with",
            fr: "Sélectionnez la zone à grouper"
        },
        ungroup: {
            de: "Gruppierung aufheben",
            fr: "Dégrouper",
            en: "Ungroup"
        }
        , group: {
            de: "Gruppieren",
            fr: "Grouper",
            en: "Group"
        }
        , cancelGrouping: {
            de: "Gruppieren abbrechen",
            fr: "Annuler le groupement",
            en: "Cancel grouping"
        }
        ,
        sessionCreatorTitle: {
            de: "Willkommen bei ZSKarte 2!",
            fr: "Bienvenue à ZSKarte 2 !",
            en: "Welcome to ZSKarte 2!"
        },
        sessionCreatorInstructions: {
            de: "Bitte beachten Sie: Die Daten werden nur auf Ihrem Browser gehalten - sie werden nicht mit einem Server geteilt! Falls Sie die Karte mit anderen zusätzlich sichern oder teilen möchten, können Sie diese exportieren (und erneut importieren).<br/><br/> **Wichtig**: Wenn Sie Ihre Browserdaten löschen, so werden auch die gespeicherten Karten entfernt!",
            fr: "Remarque : les données sont uniquement conservées sur votre navigateur - elles ne sont pas partagées avec un serveur ! Si vous souhaitez enregistrer ou partager la carte avec d'autres personnes, vous pouvez exporter (et réimporter) la carte. <br/><br/>**Important**: Si vous supprimez les données de votre navigateur, les cartes enregistrées seront également supprimées.",
            en: "Please note: The data is only kept in your browser - it is not shared with a server! If you would like to additionally save or share the map with others, you can export (and re-import) the map.<br/><br/> **Important**: If you delete your browser data, the saved maps will also be removed"
        },
        zso: {
            de: "ZSO",
            fr: "PCi",
            en: "CPO"
        },
        sessionLoaderInstructions: {
            de: "Bitte beachten Sie: Wenn Sie eine Karte laden wird die bestehende nicht gelöscht - Sie können diese jederzeit hier wieder laden.",
            fr: "Remarque : lorsque vous chargez une carte, la carte existante n'est pas supprimée - vous pouvez la recharger ici à tout moment.",
            en: "Please note: When you load a map, the existing map is not deleted - you can reload it here at any time."
        },
        importSessionInstructions: {
            de: "Verwenden Sie eine **.zsjson** Datei um eine vollständige Karte zu importieren.",
            fr: "Utilisez un fichier **.zsjson** pour importer une carte complète.",
            en: "Use a **.zsjson** file to import a complete map."
        },
        confirmClearDrawing: {
            de: "Wollen Sie wirklich alle Elemente der Zeichnung entfernen? Die History der Karte bleibt dabei bestehen!",
            en: "Do you really want to clear all elements of this drawing? The history of the map will remain!",
            fr: "Voulez-vous vraiment supprimer tous les éléments du dessin ? L'histoire de la carte restera !"
        },
        confirmImportDrawing: {
            de: "Wollen Sie die entsprechende Zeichnung wirklich importieren? Die aktuelle Zeichnung wird dabei ersetzt, die History bleibt aber bestehen!",
            en: "Do you really want to import this drawing? The current drawing will be replaced - the history of the map will remain though!",
            fr: "Voulez-vous vraiment importer le dessin correspondant ? Le dessin actuel sera remplacé, mais l'histoire restera !"
        },
        confirmImportDrawingNoReplace: {
            de: "Wollen Sie die entsprechende Zeichnung wirklich importieren? Die aktuelle Zeichnung wird dabei mit den enthaltenen Elementen ergänzt!",
            en: "Do you really want to import the corresponding drawing? The current drawing will be extended with the contained elements!",
            fr: "Voulez-vous vraiment importer le dessin correspondant ? Le dessin actuel sera étendu avec les éléments contenus !"
        },
        availableLayers: {
            de: "Verfügbare Ebenen",
            en: "Available layers",
            fr: "Couches cartographiques disponibles"
        },
        selectedLayers: {
            de: "Gewählte Ebene",
            en: "Selected layers",
            fr: "Couches cartographiques sélectionnées"
        },
        currentMap: {
            de: "Aktuelle Karte",
            fr: "Carte actuelle",
            en: "Current map"
        },
        otherMaps: {
            de: "Andere Karten",
            fr: "Autre cartes",
            en: "Other map"
        },
        map: {
            de: "Karte",
            fr: "Carte",
            en: "Map"
        },
        legendNotLoaded: {
            de: "Die Legende für diese Karte konnte leider nicht geladen werden",
            fr: "La légende de cette carte n'a pas pu être chargée",
            en: "The legend for this map could not be loaded"
        },
        fontSize: {
            de: "Schriftgrösse",
            fr: "Taille de police",
            en: "Font size"
        },
        yourTag: {
            de: "Ihr Tag",
            fr: "Votre tag",
            en: "Your tag"
        },
        tagState: {
            de: "Taggen",
            en: "Tag",
            fr: "Taguer"
        },
        filterHistory: {
            de: "Gefiltert (nur markierte / alle 30 min)",
            fr: "Filtré (uniquement marqué / toutes les 30 min)",
            en: "Filtered (tagged / every 30 mins only)"
        },
        removeTag: {
            de: "Tag entfernen",
            fr: "Supprimer le tag",
            en: "Remove tag"
        },
        fillPattern: {
            de: "Muster",
            en: "Pattern",
            fr: "Modèle"
        },
        filled: {
            de: "Gefüllt",
            en: "Filled",
            fr: "Rempli"
        },
        hatched: {
            de: "Schraffiert",
            en: "Hatched",
            fr: "Hachuré"
        },
        crossed: {
            de: "Gekreuzt",
            en: "Crossed",
            fr: "Croisé"
        },
        spacing: {
            de: "Abstand",
            en: "Spacing",
            fr: "Espacement"
        },
        angle: {
            de: "Winkel",
            en: "Angle",
            fr: "Angle"
        },
        type: {
            de: "Typ",
            en: "Type",
            fr: "Type"
        },
        font: {
            de: "Schrift",
            en: "Font",
            fr: "Police"
        },
        width: {
            de: "Dicke",
            en: "Width",
            fr: "Largeur"
        },
        functions: {
            de: "Funktionen",
            en: "Functions",
            fr: "Fonctions"
        },
        hideSymbol: {
            de: "Symbol auf Karte verstecken",
            en: "Hide symbol on map",
            fr: "Cacher le symbole sur la carte"
        },
        lockFeature: {
            de: "Position fixieren",
            en: "Fix position",
            fr: "Fixer la position"
        },
        replaceSymbol:{
            de: "Ersetzen",
            en: "Replace",
            fr: "Remplacer"
        },
        selectSymbol:{
            de: "Auswählen",
            en: "Select",
            fr: "Sélectionner"
        },
        removeSymbol:{
            de: "Entfernen",
            en: "Remove",
            fr: "Supprimer"
        },
        symbolOffset:{
            de: "Versatz",
            en: "Offset",
            fr: "Décalage"
        },
        symbolSize:{
            de: "Grösse",
            en: "Size",
            fr: "Taille"
        },
        symbolAlignRight:{
            de: "Rechts ausrichten",
            en: "Align right",
            fr: "Aligner à droite"
        },
        addSymbol:{
            de: "Hinzufügen",
            en: "Add",
            fr: "Ajouter"
        },
        deleteLastPointOnFeature: {
            de: "Diese Form besteht aus dem Minimum nötiger Punkte.",
            fr: "Cette forme consiste en un nombre minimum de points.",
            en: "This shape consists of a minimal number of points."
        },
        removeFeatureFromMapConfirm: {
            de: "Möchten Sie dieses Element wirklich von der Karte entfernen?",
            fr: "Souhaitez-vous vraiment supprimer cet élément de la carte ?",
            en: "Do you really want to remove this element from the map?"
        },
        shareWithOtherMaps: {
            de: "Mit anderen Karten teilen",
            fr: "Partager avec d'autres cartes",
            en: "Share with other maps"
        },
        keepOriginal: {
            de: "Original-Bild behalten (grössenreduziert)",
            en: "Keep original image (reduced in size)",
            fr: "Conserver l'image originale (taille réduite)"
        },
        keepOriginalWarning: {
            de: "Vorsicht: Die Einbettung von zahlreichen Original-Bildern kann die Performanz der Applikation aufgrund der zusätzlichen Datenmenge einschränken!",
            en: "Caution: The embedding of numerous original images can limit the performance of the application due to the additional data volume!",
            fr: "Attention : l'intégration de nombreuses images originales peut limiter les performances de l'application en raison du volume de données supplémentaires !"
        },
        german:{
            de: "Deutsch",
            fr: "Allemand",
            en: "German"
        },
        french: {
            de: "Französisch",
            fr: "Français",
            en: "French"
        },
        english: {
            de: "Englisch",
            fr: "Anglais",
            en: "English"
        },
        deleteSymbolConfirm:{
            de: "Wollen Sie dieses Symbol wirklich löschen?",
            fr: "Voulez-vous vraiment supprimer ce symbole ?",
            en: "Do you really want to delete this symbol?"
        },
        defineCoordinates: {
            de: "Koordinaten definieren",
            en: "Define coordinates",
            fr: "Définir les coordonnées"
        },
        replaceByImport: {
            de: "Existierende Elemente mit Import ersetzen",
            fr: "Remplacer les éléments existants par l'import",
            en: "Replace existing elements with import"
        },
        importFromFile: {
            de: "Von Datei",
            en: "From File",
            fr: "Du fichier"
        },
        importFromGeoadmin: {
            de: "Von Geoadmin",
            en: "From Geoadmin",
            fr: "De Geoadmin"
        },
        importFromGeoadminDescription:{
            de: "Um Formen von Geoadmin importieren zu können, benötigen Sie den Layer-Namen (z.B. \"ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill\") sowie einen Suchschlüssel und dessen Wert, nach welchen die Metadaten gefiltert werden (z.B. \"kanton\" als Schlüssel und \"FR\" als Wert um alle Gemeinden von Fribourg zu importieren)",
            fr: "Pour importer des formes de geoadmin, vous avez besoin du nom de la couche (par exemple \"ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill\") ainsi que d'une clé de recherche et de sa valeur, selon laquelle les métadonnées seront filtrées (par exemple \"kanton\" comme clé et \"FR\" comme valeur pour importer toutes les communes de Fribourg)",
            en: "To import forms of geoadmin, you need the layer name (e.g. \"ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill\") as well as a search key and its value, according to which the metadata will be filtered (e.g. \"kanton\" as key and \"FR\" as value to import all communes of Fribourg)"
        },
        geoadminImportLayer: {
            de: "Layer",
            en: "Layer",
            fr: "Couche"
        },
        geoadminImportKey: {
            de: "Such-Schlüssel",
            en: "Search key",
            fr: "Clé de recherche"
        },
        geoadminImportValue: {
            de: "Wert",
            en: "Value",
            fr: "Valeur"
        },
        currentState:{
            de: "Aktuell",
            en: "Most recent",
            fr: "Actuel"
        },
        description:{
            de: "Beschreibung",
            en: "Description",
            fr: "Description"
        },
        arrow:{
            de: "Pfeil",
            en: "Arrow",
            fr: "Flèche"
        },
        none: {
            de: "Keiner",
            en: "None",
            fr: "Aucun"
        },
        thin:{
            de: "Dünn",
            en: "Thin",
            fr: "Fine"
        },
        print: {
            de: "Drucken",
            en: "Print",
            fr: "Imprimer"
        },
        save: {
            de: "Speichern",
            en: "Save",
            fr: "Enregistrer"
        },
        images:{
            de: "Bilder",
            en: "Images",
            fr: "Images"
        },
        unknown:{
            de: "Unbekannt",
            en: "Unknown",
            fr: "Inconnu"
        },
        help:{
            de: "Hilfe",
            en: "Help",
            fr: "Aide"
        },
        docWelcomeTitle: {
            de: "Willkommen!",
            en: "Welcome!",
            fr: "Bienvenue !"
        },
        docWelcome:{
            de: "# Herzlich Willkommen bei ZSKarte 2!\n" +
                "Sie finden hier einige Informationen zur Verwendung der Applikation. \n\n" +
                "Sie können diesen Schritt selbstverständlich jederzeit überspringen und bei Bedarf über das Hilfe-Menü wieder aufrufen.\n\n" +
                "Wir wünschen Ihnen viel Spass bei der Verwendung!",
            fr: "# Bienvenue à ZSKarte 2 !\n" +
                "Vous trouverez ici quelques informations sur la manière d'utiliser l'application.\n\n" +
                "Vous pouvez sauter cette étape à tout moment et la rappeler via le menu principal si nécessaire.\n\n" +
                "Nous espérons que vous prendrez plaisir à l'utiliser !",
            en: "# Welcome to ZSKarte 2!\n" +
                "You will find here some information on how to use the application. \n\n" +
                "You can skip this step at any time and call it up again via the main menu if required.\n\n" +
                "We hope you enjoy using it!"
        },
        docNewMap:{
            de: "* Um eine neue Karte zu erstellen, müssen Sie zuerst Ihre Zivilschutz-Organisation definieren (welche bei einem zweiten Mal vorgemerkt wird). Ausserdem sollten Sie Ihre Karte benennen (z.B. anhand des aktuellen Ereignisses).\n" +
                "* Falls bereits Karten bestehen, finden Sie eine entsprechende Möglichkeit, diese zu öffnen\n" +
                "* Falls Sie eine Karte exportiert haben / von jemandem mit dem Dateiformat .zsjson erhalten haben, können Sie diese hier importieren",
            en: "* To create a new map, you must first define your organisation (which will be memorized for a second time). You should also name your map (e.g. based on the current event).\n" +
                "* If some maps already exist, you will find a menu entry to open them\n" +
                "* If you have exported / received a map from someone with the .zsjson file format, you can import it here\n",
            fr: "* Pour créer une nouvelle carte, vous devez d'abord définir votre organisation de protection civile (qui sera reprise une seconde fois). Vous devez également nommer votre carte.\n" +
                "* Si d'autres cartes existent déjà, vous trouverez une zone pour les ouvrir\n" +
                "* Si vous avez exporté / reçu une carte de quelqu'un avec le format de fichier .zsjson, vous pouvez l'importer ici\n"
        },
        docInitialViewTitle: {
            de: "Initiale Ansicht",
            en: "Initial view",
            fr: "Vue initiale"
        },
        docInitialView: {
            de: "Nach dem erstellen / laden / importieren einer neuen Karte befinden Sie sich bei der Initial-Darstellung der Karte.\n" +
                "Sie finden im obersten Bereich folgende Elemente vor:\n" +
                "* Das Logo der gewählten Zivilschutzorganisation inkl. der Sprachwahl.\n" +
                "* Den Kartentitel und das **Hauptmenü** (in blau)\n" +
                "* Die aktuelle Uhrzeit\n" +
                "* Eine Suche (**Ort finden**) um nach einer Adresse oder einem gezeichneten Element zu suchen\n" +
                "* Das Menü **Zeichnen**\n" +
                "* Das Menü **Aktuelle Zeichnung**\n" +
                "* Das Menü **Ebenen**\n" +
                "* Den **Modus-Schalter** um vom Zeichnungs- zum History / Lese-Modus zu gelangen\n" +
                "* Einen Knopf um das **Menü zu reduzieren** um den Kartenbereich zu maximieren",
            en: "After creating / loading / importing a new map you are at the initial view of the map.\n" +
                "You will find the following elements in the top section:\n"+
                "* The logo of the chosen organization including the language choice.\n" +
                "* The map title and **main menu** (in blue)\n" +
                "* The current date and time\n" +
                "* A mechanism (**Find location**) to search for an address or a drawn element\n" +
                "* The **draw** menu\n" +
                "* The menu **current drawing**\n" +
                "* The menu **layers**\n" +
                "* The **mode switch** to switch from drawing to history / read mode\n" +
                "* A button to reduce the **menu** to maximize the map area\n",
            fr: "Après avoir créé / chargé / importé une nouvelle carte, vous vous trouvez à la vue initiale de la carte.\n" +
                "Vous trouverez les éléments suivants dans la section supérieure:\n" +
                "* Le logo de l'organisation de protection civile y compris le choix de la langue.\n" +
                "* Le titre de la carte et **le menu principal** (en bleu)\n" +
                "* L'heure actuelle\n" +
                "* Un élément (**Trouver un lieu**) pour rechercher une adresse ou un élément dessiné\n" +
                "* Le menu **dessiner**\n" +
                "Le menu **dessin actuel**\n" +
                "* Le menu **couches cartographiques**\n" +
                "* Le **mode switch** pour passer du dessin à l'histoire / mode lecture\n" +
                "* Un bouton pour réduire le **menu** pour maximiser la surface de la carte"
        },
        docMainMenuTitle: {
            de: "Hauptmenü",
            en: "Main menu",
            fr: "Menu principal"
        },
        docMainMenu:{
            de: "Das Hauptmenü beinhaltet Funktionen \n" +
                "* zum erstellen / laden einer Karte (analog Schritt 2)\n" +
                "* zum editieren / umbenennen der aktuellen Karte\n" +
                "* zum exportieren der aktuellen Karte (mit oder ohne History) - das Ergebnis kann dann z.B. auf einem anderen Browser importiert werden.\n" +
                "* um die Karte zu löschen\n" +
                "* um diese Hilfe aufzurufen",
            en: "The main menu contains functions \n" +
                "* to create / load a map (step 2)\n" +
                "* to edit / rename the current map\n" +
                "* to export the current map (with or without history) - the result can then be imported e.g. on another machine.\n" +
                "* to erase the map\n" +
                "* to indicate this help",
            fr: "Le menu principal contient des fonctions \n" +
                "* pour créer / charger une carte\n" +
                "* pour éditer / renommer la carte actuelle" +
                "* pour exporter la carte actuelle (avec ou sans historique) - le résultat peut être importé par exemple sur une autre machine.\n" +
                "* pour effacer la carte" +
                "* pour indiquer cette aide"
        },
        docSearch:{
            de: "Die Suche kann dazu verwendet werden, Adressen und andere Orte zu finden und mittels Selektion zum entsprechenden Ort auf der Karte zu navigieren. Die Suche unterstützt ausserdem gezeichnete Symbole inkl. deren Namen",
            en: "The search can be used to find addresses and other places and navigate to the corresponding location on the map. The search also supports drawn symbols by including their names",
            fr: "La recherche peut être utilisée pour trouver des adresses et d'autres lieux et naviguer jusqu'à l'endroit correspondant sur la carte. La recherche prend également en compte les symboles dessinés, y compris leurs noms"
        },
        docDraw:{
            de: "Dieses Menü erlaubt es, verschiedene Elemente auf die Karte zu zeichnen:\n" +
                "* **Text**: Ein Dialog erscheint, welcher es erlaubt einen Text zu definieren. Nach dem Schliessen des Dialoges kann eine Linie auf die Karte gezeichnet werden indem auf die Karte geklickt wird (beenden mit Doppelklick). Anschliessend wird der Text dargestellt und unten links erscheint die **Selektionsansicht**.\n" +
                "* **Symbol**: Es erscheint der **Symbolauswahl** Dialog - nach der entsprechenden Auswahl kann (je nach Symbol) ein Punkt, eine Linie oder eine Fläche (Polygon) gezeichnet werden.\n" +
                "* **Polygon**: Es kann direkt begonnen werden, eine Fläche zu zeichnen (bei Bedarf kann auch später über die **Selektionsansicht** ein Symbol definiert werden).\n" +
                "* **Linie**: Analog dem Polygon kann direkt begonnen werden, eine Linie zu zeichnen. Eine Linie kann über die **Selektionsansicht** auch in einen Pfeil umgewandelt werden.",
            en: "This menu allows you to draw different elements on the map: \n" +
                "* **Text**: A dialog appears, which allows you to define a text. After closing the dialog, a line can be drawn on the map by clicking on the map (finish by double click). The text is then displayed and the **selection view** is shown.\n"+
                "* **Symbol**: The **symbol selection** dialog appears - after the corresponding selection a point, a line or a area (polygon) can be drawn (depending on the symbol).\n" +
                "* **Polygon**: You can start drawing a surface directly (if necessary, you can also define a symbol later using the **selection view**).\n" +
                "* **Line**: Just as with the polygon, you can directly start drawing a line. A line can also be converted into an arrow using the **selection view**\"",
            fr: "Ce menu vous permet de dessiner différents éléments sur la carte:\n" +
                "* **Texte** : Un dialogue apparaît, qui vous permet de définir un texte. Après avoir fermé le dialogue, une ligne peut être tracée sur la carte en cliquant sur la carte (terminer par un double clic). Le texte est alors affiché et la **vue de sélection** apparaît dans le coin inférieur gauche.\n" +
                "* **Symbole** : Le dialogue **sélection de symbole** apparaît - après la sélection correspondante, un point, une ligne ou une surface (polygone) peut être dessiné (selon le symbole).\n" +
                "* **Polygone** : Vous pouvez commencer à dessiner une surface directement (si nécessaire, vous pouvez également définir un symbole plus tard en utilisant la **vue de sélection**).\n" +
                "* **Ligne** : Comme pour le polygone, vous pouvez directement commencer à tracer une ligne. Une ligne peut également être convertie en flèche en utilisant la **vue de sélection**"
        },
        docSymbolSelectionTitle:{
            de: "Symbolauswahl",
            en: "Symbol selection",
            fr: "Séléction de symbole"
        },
        docSymbolSelection:{
            de: "Die Symbolauswahl erlaubt es, aus vordefinierten Symbolen auszuwählen, oder eigene Symbole über den Knopf neben dem Filter zu definieren.\n\n" +
                "Wurde ein eigenes Symbol hochgeladen, so kann definiert werden, um welche Geometrie es sich handelt (Punkt / Linie / Polygon), es kann eine Benennung in einer oder mehreren der unterstützten Sparchen definiert und eine zugehörige Farbe gewählt werden.\n\n" +
                "Grundsätzlich werden Bilder, welche als Symbole hinzugefügt werden als Kreis ausgeschnitten. Soll das Bild in seiner Originalform für die spätere Detailansicht erhalten bleiben, so kann dies hier selektiert werden. \n\n" +
                "Auch kann ein Symbol für die Verwendung durch andere Karten auf diesem Browser freigegeben werden.",
            en: "Symbol selection allows you to choose from predefined symbols, or to define your own symbols using the button next to the filter.\n" +
                "If a custom symbol has been uploaded, you can define the geometry (point / line / polygon), define a name in one or more of the supported languages and choose a color.\n" +
                "By default, images that are added as symbols are cut out as a circle. If you want to keep the picture in its original form for the detail view, you can define this here.\n" +
                "Also, an icon can be shared for use by other maps on this browser.\n",
            fr: "La sélection de symboles vous permet de choisir parmi des symboles prédéfinis, ou de définir vos propres symboles à l'aide du bouton situé à côté du filtre.\n" +
                "Si un symbole personnalisé a été téléchargé, vous pouvez définir la géométrie (point / ligne / polygone), définir un nom dans une ou plusieurs des langues supportées et choisir une couleur.\n" +
                "Fondamentalement, les images qui sont ajoutées en tant que symboles sont découpées en forme de cercle. Si vous souhaitez conserver l'image dans sa forme originale pour la vue détaillée, vous pouvez la sélectionner ici.\n" +
                "De plus, une icône peut être partagée pour être utilisée par d'autres cartes sur cette machine."
        },
        docSelectionTitle: {
            de: "Selektionsansicht",
            en: "Selection view",
            fr: "Vue de la sélection"
        },
        docSelection:{
            de: "Wird ein Element auf der Karte selektiert (z.B. ein Symbol, eine Linie, eine Fläche, etc.), so erscheint in der unteren linken Ecke des Bildschirms eine Selektionsansicht.\n\n" +
                "Für alle Elemente sind die folgenden Funktionen vorhanden:\n" +
                "* Es kann ein Name angegeben werden (u.a. um nach dem gezeichneten Element zu suchen)\n" +
                "* Es kann eine Farbe definiert werden\n" +
                "* Die Position kann fixiert werden (solange dies aktiviert ist, ist es nicht möglich das Element zu verschieben oder seine Geometrie zu ändern).\n" +
                "* Unter \"Funktionen\" kann ein Element in den Vordergrund oder Hintergrund gebracht werden und die Koordinaten des Elements können manuell definiert werden.\n" +
                "* Das Element kann gelöscht werden.\n\n" +
                "Zusätzlich unterscheiden sich einige Optionen je nach gewählter Geometrie:\n" +
                "* **Text**: Die Schriftgrösse kann definiert werden\n" +
                "* **Linie**: Die Linie kann als gestrichelt oder durchgängig definiert und die Liniendicke und ein Pfeilende angegeben werden\n" +
                "* **Polygon**: \n" +
                "   * Es kann - neben der Möglichkeit die Linie als gestrichelt oder durchgängig sowie deren Dicke zu definieren - ein Muster sowie die Transparenz angegben werden, welches zum Füllen der Fläche verwendet werden soll.\n"+
                "   * Es kann ein Loch in ein Polygon gezeichnet werden\n" +
                "   * Polygone können zusammen gruppiert werden (z.B. um unzusammenhängende Bereiche zu vereinen)\n"+
                "* **Alle ausser Text**: \n" +
                "   * Es kann eine Beschreibung definiert werden indem Bilder (existierende oder selbstgewählte Symbole - ein Klick auf das Bild öffnet die Detailansicht) und/oder Text (in Markdown - es erscheint eine Voransicht, wenn auf das schwarze \"M\" Symbol geklickt wird) definiert wird.\n" +
                "   * Symbole können definiert / ersetzt / ausgeblendet / vergrössert / verkleinert und gedreht werden und es ist möglich, die Darstellung des Symbols zur besseren Sichtbarkeit vom Ankerpunkt aus zu verschieben",
            en: "If an element on the map is selected (e.g. a symbol, a line, an area, etc.), a selection view appears in the lower left corner of the screen.\n\n" +
                "The following functions are available for all elements:\n" +
                "* A name can be specified (e.g. to allow the search for the drawn element)\n" +
                "* A color can be defined\n" +
                "* The position can be fixed (if this is activated, it is not possible to move the element or change its geometry).\n" +
                "* Under \"Functions\" an element can be brought into the foreground or background and the coordinates of the element can be defined manually.\n" +
                "* The item can be deleted. \n\n" +
                "In addition, some options differ depending on the selected geometry:\n" +
                "* **Text**: The font size can be defined\n" +
                "* **Line**: The line can be defined as dashed or continuous. The line thickness can be changed and an arrow end can be specified\n" +
                "* **Polygon**: \n" +
                "   * In addition to the option of defining the line as dashed or continuous and its thickness, you can also specify a pattern and the transparency to be used to fill the area. \n "+
                "   * A hole can be drawn in a polygon\n" +
                "   * Polygons can be grouped together (e.g. to combine unconnected areas)\n "+
                "* **All except text** \n" +
                "   * A description can be defined by images (existing or self-selected symbols - a click on the image opens the detail view) and/or text (in Markdown - a preview appears if the black \"M\" is clicked).\n" +
                "   * Symbols can be defined / replaced / hidden / resized and rotated and it is possible to \"move\" the representation of the symbol from the anchor point for better visibility",
            fr: "Si un élément de la carte est sélectionné (par exemple, un symbole, une ligne, une zone, etc.), une vue de sélection apparaît dans le coin inférieur gauche de l'écran.\n" +
                "Pour tous les éléments, les fonctions suivants sont disponibles:\n" +
                "* Un nom peut être spécifié (entre autres pour rechercher l'élément dessiné)\n" +
                "* Une couleur peut être définie\n" +
                "* La position peut être fixée (tant qu'elle est activée, il n'est pas possible de déplacer l'élément ou de modifier sa géométrie).\n" +
                "* Sous \"Fonctions\", un élément peut être mis au premier plan ou à l'arrière-plan et les coordonnées de l'élément peuvent être définies manuellement.\n" +
                "* L'élément peut être supprimé.\n" +
                "En outre, certaines options diffèrent en fonction de la géométrie choisie:\n" +
                "* **Texte** : La taille de la police peut être définie\n" +
                "* **Ligne** : La ligne peut être définie comme pointillée ou continue. L'épaisseur de la ligne peut être modifiée et une extrémité de flèche peut être spécifiée\n" +
                "* **Polygone** : \n" +
                "   * En plus de la possibilité de définir la ligne comme pointillée ou continue et son épaisseur, vous pouvez également spécifier un motif et la transparence à utiliser pour remplir le polygone.\n" +
                "   * Un trou peut être dessiné dans un polygone\\n\" +\n" +
                "   * Les polygones peuvent être regroupés (par exemple pour combiner des zones non connectées)\n" +
                "* **Tout sauf le texte**\n" +
                "   * Une description peut être définie par des images (symboles existants ou sélectionnés - un clic sur l'image ouvre la vue détaillée) et/ou du texte (en Markdown - un aperçu apparaît si l'on clique sur le \"M\" noir est cliquée).\n" +
                "   * Les symboles peuvent être définis / remplacés / cachés / zoomés / dézoomés et pivotés et il est possible de \"déplacer\" la représentation du symbole à partir du point d'ancrage pour une meilleure visibilité"
             },
        docFilter:{
            de: "Der Filter erlaubt es, einzelne Symbole oder alle (Symbol: durchgestrichenes Auge) auszublenden, resp. einzublenden (Symbol: Auge)",
            en: "The filter allows you to hide or show individual or all symbols",
            fr: "Le filtre vous permet de cacher ou d'afficher des symboles individuels ou tous"
        },
        docCurrentDrawing:{
            de: "Dieses Menü beinhaltet die Möglichkeiten:\n" +
                "* Zeichnungen / Geometrien von einer Datei oder von einem Geoadmin-Layer (z.B. Gemeindegrenzen) zu importieren (es handelt sich dabei ausschliesslich um die gezeichneten Elemente - nicht um die History o.ä.). Soll eine Karte komplett importiert werden, so soll die Möglichkeit des Karten ladens im **Hauptmenü** verwendet werden.\n" +
                "* Die Zeichnung herunterzuladen (im geojson Format)\n" +
                "* Die Zeichnung zu taggen (dem aktuellen Stand einen Namen zu geben um diesen dann im **History- / Lese-Modus** wiederfinden zu können)\n" +
                "* Die Zeichnung zu drucken\n" +
                "* Die gezeichneten Elemente zu löschen\n",
            en: "This menu contains the options:\n" +
                "* import drawings / geometries from a file or from a geoadmin layer (e.g. municipal boundaries) (only the drawn elements are imported - not the history or similar). If a map is to be imported completely, the option to load maps in the **main menu** should be used.\n" +
                "* To download the drawing (in geojson format)\n" +
                "* To tag the drawing (give a name to the current state to be able to find it again in **history / read mode**)\n" +
                "* To print the drawing\n" +
                "* To delete the drawn elements",
            fr: "Ce menu contient les options suivantes:\n" +
                "* importer des dessins / géométries à partir d'un fichier ou d'une couche géoadmin (par exemple, les limites municipales) (seuls les éléments dessinés sont importés - pas l'historique ou similaire). Si une carte doit être importée complètement, il faut utiliser l'option de chargement des cartes dans le **menu principal**.\n" +
                "* Pour télécharger le dessin (au format geojson)\n" +
                "* Marquer le dessin (donner un nom à l'état actuel pour pouvoir le retrouver en **histoire / mode lecture**)\n" +
                "* Pour imprimer le dessin" +
                "* Pour supprimer les éléments dessinés"
        },
        docLayers:{
            de: "Es können verschiedene Karten gewählt werden (u.a. Open Street Map, Satellitenbilder von GeoAdmin oder die Offline-Variante sofern installiert).\n\n" +
                "Ausserdem kann die Transparenz der aktuellen Karte definiert werden.\n\n" +
                "Zusätzliche Ebenen stammen von GeoAdmin, welche es erlauben die gezeichnete Karte mit spezifischen Themenkarten zu unterlegen",
            fr: "Différentes cartes peuvent être sélectionnées (entre autres Open Street Map, des images satellites de GeoAdmin ou la version hors ligne si elle est installée).\n" +
                "Vous pouvez également définir la transparence de la carte actuelle. \n" +
                "Des couches supplémentaires proviennent de GeoAdmin, qui permettent de sous-tendre la carte dessinée avec des cartes thématiques spécifiques",
            en: "Different maps can be selected (among others Open Street Map, satellite images from GeoAdmin or the offline version if installed).\n" +
                "You can also define the transparency of the current map. \n" +
                "Additional layers come from GeoAdmin, which allow to underlay the drawn map with specific theme maps\n"
        },
        docHistory:{
            de: "Dieser Modus dient dem Lesen / Präsentieren der Karte. Hier werden Symbole gebündelt, sofern die Karte weit ausgezoomt wird. Ausserdem ist es hier möglich, frühere Kartenzustände welche automatisch aufgezeichnet oder explizit durch den Benutzer getagged wurden aufgerufen werden.\n\n" +
                "Bei der Selektion eines Elementes erscheint in der linken unteren Ecke eine Übersicht über die definierten Informationen wie Name, Beschreibung, Bilder, etc.",
            fr: "Ce mode permet de lire / présenter la carte. C'est là que les symboles sont regroupés, à condition que la carte soit largement dézoomée. Il est également possible d'appeler des états de carte précédents qui ont été automatiquement enregistrés ou explicitement marqués par l'utilisateur.\n" +
                "Lors de la sélection d'un élément, une vue d'ensemble des informations définies telles que le nom, la description, les images, etc. apparaît dans le coin inférieur gauche\n",
            en: "This mode is for reading / presenting the map. This is where symbols are grouped, provided the map is zoomed out widely. It is also possible to call up previous map states which have been automatically recorded or explicitly tagged by the user.\n" +
                "When selecting an element, an overview of the defined information such as name, description, images, etc. appears in the lower left corner\n"
        },
        keyboardShortcutsTitle: {
            de: "Tastenbelegungen",
            en: "Keyboard shortcuts",
            fr: "Attributions clés"
        },
        keyboardShortcuts:{
            de: "TBD",
            en: "TBD",
            fr: "TBD"
        }
    }

}
