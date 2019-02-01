module.exports = (autoform) => {
  return async (req, res, next) => {
    /** If can't delete records, redirect to list */
      if ( !autoform.canDelete() ) {
        /** Redirect to list */
        res.redirect(`list`);
        
        /** We're done */
        return;
      }
      
      /** If not logged in, can't delete records */
      else if ( !req.user || ( autoform.deletePermission() != -1 && !req.user.permissions().includes(autoform.deletePermission()) ) ) {
        /** Redirect to login */
        res.redirect(`login?return=list&offset=${req.query.offset}`);
        
        /** We're done */
        return;
      }
      
      /** Create record */
      const record = new autoform.Record();

      /** Load record */
      const result = await record.load(req.query.id, req.db);

      if ( !result )
        throw new ReferenceError(`views.delete(): No record exists with that id number.`);

      /** Delete record */
      await record.delete(req.db);

      /** Redirect to list at previous offset */
      res.redirect(`list?offset=${req.query.offset}`);

    /** Call next express handler */
    next();
  };
};
