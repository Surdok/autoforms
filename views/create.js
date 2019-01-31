/** Require external modules */
const ezforms = require(`ezforms`);

/** Require local modules */
const models = require(`../models`);

module.exports = (autoform) => {
  return async (req, res, next) => {
    /** Create form */
    const form = new ezforms.Form();

    /** Set form action and method properties */
    form.action(`create`).method(`POST`);

    /** Create form heading (default 16 cols wide) */
    form.heading().rank(1).text(`Create Account`);

    /** Try to load user if request method is POST */
    if ( req.method == `POST` ) {
      try {
        /** Validate username. */
        if ( !req.body.username.match(`^[a-zA-Z]{1}[a-zA-Z0-9]{4,}$`) )
          throw new Error(`Your username must start with a letter, contain only letters or numbers, and be at least 5 characters!`);

        /** Validate password */
        if ( !req.body.password.match(/[0-9]{1}/) || !req.body.password.match(/[A-Z]{1}/) || !req.body.password.match(/[a-z]{1}/) )
          throw new Error(`Your password must contain a lowercase letter, an uppercase letter, and a number.`);
        
        else if ( req.body.password.length < 8 )
          throw new Error(`Your password must be at least 8 characters long.`);
        
        else if ( req.body.password != req.body.password2 )
          throw new Error(`Those passwords do not match, please try again.`);
        
        else if ( req.body.password.match(/\s/) )
          throw new Error(`Your password cannot contain spaces.`);
        
        /** Validate email */
        else if ( !req.body.email.match(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`) )
          throw new Error(`That email address is not valid.`);

        /** Create user model */
        const user = new models.User();
                        
        if ( await user.load(req.body.username, req.db) )
          throw new Error(`That username already exists.`);
        
        console.log(`Creating new account for '${req.body.username}'.`);
        
        /** Set properties */
        user.username(req.body.username);
        user.password(user.hash(req.body.password));
        user.email(req.body.email);
        user.permissions([]);
        
        /** Insert user into database */
        await user.insert(req.db);

        console.log(`Login successful for ${req.body.username} from ${req.ip}`);

        /** Store credentials in session so login is not required */
        req.session.username = user.username();
        req.session.password = user.password();

        /** Success, redirect to home */
        res.redirect(`list`);

        return;
      } catch ( err ) {
        /** Output error alert */
        form.alert().type(`error`).strong(`Error!`).text(err.message);
      }
    }

    /** Create username and password inputs */
    form.text().cols(12).colsAfter(4).type(`text`).name(`username`).label(`Username:`).required(true);
    form.text().cols(16).type(`email`).name(`email`).label(`Email:`).required(true);
    form.text().cols(14).colsAfter(2).type(`password`).name(`password`).label(`Password:`).required(true);
    form.text().cols(14).colsAfter(2).type(`password`).name(`password2`).label(`Confirm Password:`).required(true);

    /** Create buttons */
    form.button().cols(6).colsBefore(2).type(`reset`).text(`Reset`);
    form.button().cols(6).colsAfter(2).type(`submit`).text(`Create`);

    /** Append form to EZ HTML page */
    req.page.append(form);

    /** Call next express handler */
    next();
  };
};
