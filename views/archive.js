/** Require external modules */
const ejs = require(`ejs`);
const eztables = require(`eztables`);

/** Require local modules */
const models = require(`../models`);

module.exports = (config) => {
  return async (req, res, next) => {
    req.markup += `ARCHIVE`;

    /** Call next express handler */
    next();
  };
};
