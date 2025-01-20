import { transform } from "ol/proj";
import { coordinatesProjection, projectionByName, projections, swissProjection } from "./projections"
import { containsCoordinate, Extent } from "ol/extent";

const BOUNDS_LV95 = swissProjection.getExtent();
const BOUNDS_AS_WGS84 = [BOUNDS_LV95.slice(0, 2), BOUNDS_LV95.slice(2)]
  .flatMap(coords => transform(coords, swissProjection, coordinatesProjection!));

console.log(BOUNDS_AS_WGS84, BOUNDS_LV95)
  
const RE_DEGREE_IDENTIFIER = '\\s*°\\s*'
const RE_DEGREE = `\\d{1,3}(\\.\\d+)?`
const RE_MIN_IDENTIFIER = "\\s*['‘’‛′]\\s*"
const RE_MIN = `\\d{1,2}(\\.\\d+)?`
const RE_SEC_IDENTIFIER = '\\s*(["“”‟″]|[\'‘’‛′]{2})\\s*'
const RE_SEC = `\\d{1,2}(\\.\\d+)?`
const RE_CARD = '[NSEW]'
const RE_SEPARATOR = '\\s*?[ \\t,/]\\s*'

// 47.5 7.5 or 47.5° 7.5°
const REGEX_WGS_84 = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?$`,
    'i'
)
// 47.5N 7.5E or 47.5°N 7.5°E
const REGEX_WGS_84_WITH_CARDINALS = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `\\s*(?<card1>${RE_CARD})` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `\\s*(?<card2>${RE_CARD})$`,
    'i'
)
// N47.5 E7.5 or N47.5 E7.5
const REGEX_WGS_84_WITH_PRE_FIXED_CARDINALS = new RegExp(
    `^(?<card1>${RE_CARD})\\s*` +
        `(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<card2>${RE_CARD})\\s*` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?$`,
    'i'
)
// 47°31.8' 7°31.8' or 47°31.8' 7°31.8' or 47°31.8'30"N 7°31.8'30.4"E or 47°31.8'N 7°31.8'E or without °'" 47 31.8 30 N 7 31.8 30.4 E
const REGEX_WGS_84_WITH_MIN = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER})?` +
        `(\\s*(?<card1>${RE_CARD}))?` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER})?` +
        `(\\s*(?<card2>${RE_CARD}))?$`,
    'i'
)
// N47°31.8' E7°31.8'or without °'" N 47 31.8 E 7 31.8
const REGEX_WGS_84_WITH_MIN_PREFIXED = new RegExp(
    `^(?<card1>${RE_CARD})\\s*` +
        `(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<card2>${RE_CARD})\\s*` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER})?$`,
    'i'
)
// 47°31.8'30" 7°31.8'30.4" or 47°31.8'30"N 7°31.8'30.4"E or without °'" 47 31.8 30 N 7 31.8 30.4 E
const REGEX_WGS_84_WITH_SECONDS = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec1>${RE_SEC})(${RE_SEC_IDENTIFIER})?` +
        `(\\s*(?<card1>${RE_CARD}))?` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec2>${RE_SEC})(${RE_SEC_IDENTIFIER})?` +
        `(\\s*(?<card2>${RE_CARD}))?$`,
    'i'
)
// same as REGEX_WGS_84_WITH_SECONDS but with prefixed cardinal: N 47°31.8'30" E 7°31.8'30.4"
const REGEX_WGS_84_WITH_SECONDS_PREFIXED = new RegExp(
    `^(?<card1>${RE_CARD})\\s*` +
        `(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec1>${RE_SEC})(${RE_SEC_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<card2>${RE_CARD})\\s*` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec2>${RE_SEC})(${RE_SEC_IDENTIFIER})?$`,
    'i'
)

/**
 * @param {String} text
 * @returns {[Number, Number] | undefined}
 */
function extractWGS84Coordinates(text) {
    const regexMatch = [
        REGEX_WGS_84,
        REGEX_WGS_84_WITH_CARDINALS,
        REGEX_WGS_84_WITH_PRE_FIXED_CARDINALS,
        REGEX_WGS_84_WITH_MIN,
        REGEX_WGS_84_WITH_MIN_PREFIXED,
        REGEX_WGS_84_WITH_SECONDS,
        REGEX_WGS_84_WITH_SECONDS_PREFIXED,
    ]
        .map((regex) => regex.exec(text.trim()))
        .find((result) => Array.isArray(result))
    if (regexMatch) {
        return wgs84Extractor(regexMatch)
    }
    return undefined
}

const wgs84Extractor = (regexMatches) => {
  if (!regexMatches) {
      return undefined
  }
  let firstNumber, secondNumber
  let firstCardinal, secondCardinal

  // Extract degrees
  firstNumber = Number(regexMatches.groups.degree1)
  secondNumber = Number(regexMatches.groups.degree2)

  // Extract minutes if any
  if (regexMatches.groups.min1) {
      firstNumber += Number(regexMatches.groups.min1) / 60
  }
  if (regexMatches.groups.min2) {
      secondNumber += Number(regexMatches.groups.min2) / 60
  }

  // Extract seconds if any
  if (regexMatches.groups.sec1) {
      firstNumber += Number(regexMatches.groups.sec1) / 3600
  }
  if (regexMatches.groups.sec2) {
      secondNumber += Number(regexMatches.groups.sec2) / 3600
  }

  // Extract cardinal if any
  if (regexMatches.groups.card1) {
      firstCardinal = regexMatches.groups.card1
  }
  if (regexMatches.groups.card2) {
      secondCardinal = regexMatches.groups.card2
  }

  if (firstNumber && secondNumber) {
      let lon = firstNumber,
          lat = secondNumber
      switch (firstCardinal?.toUpperCase()) {
          case 'N':
              lat = firstNumber
              break
          case 'S':
              lat = -firstNumber
              break
          case 'E':
              lon = firstNumber
              break
          case 'W':
              lon = -firstNumber
              break
      }
      switch (secondCardinal?.toUpperCase()) {
          case 'N':
              lat = secondNumber
              break
          case 'S':
              lat = -secondNumber
              break
          case 'E':
              lon = secondNumber
              break
          case 'W':
              lon = -secondNumber
              break
      }

      if (containsCoordinate(BOUNDS_AS_WGS84, [lon, lat])) {
        return [lon, lat]
      }

      if (containsCoordinate(BOUNDS_AS_WGS84, [lat, lon])) {
        return [lat, lon]
      }
  }
  return null
}


export const coordinateFromString = (text) => {
  if (typeof text !== 'string') {
      return undefined
  }
  const wgs84Result = extractWGS84Coordinates(text)
  if (wgs84Result) {
    return wgs84Result as number[];
  }
  return undefined
}
