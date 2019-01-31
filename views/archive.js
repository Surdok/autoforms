/** Require local modules */
const models = require(`../models`);

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
      else if ( !req.user || ( autoform.addPermission() != -1 && !req.user.permissions().includes(autoform.addPermission()) ) )
        /** Redirect to login */
        res.redirect(`login?return=list`);
        
        /** We're done */
        return;
      }
      
      if ( req.method == `POST` ) {
      }
    } catch ( err ) {
      console.log(err);
    } finally {
      await req.db.close();
    }

    /** Call next express handler */
    next();
  };
};
