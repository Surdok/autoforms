const ezobjects = require(`ezobjects-mysql`);

const configAutoForm = {
  className: `AutoForm`,
  properties: [
    { name: `path`, type: `text` },
    { name: `tableName`, type: `text` },
    { name: `canAdd`, type: `boolean` },
    { name: `canEdit`, type: `boolean` },
    { name: `canArchive`, type: `boolean` },
    { name: `addPermission`, type: `int`, default: -1 },
    { name: `editPermission`, type: `int`, default: -1 },
    { name: `archivePermission`, type: `int`, default: -1 },
    { name: `headerTemplate`, type: `text` },
    { name: `footerTemplate`, type: `text` },
    { name: `addTemplate`, type: `text` },
    { name: `editTemplate`, type: `text` },
    { name: `listTemplate`, type: `text` },
    { name: `columns`, type: `array`, arrayOf: { type: `Object` } },
    { name: `ezobject`, instanceOf: `Object` }
  ]
};

ezobjects.createClass(configAutoForm);

/** Create method for validating auto form configurations */
AutoForm.prototype.validate() = function () {
  if ( this.path().length == 0 )
    this.path(`/`);

  else if ( this.path()[this.path().length - 1] == `/` )
    this.path(this.path().substring(0, this.path().length - 1));
  
  if ( this.tableName().length == 0 )
    throw new Error(`AutoFormProperty.validate(): Required 'tableName' property is not set.`);

  if ( this.columns().length == 0 )
    throw new Error(`AutoFormProperty.validate(): Required 'columns'.`);
  
  /** Validate this properties */
  this.properties.forEach((property) => {
    if ( property.cols )
      property.cols = 16;
    
    if ( !property.colsBefore )
      property.colsBefore = 0;
    
    if ( !property.colsAfter )
      property.colsAfter = 0;
    
    if ( !property.pattern )
      property.pattern = ``;
    
    if ( !property.required )
      property.required = false;
    
    if ( !property.editable )
      property.editable = property.name == `id` ? false : true;
    
    if ( !property.name )
      throw new Error(`AutoForm.validate(): Property missing required 'name'.`);
    
    if ( !property.listHeader )
      property.listHeader = property.name;
    
    if ( !property.formLabel )
      property.formLabel = property.name;
  });
};
  
module.exports.AutoForm = AutoForm;
