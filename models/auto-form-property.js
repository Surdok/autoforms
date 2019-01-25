const ezobjects = require(`ezobjects-mysql`);

const propertyTypes = [
  `text`,
  `date`,
  `datetime`,
  `time`,
  `array`,
];

const configAutoFormProperty = {
  className: `AutoFormProperty`,
  properties: [
    { name: `name`, type: `text` },
    { name: `type`, type: `text` },
    { name: `arrayOf`, type: `Object` },
    { name: `inputLabel`, type: `text` },
    { name: `inputColumns`, type: `int` },
    { name: `required`, type: `boolean` },
    { name: `disabled`, type: `boolean` },
    { name: `list`, type: `boolean` },
    { name: `listHeader`, type: `text` },
    { name: `listOrder`, type: `int` },
    { name: `inputColumns`, type: `int`, default: 16 },
    { name: `inputColumnsBefore`, type: `int` },
    { name: `inputColumnsAfter`, type: `int` },
    { name: `alignment`, type: `text`, default: `horizontal` },
    { name: `min`, type: `double` },
    { name: `max`, type: `double` },
    { name: `maxLength`, type: `int`, default: 32 },
    { name: `validation`, type: `function`, default: x => true },
    { name: `validationMessage`, type: `text` },
    { name: `options`, type: `array`, arrayOf: { type: `Object` } }
  ]
};

ezobjects.createClass(configAutoFormProperty);

/** Create method for validating auto form property configurations */
AutoFormProperty.prototype.validate() = function () {
  if ( this.inputLabel().length == 0 )
    this.inputLabel(this.name());
  
  if ( this.listHeader().length == 0 )
    this.listheader(this.name());
};
  
module.exports.AutoFormProperty = AutoFormProperty;
