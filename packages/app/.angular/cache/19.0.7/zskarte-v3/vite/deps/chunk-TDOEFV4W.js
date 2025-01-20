import {
  toSize
} from "./chunk-EA4JZPIY.js";
import {
  fromString
} from "./chunk-QABMMYJI.js";
import {
  ascending
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/expr/expression.js
var numTypes = 0;
var BooleanType = 1 << numTypes++;
var NumberType = 1 << numTypes++;
var StringType = 1 << numTypes++;
var ColorType = 1 << numTypes++;
var NumberArrayType = 1 << numTypes++;
var SizeType = 1 << numTypes++;
var AnyType = Math.pow(2, numTypes) - 1;
var typeNames = {
  [BooleanType]: "boolean",
  [NumberType]: "number",
  [StringType]: "string",
  [ColorType]: "color",
  [NumberArrayType]: "number[]",
  [SizeType]: "size"
};
var namedTypes = Object.keys(typeNames).map(Number).sort(ascending);
function isSpecific(type) {
  return type in typeNames;
}
function typeName(type) {
  const names = [];
  for (const namedType of namedTypes) {
    if (includesType(type, namedType)) {
      names.push(typeNames[namedType]);
    }
  }
  if (names.length === 0) {
    return "untyped";
  }
  if (names.length < 3) {
    return names.join(" or ");
  }
  return names.slice(0, -1).join(", ") + ", or " + names[names.length - 1];
}
function includesType(broad, specific) {
  return (broad & specific) === specific;
}
function isType(type, expected) {
  return type === expected;
}
var LiteralExpression = class {
  /**
   * @param {number} type The value type.
   * @param {LiteralValue} value The literal value.
   */
  constructor(type, value) {
    if (!isSpecific(type)) {
      throw new Error(`literal expressions must have a specific type, got ${typeName(type)}`);
    }
    this.type = type;
    this.value = value;
  }
};
var CallExpression = class {
  /**
   * @param {number} type The return type.
   * @param {string} operator The operator.
   * @param {...Expression} args The arguments.
   */
  constructor(type, operator, ...args) {
    this.type = type;
    this.operator = operator;
    this.args = args;
  }
};
function newParsingContext() {
  return {
    variables: /* @__PURE__ */ new Set(),
    properties: /* @__PURE__ */ new Set(),
    featureId: false,
    geometryType: false
  };
}
function parse(encoded, expectedType, context) {
  switch (typeof encoded) {
    case "boolean": {
      if (isType(expectedType, StringType)) {
        return new LiteralExpression(StringType, encoded ? "true" : "false");
      }
      if (!includesType(expectedType, BooleanType)) {
        throw new Error(`got a boolean, but expected ${typeName(expectedType)}`);
      }
      return new LiteralExpression(BooleanType, encoded);
    }
    case "number": {
      if (isType(expectedType, SizeType)) {
        return new LiteralExpression(SizeType, toSize(encoded));
      }
      if (isType(expectedType, BooleanType)) {
        return new LiteralExpression(BooleanType, !!encoded);
      }
      if (isType(expectedType, StringType)) {
        return new LiteralExpression(StringType, encoded.toString());
      }
      if (!includesType(expectedType, NumberType)) {
        throw new Error(`got a number, but expected ${typeName(expectedType)}`);
      }
      return new LiteralExpression(NumberType, encoded);
    }
    case "string": {
      if (isType(expectedType, ColorType)) {
        return new LiteralExpression(ColorType, fromString(encoded));
      }
      if (isType(expectedType, BooleanType)) {
        return new LiteralExpression(BooleanType, !!encoded);
      }
      if (!includesType(expectedType, StringType)) {
        throw new Error(`got a string, but expected ${typeName(expectedType)}`);
      }
      return new LiteralExpression(StringType, encoded);
    }
    default: {
    }
  }
  if (!Array.isArray(encoded)) {
    throw new Error("expression must be an array or a primitive value");
  }
  if (encoded.length === 0) {
    throw new Error("empty expression");
  }
  if (typeof encoded[0] === "string") {
    return parseCallExpression(encoded, expectedType, context);
  }
  for (const item of encoded) {
    if (typeof item !== "number") {
      throw new Error("expected an array of numbers");
    }
  }
  if (isType(expectedType, SizeType)) {
    if (encoded.length !== 2) {
      throw new Error(`expected an array of two values for a size, got ${encoded.length}`);
    }
    return new LiteralExpression(SizeType, encoded);
  }
  if (isType(expectedType, ColorType)) {
    if (encoded.length === 3) {
      return new LiteralExpression(ColorType, [...encoded, 1]);
    }
    if (encoded.length === 4) {
      return new LiteralExpression(ColorType, encoded);
    }
    throw new Error(`expected an array of 3 or 4 values for a color, got ${encoded.length}`);
  }
  if (!includesType(expectedType, NumberArrayType)) {
    throw new Error(`got an array of numbers, but expected ${typeName(expectedType)}`);
  }
  return new LiteralExpression(NumberArrayType, encoded);
}
var Ops = {
  Get: "get",
  Var: "var",
  Concat: "concat",
  GeometryType: "geometry-type",
  LineMetric: "line-metric",
  Any: "any",
  All: "all",
  Not: "!",
  Resolution: "resolution",
  Zoom: "zoom",
  Time: "time",
  Equal: "==",
  NotEqual: "!=",
  GreaterThan: ">",
  GreaterThanOrEqualTo: ">=",
  LessThan: "<",
  LessThanOrEqualTo: "<=",
  Multiply: "*",
  Divide: "/",
  Add: "+",
  Subtract: "-",
  Clamp: "clamp",
  Mod: "%",
  Pow: "^",
  Abs: "abs",
  Floor: "floor",
  Ceil: "ceil",
  Round: "round",
  Sin: "sin",
  Cos: "cos",
  Atan: "atan",
  Sqrt: "sqrt",
  Match: "match",
  Between: "between",
  Interpolate: "interpolate",
  Coalesce: "coalesce",
  Case: "case",
  In: "in",
  Number: "number",
  String: "string",
  Array: "array",
  Color: "color",
  Id: "id",
  Band: "band",
  Palette: "palette",
  ToString: "to-string",
  Has: "has"
};
var parsers = {
  [Ops.Get]: createCallExpressionParser(hasArgsCount(1, Infinity), withGetArgs),
  [Ops.Var]: createCallExpressionParser(hasArgsCount(1, 1), withVarArgs),
  [Ops.Has]: createCallExpressionParser(hasArgsCount(1, Infinity), withGetArgs),
  [Ops.Id]: createCallExpressionParser(usesFeatureId, withNoArgs),
  [Ops.Concat]: createCallExpressionParser(hasArgsCount(2, Infinity), withArgsOfType(StringType)),
  [Ops.GeometryType]: createCallExpressionParser(usesGeometryType, withNoArgs),
  [Ops.LineMetric]: createCallExpressionParser(withNoArgs),
  [Ops.Resolution]: createCallExpressionParser(withNoArgs),
  [Ops.Zoom]: createCallExpressionParser(withNoArgs),
  [Ops.Time]: createCallExpressionParser(withNoArgs),
  [Ops.Any]: createCallExpressionParser(hasArgsCount(2, Infinity), withArgsOfType(BooleanType)),
  [Ops.All]: createCallExpressionParser(hasArgsCount(2, Infinity), withArgsOfType(BooleanType)),
  [Ops.Not]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(BooleanType)),
  [Ops.Equal]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(AnyType)),
  [Ops.NotEqual]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(AnyType)),
  [Ops.GreaterThan]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.GreaterThanOrEqualTo]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.LessThan]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.LessThanOrEqualTo]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.Multiply]: createCallExpressionParser(hasArgsCount(2, Infinity), withArgsOfReturnType),
  [Ops.Coalesce]: createCallExpressionParser(hasArgsCount(2, Infinity), withArgsOfReturnType),
  [Ops.Divide]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.Add]: createCallExpressionParser(hasArgsCount(2, Infinity), withArgsOfType(NumberType)),
  [Ops.Subtract]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.Clamp]: createCallExpressionParser(hasArgsCount(3, 3), withArgsOfType(NumberType)),
  [Ops.Mod]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.Pow]: createCallExpressionParser(hasArgsCount(2, 2), withArgsOfType(NumberType)),
  [Ops.Abs]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(NumberType)),
  [Ops.Floor]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(NumberType)),
  [Ops.Ceil]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(NumberType)),
  [Ops.Round]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(NumberType)),
  [Ops.Sin]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(NumberType)),
  [Ops.Cos]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(NumberType)),
  [Ops.Atan]: createCallExpressionParser(hasArgsCount(1, 2), withArgsOfType(NumberType)),
  [Ops.Sqrt]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(NumberType)),
  [Ops.Match]: createCallExpressionParser(hasArgsCount(4, Infinity), hasEvenArgs, withMatchArgs),
  [Ops.Between]: createCallExpressionParser(hasArgsCount(3, 3), withArgsOfType(NumberType)),
  [Ops.Interpolate]: createCallExpressionParser(hasArgsCount(6, Infinity), hasEvenArgs, withInterpolateArgs),
  [Ops.Case]: createCallExpressionParser(hasArgsCount(3, Infinity), hasOddArgs, withCaseArgs),
  [Ops.In]: createCallExpressionParser(hasArgsCount(2, 2), withInArgs),
  [Ops.Number]: createCallExpressionParser(hasArgsCount(1, Infinity), withArgsOfType(AnyType)),
  [Ops.String]: createCallExpressionParser(hasArgsCount(1, Infinity), withArgsOfType(AnyType)),
  [Ops.Array]: createCallExpressionParser(hasArgsCount(1, Infinity), withArgsOfType(NumberType)),
  [Ops.Color]: createCallExpressionParser(hasArgsCount(1, 4), withArgsOfType(NumberType)),
  [Ops.Band]: createCallExpressionParser(hasArgsCount(1, 3), withArgsOfType(NumberType)),
  [Ops.Palette]: createCallExpressionParser(hasArgsCount(2, 2), withPaletteArgs),
  [Ops.ToString]: createCallExpressionParser(hasArgsCount(1, 1), withArgsOfType(BooleanType | NumberType | StringType | ColorType))
};
function withGetArgs(encoded, returnType, context) {
  const argsCount = encoded.length - 1;
  const args = new Array(argsCount);
  for (let i = 0; i < argsCount; ++i) {
    const key = encoded[i + 1];
    switch (typeof key) {
      case "number": {
        args[i] = new LiteralExpression(NumberType, key);
        break;
      }
      case "string": {
        args[i] = new LiteralExpression(StringType, key);
        break;
      }
      default: {
        throw new Error(`expected a string key or numeric array index for a get operation, got ${key}`);
      }
    }
    if (i === 0) {
      context.properties.add(String(key));
    }
  }
  return args;
}
function withVarArgs(encoded, returnType, context) {
  const name = encoded[1];
  if (typeof name !== "string") {
    throw new Error("expected a string argument for var operation");
  }
  context.variables.add(name);
  return [new LiteralExpression(StringType, name)];
}
function usesFeatureId(encoded, returnType, context) {
  context.featureId = true;
}
function usesGeometryType(encoded, returnType, context) {
  context.geometryType = true;
}
function withNoArgs(encoded, returnType, context) {
  const operation = encoded[0];
  if (encoded.length !== 1) {
    throw new Error(`expected no arguments for ${operation} operation`);
  }
  return [];
}
function hasArgsCount(minArgs, maxArgs) {
  return function(encoded, returnType, context) {
    const operation = encoded[0];
    const argCount = encoded.length - 1;
    if (minArgs === maxArgs) {
      if (argCount !== minArgs) {
        const plural = minArgs === 1 ? "" : "s";
        throw new Error(`expected ${minArgs} argument${plural} for ${operation}, got ${argCount}`);
      }
    } else if (argCount < minArgs || argCount > maxArgs) {
      const range = maxArgs === Infinity ? `${minArgs} or more` : `${minArgs} to ${maxArgs}`;
      throw new Error(`expected ${range} arguments for ${operation}, got ${argCount}`);
    }
  };
}
function withArgsOfReturnType(encoded, returnType, context) {
  const argCount = encoded.length - 1;
  const args = new Array(argCount);
  for (let i = 0; i < argCount; ++i) {
    const expression = parse(encoded[i + 1], returnType, context);
    args[i] = expression;
  }
  return args;
}
function withArgsOfType(argType) {
  return function(encoded, returnType, context) {
    const argCount = encoded.length - 1;
    const args = new Array(argCount);
    for (let i = 0; i < argCount; ++i) {
      const expression = parse(encoded[i + 1], argType, context);
      args[i] = expression;
    }
    return args;
  };
}
function hasOddArgs(encoded, returnType, context) {
  const operation = encoded[0];
  const argCount = encoded.length - 1;
  if (argCount % 2 === 0) {
    throw new Error(`expected an odd number of arguments for ${operation}, got ${argCount} instead`);
  }
}
function hasEvenArgs(encoded, returnType, context) {
  const operation = encoded[0];
  const argCount = encoded.length - 1;
  if (argCount % 2 === 1) {
    throw new Error(`expected an even number of arguments for operation ${operation}, got ${argCount} instead`);
  }
}
function withMatchArgs(encoded, returnType, context) {
  const argsCount = encoded.length - 1;
  const inputType = StringType | NumberType | BooleanType;
  const input = parse(encoded[1], inputType, context);
  const fallback = parse(encoded[encoded.length - 1], returnType, context);
  const args = new Array(argsCount - 2);
  for (let i = 0; i < argsCount - 2; i += 2) {
    try {
      const match = parse(encoded[i + 2], input.type, context);
      args[i] = match;
    } catch (err) {
      throw new Error(`failed to parse argument ${i + 1} of match expression: ${err.message}`);
    }
    try {
      const output = parse(encoded[i + 3], fallback.type, context);
      args[i + 1] = output;
    } catch (err) {
      throw new Error(`failed to parse argument ${i + 2} of match expression: ${err.message}`);
    }
  }
  return [input, ...args, fallback];
}
function withInterpolateArgs(encoded, returnType, context) {
  const interpolationType = encoded[1];
  let base;
  switch (interpolationType[0]) {
    case "linear":
      base = 1;
      break;
    case "exponential":
      const b = interpolationType[1];
      if (typeof b !== "number" || b <= 0) {
        throw new Error(`expected a number base for exponential interpolation, got ${JSON.stringify(b)} instead`);
      }
      base = b;
      break;
    default:
      throw new Error(`invalid interpolation type: ${JSON.stringify(interpolationType)}`);
  }
  const interpolation = new LiteralExpression(NumberType, base);
  let input;
  try {
    input = parse(encoded[2], NumberType, context);
  } catch (err) {
    throw new Error(`failed to parse argument 1 in interpolate expression: ${err.message}`);
  }
  const args = new Array(encoded.length - 3);
  for (let i = 0; i < args.length; i += 2) {
    try {
      const stop = parse(encoded[i + 3], NumberType, context);
      args[i] = stop;
    } catch (err) {
      throw new Error(`failed to parse argument ${i + 2} for interpolate expression: ${err.message}`);
    }
    try {
      const output = parse(encoded[i + 4], returnType, context);
      args[i + 1] = output;
    } catch (err) {
      throw new Error(`failed to parse argument ${i + 3} for interpolate expression: ${err.message}`);
    }
  }
  return [interpolation, input, ...args];
}
function withCaseArgs(encoded, returnType, context) {
  const fallback = parse(encoded[encoded.length - 1], returnType, context);
  const args = new Array(encoded.length - 1);
  for (let i = 0; i < args.length - 1; i += 2) {
    try {
      const condition = parse(encoded[i + 1], BooleanType, context);
      args[i] = condition;
    } catch (err) {
      throw new Error(`failed to parse argument ${i} of case expression: ${err.message}`);
    }
    try {
      const output = parse(encoded[i + 2], fallback.type, context);
      args[i + 1] = output;
    } catch (err) {
      throw new Error(`failed to parse argument ${i + 1} of case expression: ${err.message}`);
    }
  }
  args[args.length - 1] = fallback;
  return args;
}
function withInArgs(encoded, returnType, context) {
  let haystack = encoded[2];
  if (!Array.isArray(haystack)) {
    throw new Error(`the second argument for the "in" operator must be an array`);
  }
  let needleType;
  if (typeof haystack[0] === "string") {
    if (haystack[0] !== "literal") {
      throw new Error(`for the "in" operator, a string array should be wrapped in a "literal" operator to disambiguate from expressions`);
    }
    if (!Array.isArray(haystack[1])) {
      throw new Error(`failed to parse "in" expression: the literal operator must be followed by an array`);
    }
    haystack = haystack[1];
    needleType = StringType;
  } else {
    needleType = NumberType;
  }
  const args = new Array(haystack.length);
  for (let i = 0; i < args.length; i++) {
    try {
      const arg = parse(haystack[i], needleType, context);
      args[i] = arg;
    } catch (err) {
      throw new Error(`failed to parse haystack item ${i} for "in" expression: ${err.message}`);
    }
  }
  const needle = parse(encoded[1], needleType, context);
  return [needle, ...args];
}
function withPaletteArgs(encoded, returnType, context) {
  let index;
  try {
    index = parse(encoded[1], NumberType, context);
  } catch (err) {
    throw new Error(`failed to parse first argument in palette expression: ${err.message}`);
  }
  const colors = encoded[2];
  if (!Array.isArray(colors)) {
    throw new Error("the second argument of palette must be an array");
  }
  const parsedColors = new Array(colors.length);
  for (let i = 0; i < parsedColors.length; i++) {
    let color;
    try {
      color = parse(colors[i], ColorType, context);
    } catch (err) {
      throw new Error(`failed to parse color at index ${i} in palette expression: ${err.message}`);
    }
    if (!(color instanceof LiteralExpression)) {
      throw new Error(`the palette color at index ${i} must be a literal value`);
    }
    parsedColors[i] = color;
  }
  return [index, ...parsedColors];
}
function createCallExpressionParser(...validators) {
  return function(encoded, returnType, context) {
    const operator = encoded[0];
    let args;
    for (let i = 0; i < validators.length; i++) {
      const parsed = validators[i](encoded, returnType, context);
      if (i == validators.length - 1) {
        if (!parsed) {
          throw new Error("expected last argument validator to return the parsed args");
        }
        args = parsed;
      }
    }
    return new CallExpression(returnType, operator, ...args);
  };
}
function parseCallExpression(encoded, returnType, context) {
  const operator = encoded[0];
  const parser = parsers[operator];
  if (!parser) {
    throw new Error(`unknown operator: ${operator}`);
  }
  return parser(encoded, returnType, context);
}
function computeGeometryType(geometry) {
  if (!geometry) {
    return "";
  }
  const type = geometry.getType();
  switch (type) {
    case "Point":
    case "LineString":
    case "Polygon":
      return type;
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
      return (
        /** @type {'Point'|'LineString'|'Polygon'} */
        type.substring(5)
      );
    case "Circle":
      return "Polygon";
    case "GeometryCollection":
      return computeGeometryType(
        /** @type {import("../geom/GeometryCollection.js").default} */
        geometry.getGeometries()[0]
      );
    default:
      return "";
  }
}

export {
  BooleanType,
  NumberType,
  StringType,
  ColorType,
  NumberArrayType,
  SizeType,
  typeName,
  LiteralExpression,
  CallExpression,
  newParsingContext,
  parse,
  Ops,
  computeGeometryType
};
//# sourceMappingURL=chunk-TDOEFV4W.js.map
