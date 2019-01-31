/** Require local modules */
const models = require(`../models`);

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
      else if ( !req.user || ( autoform.deletePermission() != -1 && !req.user.permissions().includes(autoform.deletePermission()) ) )
        /** Redirect to login */
        res.redirect(`login?return=list`);
        
        /** We're done */
        return;
      }

    /** Call next express handler */
    next();
  };
};
