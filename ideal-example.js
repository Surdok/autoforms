/** Require modules */
const autoforms = require(`autoforms`);
const fs = require(`fs`);

/** Define server port */
const port = 7000;

/** Read in MySQL configuration from JSON file */
const mysqlConfig = JSON.parse(fs.readFileSync(`mysql-config.json`));

/** 
 * Create MySQL database connection using provided utility class, which
 * simply wraps the popular 'mysql' node module with async/await capabilities.
 */
const db = new autoforms.MySQLConnection(mysqlConfig);

/** Create auto form server object */
const server = new autoforms.AutoFormServer();

/** Add one or more auto form configurations */
server.addAutoForm({
  path: `/items`,                 /** Required */
  className: `Item`,              /** Required */
  tableName: `items`,             /** Required */
  columns: [
    {
      name: `revision`,           /** Required */
      type: `int`,                /** Required */
      inputLabel: `Revision #:`,  /** Optional, defaults to configured 'name' */
      inputColumns: 8,            /** Optional, defaults to 16 */
      required: true,             /** Optional, defaults to false */
      min: 0,                     /** Optional, 'max' is also an optional property configuration option */
      validation: x => x >= 0,    /** Optional */
      validationMessage: `The revision number must be greater than zero.`     /** Optional */
    },
    {
      name: `revisionDate`,
      type: `date`,
      inputLabel: `Revision Date:`,
      inputColumns: 8,
      required: true,
      default: `1970-01-01`,      /** Optional, defaults to browser default */
      validation: x => x.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/),
      validationMessage: `That revision date is not valid.`
    },
    {
      name: `revisionTime`,
      type: `time`,
      inputLabel: `Revision Time:`,
      inputColumns: 8,
      required: true,
      default: `12:00:00`,        /** Optional, defaults to browser default */
      validation: x => x.match(/[0-9]{4}:[0-9]{2}:[0-9]{2}/),
      validationMessage: `That revision time is not valid.`
    },
    { 
      name: `name`,         
      type: `text`, 
      maxLength: 32,              /** Optional, defaults to 64 */
      list: true,                 /** Required for at least one property */
      listHeader: `Name`,         /** Optional, defaults to configured 'name' */
      listOrder: 1,               /** Optional, defaults to user programmed order in this 'columns' configuration array */
      inputLabel: `Name:`,
      inputColumns: 12,
      inputColumnsAfter: 4,       /** Optional */
      required: true
    },
    { 
      name: `description`, 
      type: `textarea`, 
      maxLength: 256, 
      inputLabel: `Description:`,
      inputColumns: 16,
      placeholder: `Please provide an item description...`,      /** Optional */
    },
    { 
      name: `flags`, 
      type: `array`, 
      arrayOf: { type: `int` },   /** Required when 'type' is configured as 'array' */
      inputType: `multiselect`,   /** Optional, defaults to checkboxes */
      inputLabel: `Characteristics:`,
      inputColumns: 8,
      options: [                  /** Required when 'type' is configured as 'array' */
        { 
          label: `Shiny`,         /** Optional, defaults to configured 'value' */
          value: 1                /** Required */
        },
        { 
          label: `Immobile`, 
          value: 2, 
          selected: true          /** Optional, defaults to false */
        },
        { 
          label: `Solid`, 
          value: 3
        },
      ]
    },
    {
      name: `color`,
      type: `color`,
      inputLabel: `Color:`,
      inputColumns: 4
    },
    {
      name: `kilograms`,
      type: `double`,
      inputLabel: `Weight (kg):`,
      inputColumns: 4
    },
    {
      name: `density`,
      type: `text`,
      inputLabel: `Density:`,
      inputColumns: 6,
      inputColumnsAfter: 2,
      options: [                  /** Optional when used with 'type' configured as text, int, or double */
        {
          label: `Solid`,
          value: `solid`
        },
        {
          label: `Soft`,
          value: `soft`
        }
      ]
    },
    {
      name: `elements`,
      type: `array`,
      arrayOf: `text`,
      inputLabel: `Elements:`,
      inputColumns: 8,
      alignment: `vertical`,      /** Optional, defaults to horizontal */
      options: [
        {
          label: `Carbon (C)`,
          value: `C`,
        },
        {
          label: `Nitrogen (N)`,
          value: `N`,
        },
        {
          label: `Oxygen (O)`,
          value: `O`,
        },
        {
          label: `Silicon (S)`,
          value: `S`
        },
        {
          label: `Iron (Fe)`,
          value: `Fe`
        }
      ]
    },
    {
      name: `discovererEmail`,
      type: `email`,
      inputLabel: `Discoverer's Email Address:`,
      inputColumns: 13,
      inputColumnsAfter: 3
    },
    {
      name: `discovererTelephone`,
      type: `tel`,
      inputLabel: `Discoverer's Telephone #:`,
      inputColumns: 10,
      inputColumnsAfter: 6
    },
    {
      name: `url`,
      type: `url`,
      inputLabel: `Discoverer's URL:`,
      inputColumns: 16
    },
    {
      name: `discoveredDateTime`,
      type: `datetime`,
      inputLabel: `Date/time Discovered:`,
      inputColumns: 10,
      inputColumnsAfter: 6
    },
    {
      name: `picture`,
      type: `file`,
      inputLabel: `Item Picture:`,
      inputColumns: 16
    }
  ]
});

/** Start server on configured port */
server.listen(port, () => {
  console.log(`AutoForm Server up and running on port ${port}!`);
});
