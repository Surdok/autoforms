/** Require modules */
const autoforms = require(`./index`);
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
const server = new autoforms.AutoFormServer(db);

process.on('unhandledRejection', err => {
  console.log(err);
});

/** Add auto form configuration */
server.addAutoForm({
  path: `/discoveries`,           /** Required */
  tableName: `discoveries`,       /** Required */
  canAdd: true,                   /** Optional */
  canEdit: true,                  /** Optional */
  canArchive: true,               /** Optional */
  addPermission: 1,               /** Optional */
  editPermission: 1,              /** Optional */
  archivePermission: 1,           /** Optional */
  properties: [
    /** Example int (number) property */
    {
      name: `revision`,           /** Required */
      type: `int`,                /** Required */
      inputLabel: `Revision #:`,  /** Optional, defaults to configured 'name' */
      inputColumns: 6,            /** Optional, defaults to 16 */
      required: true,             /** Optional, defaults to false */
      min: 0,                     /** Optional */
      max: 999,                   /** Optional */
      validation: x => x >= 0,    /** Optional */
      validationMessage: `The revision number must be greater than zero.`     /** Optional */
    },
    /** Example date (date) property */
    {
      name: `revisionDate`,
      type: `date`,
      inputLabel: `Revision Date:`,
      inputColumns: 10,
      required: true,
      default: `1970-01-01`,      /** Optional, defaults to browser default */
      validation: x => x.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/),
      validationMessage: `That revision date is not valid.`
    },
    /** Example time (time) property */
    {
      name: `revisionTime`,
      type: `time`,
      inputLabel: `Revision Time:`,
      inputColumns: 8,
      inputColumnsAfter: 8,
      required: true,
      default: `12:00:00`,        /** Optional, defaults to browser default */
      validation: x => x.match(/[0-9]{4}:[0-9]{2}:[0-9]{2}/),
      validationMessage: `That revision time is not valid.`
    },
    /** Example text (text) property */
    { 
      name: `name`,         
      type: `text`, 
      maxLength: 32,              /** Optional, defaults to 64 */
      list: true,                 /** Required for at least one property */
      listHeader: `Name`,         /** Optional, defaults to configured 'name' */
      listOrder: 1,               /** Optional, defaults to user programmed order in this 'properties' configuration array */
      sortOrder: 1,               /** Optional, defaults to default MySQL behavior */
      inputLabel: `Name:`,
      inputColumns: 12,
      inputColumnsAfter: 4,       /** Optional */
      required: true
    },
    /** Example textarea (textarea) property */
    { 
      name: `description`, 
      type: `textarea`, 
      maxLength: 256, 
      inputLabel: `Description:`,
      inputColumns: 16,
      placeholder: `Please provide a description...`,      /** Optional */
    },
    /** Example array of int (multi-select) property */
    { 
      name: `characteristics`, 
      type: `array`, 
      arrayOf: { type: `int` },   /** Required when 'type' is configured as 'array' */
      inputType: `multi-select`,  /** Optional, defaults to 'checkboxes' when 'type' is configured as 'array' */
      inputLabel: `Characteristics:`,
      inputColumns: 6,
      inputColumnsAfter: 2,
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
          label: `Valuable`, 
          value: 3
        },
      ]
    },
    /** Example double (text) property */
    {
      name: `kilograms`,
      type: `double`,
      inputLabel: `Weight (kg):`,
      inputColumns: 6,
      inputColumnsAfter: 2
    },
    /** Example text (select) property */
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
    /** Example checkboxes (checkbox) property */
    {
      name: `elements`,
      type: `array`,
      arrayOf: { type: `text`, maxLength: 2 },
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
    /** Example email (email) property */
    {
      name: `discovererEmail`,
      type: `email`,
      inputLabel: `Discoverer's Email Address:`,
      inputColumns: 13,
      inputColumnsAfter: 3
    },
    /** Example telephone (tel) property */
    {
      name: `discovererTelephone`,
      type: `telephone`,
      inputLabel: `Discoverer's Telephone #:`,
      inputColumns: 10,
      inputColumnsAfter: 6
    },
    /** Example url (url) property */
    {
      name: `url`,
      type: `url`,
      inputLabel: `Discoverer's URL:`,
      inputColumns: 16
    },
    /** Example datetime (datetime) property */
    {
      name: `discoveredDateTime`,
      type: `datetime`,
      list: true,
      listHeader: `Discovered`,
      listOrder: 3,
      inputLabel: `Date/time Discovered:`,
      inputColumns: 10,
      inputColumnsAfter: 2
    },
    /** Example color (color) property */
    {
      name: `color`,
      type: `color`,
      inputLabel: `Color:`,
      inputColumns: 4
    },
    /** Example radios (radios) property */
    {
      name: `continent`,
      type: `int`,
      list: true,
      listHeader: `Continent`,
      listOrder: 2,
      inputType: `radios`, /** Optional, defaults to 'select' when 'type' is *not* configured as 'array' */
      inputLabel: `Continent:`,
      inputColumns: 16,
      alignment: `vertical`,
      options: [
        {
          label: `Africa`,
          value: 0
        },
        {
          label: `Antarctica`,
          value: 1
        },
        {
          label: `Asia`,
          value: 2
        },
        {
          label: `Australia`,
          value: 3
        },
        {
          label: `Europe`,
          value: 4
        },
        {
          label: `North America`,
          value: 5
        },
        {
          label: `South America`,
          value: 6
        }
      ]
    },
    /** Example file (file) property */
    {
      name: `picture`,
      type: `file`,
      allowedExtensions: [`png`, `jpg`, `gif`],
      inputLabel: `Item Picture:`,
      inputColumns: 16
    }
  ]
});

/** Use self-executing asynchronous function so we can await database table creation */
(async () => {
  /** Create database tables if they don't already exist */
  await server.createTables();

  /** Start server on configured port */
  await server.listen(port);
  
  console.log(`AutoForm Server up and running on port ${port}!`);
})();