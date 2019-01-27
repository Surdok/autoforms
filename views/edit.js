/** Require external modules */
const ejs = require(`ejs`);
const ezforms = require(`ezforms`);

/** Require local modules */
const models = require(`../models`);

module.exports = (autoform) => {
  return async (req, res, next) => {
    try {
      /** If not logged, can't add records */
      if ( !req.user ) {
        /** Redirect to login */
        res.redirect(`login?return=edit`);
        
        /** We're done */
        return;
      }
      
      /** If method is POST, process added record */
      if ( req.method == `POST` ) {
        /** Create record */
        const record = new autoform.Record();
        
        /** Load record */
        const result = await record.load(req.body.id, req.db);
        
        if ( !result )
          throw new ReferenceError(`views.edit(): No record exists with that id number.`);
        
        /** Loop through each autoform property... */
        autoform.properties().forEach((property) => {
          /** If the property is the id property or is not editable, skip */
          if ( property.name() == `id` || !property.canEdit() )
            return;
          
          /** Set record property */
          record[property.name()](req.body[property.name()]);
        });
        
        /** Insert record into database */
        await record.update(req.db);
        
        /** Redirect to list */
        res.redirect(`list`);
        
        /** We're done */
        return;
      }
      
      /** Create record */
      const record = new autoform.Record();

      /** Load record */
      const result = await record.load(parseInt(req.query.id), req.db);

      if ( !result )
        throw new ReferenceError(`views.edit(): No record exists with that id number.`);

      /** Create new EZ form */
      const form = new ezforms.Form();
      
      /** Set form action to this page */
      form.action(`edit`);
      
      /** Set form method to POST */
      form.method(`POST`);
      
      /** Add form heading */
      form.heading().rank(1).text(`Edit Record`);
      
      /** Loop through each of the auto form's properties */
      autoform.properties().forEach((property) => {
        /** If the property is the id property or is not editable, skip */
        if ( property.name() == `id` || !property.canEdit() )
          return;
        
        /** If property type is 'text'... */
        if ( property.type() == `text` )
          form.text().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
        
        /** Otherwise, if the property type is 'int'... */
        else if ( property.type() == `int` )
          form.number().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
      });
      
      /** Add cancel and save buttons */
      form.button().cols(6).colsBefore(2).type(`button`).text(`Cancel`);
      form.button().cols(6).colsAfter(2).type(`submit`).text(`Save`);
      
      /** Render template with our form */
      req.markup += ejs.render(autoform.editTemplate(), { content: form.render() });
    } catch ( err ) {
      console.log(err);
    } finally {
      await req.db.close();
    }
    
    /** Call next express handler */
    next();
  };
};
