/** Require external modules */
const ezforms = require(`ezforms`);
const moment = require(`moment`);

module.exports = (autoform) => {
  return async (req, res, next) => {
    try {
      /** If can't edit records, redirect to list */
      if ( !autoform.canEdit() ) {
        /** Redirect to list */
        res.redirect(`list`);
        
        /** We're done */
        return;
      }
      
      /** If not logged in, can't edit records */
      else if ( !req.user || ( autoform.editPermission() != -1 && !req.user.permissions().includes(autoform.editPermission()) ) ) {
        /** Redirect to login */
        res.redirect(`login?return=edit&id=${req.query.id}`);
        
        /** We're done */
        return;
      }
      
      /** If method is POST, process added record */
      if ( req.method == `POST` ) {
        /** Create record */
        const record = new autoform.Record();
        
        /** Load record */
        const result = await record.load(parseInt(req.body.id), req.db);
        
        if ( !result )
          throw new ReferenceError(`views.edit(): No record exists with that id number.`);
        
        /** Loop through each autoform property... */
        autoform.properties().forEach((property) => {
          /** If the property is the id property or is not editable, skip */
          if ( property.name() == `id` || !property.canEdit() )
            return;
          
          /** Set record property */
          if ( ( property.type() == `date` || property.type() == `datetime` ) && req.body[property.name()] == `` )
            record[property.name()](new Date(0));
          else if ( property.type() == `date` || property.type() == `datetime` )
            record[property.name()](new Date(req.body[property.name()]));
          else if ( property.type() == `boolean` )
            record[property.name()](req.body[property.name()] ? true : false);
          else if ( ( property.type() == `int` || property.type() == `double` ) && ( isNaN(req.body[property.name()]) || req.body[property.name()] == `` ) )
            record[property.name()](0);
          else if ( property.type() == `array` && !req.body[property.name()] )
            record[property.name()]([]);
          else if ( property.type() == `array` )
            record[property.name()](typeof req.body[property.name()] == `object` && req.body[property.name()].constructor.name == `Array` ? req.body[property.name()] : [req.body[property.name()]]);
          else
            record[property.name()](req.body[property.name()]);
        });
        
        /** Insert record into database */
        await record.update(req.db);
        
        /** Redirect to list */
        res.redirect(`list?offset=${req.body.offset}`);
        
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
      
      /** Add hidden input for id */
      form.hidden().name(`id`).value(req.escape(req.query.id));
      
      /** Add hidden input for offset */
      form.hidden().name(`offset`).value(req.escape(req.query.offset));
      
      /** Add form heading */
      form.heading().rank(1).text(`Edit Record`);
            
      /** Loop through each of the auto form's properties */
      autoform.properties().forEach((property) => {
        /** If the property is the id property or is not editable, skip */
        if ( property.name() == `id` || !property.canEdit() )
          return;
        
        /** If property type is 'text'... */
        if ( property.type() == `text` && property.options().length == 0 )
          form.text().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
        
        /** Otherwise, if the property type is 'text', 'int', or 'double', and there are options and input type is 'select'... */
        else if ( [`text`, `int`, `double`].includes(property.type())  && property.options().length > 0 && property.inputType() == `select` ) {
          form.select().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).required(property.required()).disabled(property.disabled());
      
          property.options().forEach((option) => {
            form.option().value(option.value).text(option.label).selected(record[property.name()]() == option.value);
          });
        }
        
        /** Otherwise, if the property type is 'text', 'int', or 'double', and there are options and input type is 'radios'... */
        else if ( [`text`, `int`, `double`].includes(property.type())  && property.options().length > 0 && property.inputType() == `radios` ) {
          form.radios().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).required(property.required()).disabled(property.disabled()).align(property.alignment());
      
          property.options().forEach((option) => {
            form.option().value(option.value).text(option.label).selected(record[property.name()]() == option.value);
          });
        }
        
        /** Otherwise, if the property type is 'int' and there are no options... */
        else if ( property.type() == `int` && property.options().length == 0 )
          form.number().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
        
        /** Otherwise, if the property type is 'double'... */
        else if ( property.type() == `double` && property.options().length == 0 )
          form.number().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'date'... */
        else if ( property.type() == `date` )
          form.date().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(moment(record[property.name()]()).format(`Y-MM-DD`)).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'datetime'... */
        else if ( property.type() == `datetime` )
          form.datetime().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(moment(record[property.name()]()).format(`Y-MM-DDTHH:mm`)).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'time'... */
        else if ( property.type() == `time` )
          form.time().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'email'... */
        else if ( property.type() == `email` )
          form.email().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'time'... */
        else if ( property.type() == `tel` )
          form.tel().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'color'... */
        else if ( property.type() == `color` )
          form.color().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).pattern(property.pattern()).value(record[property.name()]()).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'textarea'... */
        else if ( property.type() == `textarea` )
          form.textarea().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).required(property.required()).disabled(property.disabled()).text(record[property.name()]());
      
        /** Otherwise, if the property type is 'textarea'... */
        else if ( property.type() == `file` )
          form.file().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).required(property.required()).disabled(property.disabled());
      
        /** Otherwise, if the property type is 'array' and input type is 'checkboxes'... */
        else if ( property.type() == `array` && property.inputType() == `checkboxes` ) {
          form.checkboxes().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).required(property.required()).disabled(property.disabled()).align(property.alignment());
      
          property.options().forEach((option) => {
            form.option().value(option.value).text(option.label).selected(record[property.name()]().includes(option.value));
          });
        }
        
        /** Otherwise, if the property type is 'array' and input type is 'checkboxes'... */
        else if ( property.type() == `array` && property.inputType() == `multi-select` ) {
          form.multiselect().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).required(property.required()).disabled(property.disabled());
      
          property.options().forEach((option) => {
            form.option().value(option.value).text(option.label).selected(record[property.name()]().includes(option.value));
          });
        }
        
        /** Otherwise, if the property type is 'array' and input type is 'checkboxes'... */
        else if ( property.type() == `boolean` ) {
          form.radios().colsBefore(property.inputColumnsBefore()).cols(property.inputColumns()).colsAfter(property.inputColumnsAfter()).name(property.name()).label(property.inputLabel()).required(property.required()).disabled(property.disabled()).align(property.alignment());
          form.option().value(1).text(`Yes`).selected(record[property.name()]());
          form.option().value(0).text(`No`).selected(!record[property.name()]());
        }
      });
      
      /** Add cancel and save buttons */
      form.button().cols(6).colsBefore(2).type(`button`).attr(`onclick`, `javascript:location="list";`).text(`Cancel`);
      form.button().cols(6).colsAfter(2).type(`submit`).text(`Save`);
      
      /** Append form to EZ HTML page */
      req.page.container([`div`, `body`]).append(form);
    } catch ( err ) {
      req.log(err);
    } finally {
      await req.db.close();
    }
    
    /** Call next express handler */
    next();
  };
};
