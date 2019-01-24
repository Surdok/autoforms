/** Require external modules */
const ejs = require(`ejs`);
const ezforms = require(`ezforms`);

/** Require local modules */
const models = require(`../models`);

module.exports = (config) => {
  return async (req, res, next) => {
    try {
      if ( !req.user )
        throw new Error(`You are not authorized to edit records!`);

      /** Create instance of object class */
      const obj = new req.objClass();

      if ( req.method == `POST` ) {
        /** Attempt to load object by id */
        if ( !(await obj.load(parseInt(req.body.id), req.db)) )
          throw new Error(`Unable to load record from database!`);
        
        config.properties.forEach((property) => {
          if ( property.name == `id` || property.name == `archived` )
            return;
          
          obj[property.name](req.body[property.name]);
        });
        
        await obj.update(req.db);
        
        res.redirect(`list`);
      }
      
      /** Attempt to load object by id */
      if ( !(await obj.load(parseInt(req.query.id), req.db)) )
        throw new Error(`Unable to load record from database!`);
      
      /** Create new EZ form */
      const form = new ezforms.Form();
      
      /** Set form action and method */
      form.action(`edit`);
      form.method(`POST`);
      form.hidden().name(`id`).value(req.htmlescape(req.query.id));
      
      /** Set form heading */
      form.heading().rank(1).text(`Edit Record`);
      
      config.properties.forEach((property) => {
        if ( property.name == `id` || property.name == `archived` )
          return;
        
        if ( property.type == `varchar` )
          form.text().name(property.name).label(property.formLabel).pattern(property.pattern || ``).value(obj[property.name]());
      });
      
      form.button().cols(6).colsBefore(2).type(`button`).text(`Cancel`);
      form.button().cols(6).colsAfter(2).type(`submit`).text(`Save`);
      
      /** Render EJS template with our rendered form */
      req.markup += ejs.render(req.editTemplate, { content: form.render(6) });
    } catch ( err ) {
      req.log(err);
    } finally {
      await req.db.close();
    }
    
    /** Call next express handler */
    next();
  };
};
