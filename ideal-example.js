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
const server = new autoforms.AutoFormServer(db);

/** Grab express app if you want to do other stuff */
const app = server.app();

/** Interact with user accounts */
const user = new autoforms.UserAccount();

/** Three possible methods to add auto forms... */

/** Method #1 */

const autoform = new autoforms.AutoForm();

autoform.path(`/discoveries`); 
autoform.tableName(`discoveries`);  
/** ... */
autoform.columns().push({
  name: `revision`,           /** Required */
  type: `int`,                /** Required */
  inputLabel: `Revision #:`,  /** Optional, defaults to configured 'name' */
  inputColumns: 8,            /** Optional, defaults to 16 */
  required: true,             /** Optional, defaults to false */
  min: 0,                     /** Optional */
  max: 999,                   /** Optional */
  validation: x => x >= 0,    /** Optional */
  validationMessage: `The revision number must be greater than zero.`     /** Optional */
});
/** Etc, etc with values like below... */

server.addAutoForm(autoform);

/** Method #2 */

const autoform = new autoforms.AutoForm({
  path: `/discoveries`,
  tableName: `discoveries`,
  /** Etc, etc with values like below... */
});

server.addAutoForm(autoform);

/** Method #3 (and full example) */

server.addAutoForm({
  path: `/discoveries`,           /** Required */
  tableName: `discoveries`,       /** Required */
  canAdd: true,                   /** Optional */
  canEdit: true,                  /** Optional */
  canArchive: true,               /** Optional */
  addPermission: 1,               /** Optional */
  editPermission: 1,              /** Optional */
  archivePermission: 1,           /** Optional */
  headerTemplate: fs.readFileSync(`templates/header.ejs`),     /** Optional */
  footerTemplate: fs.readFileSync(`templates/footer.ejs`),     /** Optional */
  addTemplate: fs.readFileSync(`templates/add.ejs`),           /** Optional */
  editTemplate: fs.readFileSync(`templates/edit.ejs`),         /** Optional */
  listTemplate: fs.readFileSync(`templates/list.ejs`),         /** Optional */
  columns: [
    /** Example int (number) column */
    {
      name: `revision`,           /** Required */
      type: `int`,                /** Required */
      inputLabel: `Revision #:`,  /** Optional, defaults to configured 'name' */
      inputColumns: 8,            /** Optional, defaults to 16 */
      required: true,             /** Optional, defaults to false */
      min: 0,                     /** Optional */
      max: 999,                   /** Optional */
      validation: x => x >= 0,    /** Optional */
      validationMessage: `The revision number must be greater than zero.`     /** Optional */
    },
    /** Example date (date) column */
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
    /** Example time (time) column */
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
    /** Example text (text) column */
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
    /** Example textarea (textarea) column */
    { 
      name: `description`, 
      type: `textarea`, 
      maxLength: 256, 
      inputLabel: `Description:`,
      inputColumns: 16,
      placeholder: `Please provide a description...`,      /** Optional */
    },
    /** Example array of int (multi-select) column */
    { 
      name: `characteristics`, 
      type: `array`, 
      arrayOf: { type: `int` },   /** Required when 'type' is configured as 'array' */
      inputType: `multi-select`,  /** Optional, defaults to checkboxes */
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
          label: `Valuable`, 
          value: 3
        },
      ]
    },
    /** Example color (color) column */
    {
      name: `color`,
      type: `color`,
      inputLabel: `Color:`,
      inputColumns: 4
    },
    /** Example double (text) column */
    {
      name: `kilograms`,
      type: `double`,
      inputLabel: `Weight (kg):`,
      inputColumns: 4
    },
    /** Example text (select) column */
    {
      name: `density`,
      type: `text`,
      inputType: `select`,
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
    /** Example checkboxes (checkbox) column */
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
    /** Example email (email) column */
    {
      name: `discovererEmail`,
      type: `email`,
      inputLabel: `Discoverer's Email Address:`,
      inputColumns: 13,
      inputColumnsAfter: 3
    },
    /** Example telephone (tel) column */
    {
      name: `discovererTelephone`,
      type: `telephone`,
      inputLabel: `Discoverer's Telephone #:`,
      inputColumns: 10,
      inputColumnsAfter: 6
    },
    /** Example url (url) column */
    {
      name: `url`,
      type: `url`,
      inputLabel: `Discoverer's URL:`,
      inputColumns: 16
    },
    /** Example datetime (datetime) column */
    {
      name: `discoveredDateTime`,
      type: `datetime`,
      list: true,
      listHeader: `Discovered`,
      listOrder: 3,
      inputLabel: `Date/time Discovered:`,
      inputColumns: 10
    },
    /** Example radios (radios) column */
    {
      name: `continent`,
      type: `int`,
      list: true,
      listHeader: `Continent`,
      listOrder: 2,
      inputType: `radios`,
      inputLabel: `Continent:`,
      inputColumns: 6,
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
    /** Example file (file) column */
    {
      name: `picture`,
      type: `file`,
      allowedExtensions: [`png`, `jpg`, `gif`],
      inputLabel: `Item Picture:`,
      inputColumns: 16
    }
  ]
});

/** Start server on configured port */
server.listen(port, () => {
  console.log(`AutoForm Server up and running on port ${port}!`);
});
