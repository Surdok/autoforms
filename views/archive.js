module.exports = (autoform) => {
  return async (req, res, next) => {
    try {
      /** If can't archive records, redirect to list */
      if ( !autoform.canArchive() ) {
        /** Redirect to list */
        res.redirect(`list`);
        
        /** We're done */
        return;
      }
      
      /** If not logged in, can't archive records */
      else if ( !req.user || ( autoform.addPermission() != -1 && !req.user.permissions().includes(autoform.addPermission()) ) ) {
        /** Redirect to login */
        res.redirect(`login?return=list&offset=${req.query.offset}`);
        
        /** We're done */
        return;
      }
      
      /** Create record */
      const record = new autoform.Record();

      /** Load record */
      const result = await record.load(parseInt(req.query.id), req.db);

      if ( !result )
        throw new ReferenceError(`views.archive(): No record exists with that id number.`);

      /** Set active boolean to false */
      record.active(false);

      /** Update record */
      await record.update(req.db);

      /** Redirect to list at previous offset */
      res.redirect(`list?offset=${req.query.offset}`);
      
      /** We're done */
      return;
    } catch ( err ) {
      req.log(err);
    } finally {
      await req.db.close();
    }

    /** Call next express handler */
    next();
  };
};
