/** Require modules */
const moment = require(`moment`);

/** Define MySQL to JavaScript transforms */
const mysqlToJavaScriptTransforms = [
  { from: `date`, to: `date`, transform: x => new Date(x) },
];

/** Define JavaScript to MySQL transforms */
const javaScriptToMySQLTransforms = [
  { from: `date`, to: `date`, transform: x => x.toString() },
];

/** Define HTML input to JavaScript transforms */
const inputToJavaScriptTransforms = [
  { from: `date`, to: `date`, transform: x => new Date(x) },
];

/** Define JavaScript to HTML input transforms */
const javaScriptToInputTransforms = [
  { from: `date`, to: `date`, transform: x => moment(x).format(`Y-MM-DD`) },
];

module.exports.mysqlToJavaScript = (from, to, value) => {
  /** Attempt to find transform appropriate for from/to combination */
  const transform = mysqlToJavaScriptTransforms.find(x => ( x.from == from || x.from == `*` ) && ( x.to == to || x.to == `*` ));
  
  /** If none is found, assume no transformation needed and return original value */
  if ( !transform )
    return value;
  
  /** Otherwise, apply transform and return result */
  return transform.transform(value);
};
  
module.exports.javaScriptToMySQL = (from, to, value) => {
  /** Attempt to find transform appropriate for from/to combination */
  const transform = javaScriptToMySQLTransforms.find(x => ( x.from == from || x.from == `*` ) && ( x.to == to || x.to == `*` ));
  
  /** If none is found, assume no transformation needed and return original value */
  if ( !transform )
    return value;
  
  /** Otherwise, apply transform and return result */
  return transform.transform(value);
};

module.exports.inputToJavaScript = (from, to, value) => {
  /** Attempt to find transform appropriate for from/to combination */
  const transform = inputToJavaScriptTransforms.find(x => ( x.from == from || x.from == `*` ) && ( x.to == to || x.to == `*` ));
  
  /** If none is found, assume no transformation needed and return original value */
  if ( !transform )
    return value;
  
  /** Otherwise, apply transform and return result */
  return transform.transform(value);
};

module.exports.javaScriptToInput = (from, to, value) => {
  /** Attempt to find transform appropriate for from/to combination */
  const transform = javaScriptToInputTransforms.find(x => ( x.from == from || x.from == `*` ) && ( x.to == to || x.to == `*` ));
  
  /** If none is found, assume no transformation needed and return original value */
  if ( !transform )
    return value;
  
  /** Otherwise, apply transform and return result */
  return transform.transform(value);
};
