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

/** Require local modules */
const models = require(`./models`);
const views = require(`./views`);

/** Create express app */
const app = express();

/** Use external body parser middleware to parse POST params into request body */
app.use(parser.urlencoded({ extended: true }));

/** Create session file store */
const FileStore = store(session);

/** Use external session middleware to store user session variables */
app.use(session({
  store: new FileStore({ logFn: () => {} }),
  secret: `JAs,fj$@nflkfj23f-h3kFSD<25%%$t54g5!t2fj0DF(*)S*FS`,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1209600000
  }
}));

module.exports.initAutoForms = (config = {}) => {
  /** Create route for example CSS */
  app.get(`/autoforms/autoforms.css`, (req, res) => {
    res.sendFile(__dirname + `/css/autoforms.css`);
  });
  
  /** Create route for edit icon */
  app.get(`/images/edit.png`, (req, res) => {
    res.sendFile(__dirname + `/node_modules/eztables/images/edit.png`);
  });
  
  /** Create route for archive icon */
  app.get(`/images/archive.png`, (req, res) => {
    res.sendFile(__dirname + `/node_modules/eztables/images/archive.png`);
  });
  
  /** Use the following middleware to log requests and attach various useful variables to request object */
  app.use(async (req, res, next) => {  
    req.footerTemplate = config.loginTemplate || fs.readFileSync(__dirname + `/templates/footer.ejs`).toString();
    req.headerTemplate = config.loginTemplate || fs.readFileSync(__dirname + `/templates/header.ejs`).toString();
    req.loginTemplate = config.loginTemplate || fs.readFileSync(__dirname + `/templates/login.ejs`).toString();
    req.log = config.logger || console.log;
    req.markup = ``;
    req.db = config.database;
    req.htmlescape = htmlspecialchars;
    
    /** Log the page request */
    req.log(`${req.method} ${url.parse(req.originalUrl).pathname} requested by ${req.ip} (Worker ${process.pid})`);

    /** If there is a user session associated with this request, process it and attach user to request */
    if ( req.session.username && req.session.password ) {
      req.log(`Existing session found for ${req.session.username}, authenticating...`);

      /** Create user model */
      const user = new models.User();

      /** Await user load */
      try {
        await user.load(req.session.username, req.db);

        /** Verify session password and attach user to request or issue warning */
        if ( user.password() == req.session.password ) {
          req.user = user;
          req.log(`Session for ${req.session.username} is authenticated, processing request...`);
        } else {
          req.log(`Attempted session login by ${req.session.username} failed!`);
        }
      } catch ( err ) {
        req.log(`Attempted session login by ${req.session.username} failed!`);
        
        /** Delete stored credentials from session */
        delete req.session.username;
        delete req.session.password;
      }
    }

    /** Call request to next express middleware/route */
    next();
  });

  /** Output header */
  app.use((req, res, next) => {
    req.markup += ejs.render(req.headerTemplate);
    
    next();
  });
  
  app.all(`/login`, views.login);
  
  app.all(`/logout`, (req, res) => {
    /** Delete stored credentials from session */
    delete req.session.username;
    delete req.session.password;

    res.redirect(`/login`);
  });
};

module.exports.createAutoForm = (config, objClass) => {
  const path = config.path || `/`;

  if ( path == `` )
    path = `/`;
  else if ( path[path.length - 1] == `/` )
    path = path.substring(0, path.length - 1);
  
  /** Create router */
  const router = express.Router();
  
  router.use((req, res, next) => {
    /** Determine whether to use some configured values or defaults */
    req.addTemplate = config.editTemplate || fs.readFileSync(__dirname + `/templates/add.ejs`).toString();
    req.editTemplate = config.editTemplate || fs.readFileSync(__dirname + `/templates/edit.ejs`).toString();
    req.listTemplate = config.listTemplate || fs.readFileSync(__dirname + `/templates/list.ejs`).toString();
    req.objClass = objClass;
    
    next();
  });
  
  router.all(`/list`, views.list(config));
  router.all(`/add`, views.add(config));
  router.all(`/edit`, views.edit(config));
  router.all(`/archive`, views.archive(config));
  
  /** Call request to next express middleware/route */
  app.use(path, router);
};

module.exports.listen = (port, cb) => {
  /** Output footer */
  app.use((req, res, next) => {
    req.markup += ejs.render(req.footerTemplate);
    
    res.send(req.markup);
  });
  
  app.listen(port, cb);
};
