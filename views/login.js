/** Require external modules */
const ezforms = require(`ezforms`);

/** Require local modules */
const models = require(`../models`);

module.exports = () => {
  return async (req, res, next) => {
    /** Create form */
    const form = new ezforms.Form();

    /** Set form action and method properties */
    form.action(`login`).method(`POST`);

    /** Create form heading (default 16 cols wide) */
    form.heading().rank(1).text(`Login...`);

    /** Try to load user if request method is POST */
    if ( req.method == `POST` ) {
      try {
        req.log(`User ${req.body.username} attempting login.`);

        /** Create user model */
        const user = new models.User();

        /** Await user load */
        const result = await user.load(req.body.username, req.db);

        /** If user does not exist... */
        if ( !result ) {
          req.log(`Login failed, user ${req.body.username} does not exist`);
          throw new Error(`Username or password invalid!`);
        } 

        /** Otherwise, if password is incorrect... */
        else if ( !user.authenticate(req.body.password) ) {
          req.log(`Login failed, user ${req.body.username} entered invalid password`);
          throw new Error(`Username or password invalid!`);
        }

        /* Otherwise, success... */
        else {
          req.log(`Login successful for ${req.body.username} from ${req.ip}`);

          /** Store credentials in session so login is not required */
          req.session.username = user.username();
          req.session.password = user.password();

          /** Success, redirect to home */
          if ( req.body.return == `edit` && !isNaN(req.body.id) )
            res.redirect(`edit&id=${req.body.id}`);
          else if ( req.body.return == `list` && !isNaN(req.body.offset) )
            res.redirect(`list&offset=${req.body.offset}`);
          else
            res.redirect(`list`);

          return;
        }
      } catch ( err ) {
        /** Output error alert */
        form.alert().type(`error`).strong(`Error!`).text(err.message);
      }
    }

    /** If return is passed, add hidden input for it */
    if ( req.query.id )
      form.hidden().name(`return`).value(req.escape(req.query.return));
    
    /** If id is passed, add hidden input for it */
    if ( req.query.id )
      form.hidden().name(`id`).value(req.escape(req.query.id));
    
    /** If offset is passed, add hidden input for it */
    if ( req.query.id )
      form.hidden().name(`offset`).value(req.escape(req.query.offset));
    
    /** Create username and password inputs */
    form.text().cols(16).type(`text`).name(`username`).label(`Username:`).required(true);
    form.text().cols(16).type(`password`).name(`password`).label(`Password:`).required(true);

    /** Create buttons */
    form.button().cols(6).colsBefore(2).type(`reset`).text(`Reset`);
    form.button().cols(6).colsAfter(2).type(`submit`).text(`Submit`);

    /** Append form to EZ HTML page */
    req.page.container([`div`, `body`]).append(form);

    /** Call next express handler */
    next();
  };
};
