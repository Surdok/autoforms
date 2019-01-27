/** Require external modules */
const crypto = require(`crypto`);
const ezobjects = require(`ezobjects-mysql`);

/** Configure User class */
const configUser = {
  tableName: `autoform_users`,
  className: `User`,
  otherSearchField: `username`,
  properties: [
    { name: `id`, type: `int` },
    { name: `archived`, type: `boolean` },
    { name: `email`, type: `varchar`, length: 40 },
    { name: `password`, type: `varchar`, length: 512 },
    { name: `permissions`, type: `Array`, arrayOf: { type: `int` } },
    { name: `username`, type: `varchar`, length: 20 }
  ]
};

/** Create User class */
ezobjects.createClass(configUser);

/** Add method for authenticating */
User.prototype.authenticate = function (arg) {
  if ( this.hash(arg) == this.password() )
    return true;

  return false;
};

/** Add method for generating a SHA-512 hash of a string */
User.prototype.hash = function (arg) {
  const hash = crypto.createHash(`sha512`);

  hash.update(arg);

  return hash.digest(`hex`);
};

/** Export User config and class */
module.exports.configUser = configUser;
module.exports.User = User;
