# AutoForms v2.1.0

Automatic form generation for basic table management.

## Status

Fully functional!

## Installation

`npm i autoforms`

## Configuration

There are three types of configuration settings used in AutoForms.  The first type of settings are called **global** configuration
settings, and they affect the way the entire AutoForm website works.  The second type of settings are called **property** configuration
settings, and they are specfic to the property under which they are configured.  The last type of settings are called *option** configuration
settings, and they are specific to the property options under which they are configured.  For a complete list of configuration options,
see the lists below:

### Global Configuration Settings

* `path` - (Required) The path of the AutoForm relative to the server root, e.g. '/discoveries' would be the path if you wanted an AutoForm's list page to be at [http://localhost:port/discoveries/list](http://localhost:port/discoveries/list)
* `tableName` - (Required) The MySQL table name that should be created and maintained as part of this AutoForm
* `canAdd` - (Optional) True/false value indicating whether certain people should be able to add to this data table - defaults to false
* `canEdit` - (Optional) True/false value indicating whether certain people should be able to edit records in this data table - defaults to false
* `canArchive` - (Optional) True/false value indicating whether certain people should be able to archive records in this data table, with archive meaning the record gets hidden but not permanently deleted - defaults to false
* `canDelete` - (Optional) True/false value indicating whether certain people should be able to delete records in this data table, with delete meaning permanent deletion - defaults to false
* `addPermission` - (Optional) Integer value indicating the permission a user must have in order to add records (assuming `canAdd` is set to true)
* `editPermission` - (Optional) Integer value indicating the permission a user must have in order to edit records (assuming `canEdit` is set to true)
* `archivePermission` - (Optional) Integer value indicating the permission a user must have in order to archive records (assuming `canArchive` is set to true)
* `deletePermission` - (Optional) Integer value indicating the permission a user must have in order to delete records (assuming `canDelete` is set to true)
* `headerTemplate` - (Optional) An express route that adds desired HTML markup to the start of the request response
* `addTemplateBefore` - (Optional) An express route that adds desired HTML markup to the add record page before the add form
* `addTemplateAfter` - (Optional) An express route that adds desired HTML markup to the add record page after the add form
* `createTemplateBefore` - (Optional) An express route that adds desired HTML markup to the create page before the create form
* `createTemplateAfter` - (Optional) An express route that adds desired HTML markup to the create page after the create form
* `editTemplateBefore` - (Optional) An express route that adds desired HTML markup to the edit record page before the edit form
* `editTemplateAfter` - (Optional) An express route that adds desired HTML markup to the edit record page after the edit form
* `listTemplateBefore` - (Optional) An express route that adds desired HTML markup to the list records page before the list table
* `listTemplateAfter` - (Optional) An express route that adds desired HTML markup to the list records page after the list table
* `loginTemplateBefore` - (Optional) An express route that adds desired HTML markup to the login page before the login form
* `loginTemplateAfter` - (Optional) An express route that adds desired HTML markup to the login page after the login form
* `footerTemplate` - (Optional) An express route that adds desired HTML markup to the end of the request response
* `properties` - (Required) An array of property configurations that should be included as part of this AutoForm

### Property Configuration Settings

* `name` - (Required) The name of the property - must start with letter and contain only 'a-zA-Z0-9_'
* `type` - (Required) The property type - must be text, textarea, int, double, date, datetime, time, email, url, telephone, color, file, or array, with array types requiring a separate `arrayOf` property configuration setting
* `maxLength` - (Optional) The max length of the text - required for `type=text` and `type=textarea`
* `inputLabel` - (Optional) The label to use for the input on the add and edit forms - defaults to `name`
* `inputType` - (Optional) For `type=string`, `type=int`, and `type=double` with property `options`, input type can be `radios` or `select` - default is `select`.  For `type=array`, input type can be `checkboxes` or `multi-select` - default is `checkboxes`
* `inputColumns` - (Optional) The number of columns to use for the input out of a maximum of a possible 16 total - defaults to 16
* `inputColumnsBefore` - (Optional) The number of columns of blank space to use before the input - defaults to 0 - **note:** `inputColumns` + `inputColumnsBefore` + `inputColumnsAfter` cannot exceed 16 columns
* `inputColumnsAfter` - (Optional) The number of columns of blank space to use after the input - defaults to 0 - **note:** `inputColumns` + `inputColumnsBefore` + `inputColumnsAfter` cannot exceed 16 columns
* `list` - (Optional) True/false value indicating whether this property should be displayed in the list table - defaults to false - **note:** at least one property must have `list` set to `true`
* `listHeader` - (Optional) The text to use for the column header in the list table assuming `list=true` - defaults to `name`
* `listOrder` - (Optional) The column order of the property in the list table, starting from the number one
* `sortOrder` - (Optional) The order by which the property should be sorted, starting from the number one, assuming sorting of this property is desired
* `alignment` - (Optional) The manner by which to align the inputs for `type=checkboxes` and `type=radios` properties, can be `horizontal` or `vertical` - defaults to `horizontal`
* `allowedExtensions` - (Optional) An array of strings containing file extensions allowed for a given `type=file` input, e.g. ['png', 'jpg', 'gif']
* `options` - (Optional) An array of option configurations that should be included as part of this AutoForm property

### Option Configuration Settings

* `label` - (Required) The label to use for the option when displaying the option
* `value` - (Required) The value to use for storing the option in the database
* `selected` - (Optional) True/false value indicating whether the option should be selected by default

## Known Issues / Project Todo

* Finish implementation of `type=file`, currently not functional

## License

MIT
