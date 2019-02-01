/** Require external modules */
const ezobjects = require(`ezobjects-mysql`);
const fs = require(`fs`);
const path = require(`path`);

/** Configure AutoForm class */
const configAutoForm = {
  className: `AutoForm`,
  properties: [
    { name: `path`, type: `text` },
    { name: `tableName`, type: `text` },
    { name: `canAdd`, type: `boolean` },
    { name: `canDelete`, type: `boolean` },
    { name: `canEdit`, type: `boolean` },
    { name: `canArchive`, type: `boolean` },
    { name: `addPermission`, type: `int`, default: -1 },
    { name: `deletePermission`, type: `int`, default: -1 },
    { name: `editPermission`, type: `int`, default: -1 },
    { name: `archivePermission`, type: `int`, default: -1 },
    { name: `editIconPath`, type: `text`, default: path.resolve(__dirname + `/../images/edit.png`) },
    { name: `archiveIconPath`, type: `text`, default: path.resolve(__dirname + `/../images/archive.png`) },
    { name: `deleteIconPath`, type: `text`, default: path.resolve(__dirname + `/../images/delete.png`) },
    { name: `headerTemplate`, type: `function`, default: (req, res, next) => next() },
    { name: `addTemplateBefore`, type: `function`, default: (req, res, next) => next() },
    { name: `editTemplateBefore`, type: `function`, default: (req, res, next) => next() },
    { name: `listTemplateBefore`, type: `function`, default: (req, res, next) => next() },
    { name: `loginTemplateBefore`, type: `function`, default: (req, res, next) => next() },
    { name: `createTemplateBefore`, type: `function`, default: (req, res, next) => next() },
    { name: `addTemplateAfter`, type: `function`, default: (req, res, next) => next() },
    { name: `editTemplateAfter`, type: `function`, default: (req, res, next) => next() },
    { name: `listTemplateAfter`, type: `function`, default: (req, res, next) => next() },
    { name: `loginTemplateAfter`, type: `function`, default: (req, res, next) => next() },
    { name: `createTemplateAfter`, type: `function`, default: (req, res, next) => next() },
    { name: `footerTemplate`, type: `function`, default: (req, res, next) => next() },
    { name: `configRecord`, type: `object` },
    { name: `properties`, type: `array`, arrayOf: { instanceOf: `AutoFormProperty` } }
  ]
};

/** Create AutoForm class */
ezobjects.createClass(configAutoForm);

/** Create method for validating auto form configurations */
AutoForm.prototype.validate = function () {
  /** Validate path */
  if ( this.path().length == 0 )
    throw new ReferenceError(`AutoFormProperty.validate(): Required 'path' is not set.`);
  
  if ( !this.path().match(/^(\/\w+)*$/) )
    throw new RangeError(`AutoForm.validate(): Invalid 'path', must be valid URL path like '/myform', see documentation.`);

  if ( this.path() == `` )
    this.path(`/`);

  /** Validate table name */
  if ( this.tableName().length == 0 )
    throw new ReferenceError(`AutoFormProperty.validate(): Required 'tableName' is not set.`);
  
  if ( !this.tableName().match(/^[a-zA-Z]{1}[a-zA-Z0-9_]+/) )
    throw new RangeError(`AutoForm.validate(): Invalid 'tableName', must start with letter and contain only 'a-zA-Z0-9_'.`);

  /** Validate addPermission */
  if ( this.addPermission() < -1 )
    throw new RangeError(`AutoForm.validate(): Invalid 'addPermission', must be integer value greater than zero.`);
  
  /** Validate deletePermission */
  if ( this.deletePermission() < -1 )
    throw new RangeError(`AutoForm.validate(): Invalid 'deletePermission', must be integer value greater than zero.`);
  
  /** Validate editPermission */
  if ( this.editPermission() < -1 )
    throw new RangeError(`AutoForm.validate(): Invalid 'editPermission', must be integer value greater than zero.`);
  
  /** Validate archivePermission */
  if ( this.archivePermission() < -1 )
    throw new RangeError(`AutoForm.validate(): Invalid 'archivePermission', must be integer value greater than zero.`);
  
  /** Validate properties */
  if ( this.properties().length == 0 )
    throw new ReferenceError(`AutoFormProperty.validate(): There are no 'properties' configured for this form.`);
  
  /** Validate this properties */
  this.properties().forEach(property => property.validate());
};

/** Create method for generating form record class */
AutoForm.prototype.generateClass = function () {
  /** Configure record class */
  const configRecord = {
    tableName: this.tableName(),
    className: this.tableName(),
    properties: [
      { name: `id`, type: `int` }
    ]
  };
  
  /** Configure record properties based on auto form properties */
  this.properties().forEach((property) => {
    if ( property.type() == `text` )
      configRecord.properties.push({ name: property.name(), type: `varchar`, length: property.maxLength() });
    else if ( property.type() == `int` )
      configRecord.properties.push({ name: property.name(), type: `int` });
    else if ( property.type() == `double` )
      configRecord.properties.push({ name: property.name(), type: `double` });
    else if ( property.type() == `color` )
      configRecord.properties.push({ name: property.name(), type: `varchar`, length: 7 });
    else if ( property.type() == `date` )
      configRecord.properties.push({ name: property.name(), type: `date` });
    else if ( property.type() == `datetime` )
      configRecord.properties.push({ name: property.name(), type: `datetime` });
    else if ( property.type() == `time` )
      configRecord.properties.push({ name: property.name(), type: `time` });
    else if ( property.type() == `url` )
      configRecord.properties.push({ name: property.name(), type: `text` });
    else if ( property.type() == `telephone` )
      configRecord.properties.push({ name: property.name(), type: `varchar`, length: 32 });
    else if ( property.type() == `email` )
      configRecord.properties.push({ name: property.name(), type: `tinytext` });
    else if ( property.type() == `textarea` )
      configRecord.properties.push({ name: property.name(), type: `varchar`, length: property.maxLength() });
    else if ( property.type() == `file` )
      configRecord.properties.push({ name: property.name(), type: `tinytext` });
    else if ( property.type() == `array` && [`int`, `double`].includes(property.arrayOf().type) )
      configRecord.properties.push({ name: property.name(), type: `array`, arrayOf: property.arrayOf() });
    else if ( property.type() == `array` && property.arrayOf().type == `text` )
      configRecord.properties.push({ name: property.name(), type: `array`, arrayOf: { type: `varchar`, length: property.arrayOf().maxLength } });
  });
  
  /** Create record class */
  ezobjects.createClass(configRecord);
  
  /** Save record config and class to auto form */
  this.configRecord(configRecord);
  this.Record = global[this.tableName()];
};
  
/** Export AutoForm class */
module.exports.AutoForm = AutoForm;
