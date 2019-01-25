/** Require external modules */
const ejs = require(`ejs`);
const ezforms = require(`ezforms`);

/** Require local modules */
const models = require(`../models`);

module.exports = (autoform) => {
  return async (req, res, next) => {
    try {
      if ( !req.user )
        throw new Error(`You are not authorized to add records!`);

      /** Create instance of object class */
      const obj = new req.objClass();

      if ( req.method == `POST` ) {
        autoform.properties().forEach((property) => {
          if ( property.name == `id` || !property.editable )
            return;
          
          obj[property.name](req.body[property.name]);
        });
        
        await obj.insert(req.db);
        
        res.redirect(`list`);
      }
      
      /** Create new EZ form */
      const form = new ezforms.Form();
      
      /** Set form action and method */
      form.action(`add`);
      form.method(`POST`);
      
      /** Set form heading */
      form.heading().rank(1).text(`Add Record`);
      
      autoform.properties().forEach((property) => {
        if ( property.name == `id` || !property.editable )
          return;
        
        if ( property.type == `varchar` ) {
          form.text().colsBefore(property.colsBefore).cols(property.cols).colsAfter(property.colsAfter).name(property.name).label(property.formLabel).pattern(property.pattern).value(obj[property.name]()).required(property.required);
        } else if ( property.type == `boolean` ) {
          form.radios().colsBefore(property.colsBefore).cols(property.cols).colsAfter(property.colsAfter).name(property.name).label(property.formLabel).required(property.required);
          form.option().value(1).text(`Yes`);
          form.option().value(0).text(`No`).selected(true);
        }
      });
      
      form.button().cols(6).colsBefore(2).type(`button`).text(`Cancel`);
      form.button().cols(6).colsAfter(2).type(`submit`).text(`Save`);
      
      /** Render EJS template with our rendered form */
      req.markup += ejs.render(req.addTemplate, { content: form.render(6) });
    } catch ( err ) {
      req.log(err);
    } finally {
      await req.db.close();
    }
    
    /** Call next express handler */
    next();
  };
};
