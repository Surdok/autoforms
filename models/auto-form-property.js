/** Require external modules */
const ezobjects = require(`ezobjects-mysql`);

/** Define property types */
const propertyTypes = [
  `text`,
  `int`,
  `double`,
  `color`,
  `date`,
  `datetime`,
  `time`,
  `url`,
  `telephone`,
  `email`,
  `textarea`,
  `file`,
  `array`
];

/** Define arrayOf types */
const arrayOfTypes = [
  `text`,
  `int`,
  `double`
];

/** Configure AutoFormProperty class */
const configAutoFormProperty = {
  className: `AutoFormProperty`,
  properties: [
    { name: `name`, type: `text` },
    { name: `type`, type: `text` },
    { name: `canEdit`, type: `boolean`, default: true },
    { name: `arrayOf`, type: `Object` },
    { name: `inputType`, type: `text` },
    { name: `inputLabel`, type: `text` },
    { name: `inputColumns`, type: `int`, default: 16 },
    { name: `inputColumnsBefore`, type: `int` },
    { name: `inputColumnsAfter`, type: `int` },
    { name: `required`, type: `boolean` },
    { name: `disabled`, type: `boolean` },
    { name: `list`, type: `boolean` },
    { name: `listHeader`, type: `text` },
    { name: `listOrder`, type: `int` },
    { name: `sortOrder`, type: `int` },
    { name: `alignment`, type: `text`, default: `horizontal` },
    { name: `min`, type: `double` },
    { name: `max`, type: `double` },
    { name: `pattern`, type: `text` },
    { name: `maxLength`, type: `int`, default: 32 },
    { name: `validation`, type: `function`, default: x => true },
    { name: `validationMessage`, type: `text` },
    { name: `options`, type: `array`, arrayOf: { type: `Object` } }
  ]
};

/** Create AutoFormProperty class */
ezobjects.createClass(configAutoFormProperty);

/** Create method for validating auto form property configurations */
AutoFormProperty.prototype.validate = function () {
  /** Validate name */
  if ( this.name().length == 0 )
    throw new ReferenceError(`AutoFormProperty.validate(): Property missing required 'name'.`);
  
  if ( !this.name().match(/^[a-zA-Z]{1}[a-zA-Z0-9_]+/) )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'name', must start with letter and contain only 'a-zA-Z0-9_'.`);
  
  if ( this.name() == `id` || this.name() == `archived` )
    throw new SyntaxError(`AutoFormProperty.validate(): Invalid property 'name', cannot use reserved names of 'id' or 'archived'`);
    
  /** Validate type */
  if ( this.type().length == 0 )
    this.type(`text`);
  
  if ( !propertyTypes.includes(this.type()) )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'type' of '${this.type()}', see documentation.`);
  
  /** Validate arrayOf */  
  if ( this.type() == `array` && typeof this.arrayOf().type == `undefined` )
    throw new ReferenceError(`AutoFormProperty.validate(): Property type of 'array' missing required 'arrayOf'.`);
  
  /** Validate inputType */
  if ( this.type() == `array` && this.inputType() != `` && this.inputType() != `checkboxes` && this.inputType() != `multi-select` )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'inputType' of '${this.inputType()}' for 'type' of '${this.type()}', see documentation.`);
  
  if ( this.type() != `array` && this.options().length > 0 && this.inputType() != `` && this.inputType() != `radios` && this.inputType() != `select` )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'inputType' of '${this.inputType()}' for 'type' of '${this.type()}', see documentation.`);

  if ( this.type() == `array` && this.inputType() == `` )
    this.inputType(`checkboxes`);
  
  if ( this.type() != `array` && this.inputType() == `` )
    this.inputType(`select`);
  
  /** Validate inputLabel */
  if ( this.inputLabel().length == 0 )
    this.inputLabel(this.name());
  
  /** Validate inputColumns */
  if ( this.inputColumns() < 1 || this.inputColumns() > 16 )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'inputColumns', must be between 1 and 16 inclusive.`);
  
  /** Validate inputColumnsBefore */
  if ( this.inputColumnsBefore() < 0 || this.inputColumnsBefore() > 15 )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'inputColumnsBefore', must be between 0 and 15 inclusive.`);
  
  /** Validate inputColumnsAfter */
  if ( this.inputColumnsAfter() < 0 || this.inputColumnsAfter() > 15 )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'inputColumnsAfter', must be between 0 and 15 inclusive.`);
  
  /** Validate listHeader */
  if ( this.listHeader().length == 0 )
    this.listHeader(this.name());
  
  /** Validate alignment */
  if ( this.alignment() != `` && this.alignment() != `horizontal` && this.alignment() != `vertical` )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'alignment' of '${this.alignment()}', see documentation.`);

  /** Validate maxLength */
  if ( this.maxLength() <= 0 )
    throw new RangeError(`AutoFormProperty.validate(): Invalid property 'maxLength', must be greater than zero.`);
};
  
/** Export AutoFormProperty class */
module.exports.AutoFormProperty = AutoFormProperty;
