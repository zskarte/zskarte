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
            en: "Please note: The data is only kept on your browser - it is not shared with a server! If you would like to additionally save or share the map with others, you can export (and re-import) the map.<br/><br/> **Important**: If you delete your browser data, the saved maps will also be removed"
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
        }
    }

}