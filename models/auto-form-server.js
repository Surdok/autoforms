/** Require external modules */
const ejs = require(`ejs`);
const express = require(`express`);
const ezobjects = require(`ezobjects-mysql`);
const fs = require(`fs`);
const htmlspecialchars = require(`htmlspecialchars`);
const parser = require(`body-parser`);
const session = require(`express-session`);
const store = require(`session-file-store`);
const url = require(`url`);

/** Require local moduels */
const models = require(`./index`);
const views = require(`../views`);

/** Configure AutoFormServer EZ Object */
const configAutoFormServer = {
  className: `AutoFormServer`,
  properties: [
    { name: `app`, type: `function` },
    { name: `db`, type: `MySQLConnection` },
    { name: `autoforms`, type: `array`, arrayOf: { type: `AutoForm` } }
  ]
};

/** Create AutoFormServer class */
ezobjects.createClass(configAutoFormServer);

/** Replace init() method with more elaborate initialization */
AutoFormServer.prototype.init = function (db = null) {
  /** Store db */
  this.db(db);
  
  const app = express();
  
  console.log(app.constructor.name);
  
  /** Create express app and store */
  this.app(app);
  
  /** Use external body parser middleware to parse POST params into request body */
  this.app().use(parser.urlencoded({ extended: true }));
  
  /** Create session file store */
  const FileStore = store(session);

  /** Use external session middleware to store user session variables */
  this.app().use(session({
    store: new FileStore({ logFn: () => {} }),
    secret: `JAs,fj$@nflkfj23f-h3kFSD<25%%$t54g5!t2fj0DF(*)S*FS`,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1209600000
    }
  }));
  
  /** Create route for example CSS */
  this.app().get(`/css/autoforms.css`, (req, res) => {
    if ( fs.access(`css/autoforms.css`) )
      res.sendFile(`css/autoforms.css`);
    else
      res.sendFile(__dirname + `/../node_modules/autoforms/css/autoforms.css`);
  });
  
  /** Create route for edit icon */
  this.app().get(`/images/edit.png`, (req, res) => {
    if ( fs.access(`images/edit.png`) )
      res.sendFile(`images/edit.png`);
    else
      res.sendFile(__dirname + `/../node_modules/autoforms/images/edit.png`);
  });
  
  /** Create route for archive icon */
  this.app().get(`/images/archive.png`, (req, res) => {
    if ( fs.access(`images/archive.png`) )
      res.sendFile(`images/archive.png`);
    else
      res.sendFile(__dirname + `/../node_modules/autoforms/images/archive.png`);
  });
  
  /** Use the following middleware to log requests and attach various useful variables to request object */
  this.app().use(async (req, res, next) => {
    req.markup = ``;
    req.db = this.db();
    req.htmlescape = htmlspecialchars;
    
    /** Log the page request */
    console.log(`${req.method} ${url.parse(req.originalUrl).pathname} requested by ${req.ip} (Worker ${process.pid})`);

    /** If there is a user session associated with this request, process it and attach user to request */
    if ( req.session.username && req.session.password ) {
      console.log(`Existing session found for ${req.session.username}, authenticating...`);

      /** Create user model */
      const user = new models.User();

      /** Await user load */
      try {
        await user.load(req.session.username, req.db);

        /** Verify session password and attach user to request or issue warning */
        if ( user.password() == req.session.password ) {
          req.user = user;
          console.log(`Session for ${req.session.username} is authenticated, processing request...`);
        } else {
          console.log(`Attempted session login by ${req.session.username} failed!`);
        }
      } catch ( err ) {
        console.log(`Attempted session login by ${req.session.username} failed!`);
        
        /** Delete stored credentials from session */
        delete req.session.username;
        delete req.session.password;
      }
    }

    /** Call request to next express middleware/route */
    next();
  });
  
  this.app().all(`/login`, views.login);
  
  this.app().all(`/logout`, (req, res) => {
    /** Delete stored credentials from session */
    delete req.session.username;
    delete req.session.password;

    res.redirect(`/login`);
  });
};

AutoFormServer.prototype.generateAutoFormObject = function (autoform) {
  /** Configure EZ object for this auto form */
  const objConfig = {
    className: autoform.className() || `AutoFormObject`,
    tableName: autoform.tableName(),
    properties: []
  };
  
  /** Convert auto form column configurations to EZ object property configurations */
  autoform.columns().forEach((column) => {
  });
  
  /** Create EZ object for this auto form */
  ezobjects.createClass(objConfig);
  
  /** Set EZ object in auto form */
  autoform.ezobject(global[objConfig.classname]);
};

/** Create method for adding auto form configurations */
AutoFormServer.prototype.addAutoForm = function (config) {
  /** Validate auto form configuration */
  this.validateAutoFormConfig(config);
  
  /** Create auto form */
  const autoform = new models.AutoForm(config);
  
  /** Add auto form to array */
  this.autoforms().push(autoform);
  
  /** Create auto form EZ object */
  this.generateAutoFormObject(autoform);
  
  /** Create router for this auto form */
  const router = express.Router();
  
  /** Output header */
  router.use((req, res, next) => {
    req.markup += ejs.render(autoform.headerTemplate());
    
    next();
  });
  
  /** Attach add, edit, and list templates to all requests that go through this router */
  router.use((req, res, next) => {
    /** Determine whether to use some configured values or defaults */
    req.addTemplate = config.editTemplate || fs.readFileSync(__dirname + `/templates/add.ejs`).toString();
    req.editTemplate = config.editTemplate || fs.readFileSync(__dirname + `/templates/edit.ejs`).toString();
    req.listTemplate = config.listTemplate || fs.readFileSync(__dirname + `/templates/list.ejs`).toString();
    req.objClass = objClass;
    
    /** Call next express route or middleware */
    next();
  });
  
  /** Create routes to list, add, edit, and archive records */
  router.all(`/list`, views.list(autoform));
  router.all(`/add`, views.add(autoform));
  router.all(`/edit`, views.edit(autoform));
  router.all(`/archive`, views.archive(autoform));
  
  /** Output footer */
  router.use((req, res, next) => {
    req.markup += ejs.render(autoform.headerTemplate());
    
    res.send(req.markup);
  });
  
  /** Call request to next express middleware/route */
  this.app().use(config.path, router);
};

/** Create method for starting express web server */
AutoFormServer.prototype.listen = function (port, cb) {
  this.app().listen(port, cb);
};

/** Export auto form server class */
module.exports.AutoFormServer = AutoFormServer;
