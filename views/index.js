/** Require local modules */
const add = require(`./add`);
const archive = require(`./archive`);
const edit = require(`./edit`);
const list = require(`./list`);
const login = require(`./login`);

/** Export views */
module.exports.add = add;
module.exports.archive = archive;
module.exports.edit = edit;
module.exports.list = list;
module.exports.login = login;
