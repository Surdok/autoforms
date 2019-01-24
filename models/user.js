/** Require external modules */
const crypto = require(`crypto`);
const ezobjects = require(`ezobjects-mysql`);

/**
 * @class models.User
 * @added v0.1.0
 * @author Rich Lowe
 * @description Class for user accounts.
 *
 * @signature new User([data])
 * @added v0.1.0
 * @param data string|Object
 * @return User
 * @description Returns a new [User] instance and initializes using any property values in `data` that have a property
 * key matching a class method, otherwise it initializes to defaults.
 *
 * @signature init([data])
 * @added v0.6.0
 * @param data string|Object
 * @description Initializes the object with any provided `data`.
 *
 * @signature active()
 * @added v0.1.0
 * @returns boolean
 * @description Gets boolean indicating whether the user is active.
 *
 * @signature active(active)
 * @added v0.1.0
 * @param active boolean
 * @throws TypeError if `active` is not a valid [boolean]
 * @returns this
 * @description Sets a boolean indicating whether the user is active.
 *
 * @signature email()
 * @added v0.1.0
 * @returns string
 * @description Gets the user`s email address.
 *
 * @signature email(address)
 * @added v0.1.0
 * @param address string
 * @throws TypeError if `address` is not a valid [string]
 * @returns this
 * @description Sets the user`s email address.
 *
 * @signature firstName()
 * @added v0.1.0
 * @returns string
 * @description Gets the user`s first name.
 *
 * @signature firstName(name)
 * @added v0.1.0
 * @param name string
 * @throws TypeError if `name` is not a valid [string]
 * @returns this
 * @description Sets the user`s first name.
 *
 * @signature lastName()
 * @added v0.1.0
 * @returns string
 * @description Gets the user`s last name.
 *
 * @signature lastName(name)
 * @added v0.1.0
 * @param name string
 * @throws TypeError if `name` is not a valid [string]
 * @returns this
 * @description Sets the user`s last name.
 *
 * @signature password()
 * @added v0.1.0
 * @returns string
 * @description Gets the user`s password hash.
 *
 * @signature password(hash)
 * @added v0.1.0
 * @param hash string
 * @throws TypeError if `hash` is not a valid [string]
 * @returns this
 * @description Sets the user`s password hash.
 *
 * @signature permissions()
 * @added v0.1.0
 * @returns Array
 * @description Returns an array of permissions authorized for this user.
 *
 * @signature permissions(permissionsArray)
 * @added v0.1.0
 * @param permissionsArray Array
 * @throws TypeError if `permissionsArray` is not a valid [Array]
 * @returns this
 * @description Sets an array of permissions authorized for this user.
 *
 * @signature role()
 * @added v0.1.0
 * @returns number
 * @description Gets the user`s role.
 *
 * @signature role(role)
 * @added v0.1.0
 * @param role number
 * @throws TypeError if `role` is not a valid [number]
 * @returns this
 * @description Sets the user`s role.
 *
 * @signature username()
 * @added v0.1.0
 * @returns string
 * @description Gets a the user`s username.
 *
 * @signature username(username)
 * @added v0.1.0
 * @param username string
 * @throws TypeError if `username` is not a valid [string]
 * @returns this
 * @description Sets the user`s username.
 */
const configUser = {
  tableName: `users`,
  className: `User`,
  otherSearchField: `username`,
  properties: [
    { name: `id`, type: `int` },
    { name: `active`, type: `boolean` },
    { name: `email`, type: `varchar`, length: 40 },
    { name: `firstName`, type: `varchar`, length: 20 },
    { name: `lastName`, type: `varchar`, length: 20 },
    { name: `password`, type: `varchar`, length: 512 },
    { name: `permissions`, type: `Array`, arrayOf: { type: `int` } },
    { name: `role`, type: `int` },
    { name: `username`, type: `varchar`, length: 20 }
  ]
};

ezobjects.createClass(configUser);

/**
 * @signature authenticate(password)
 * @added v0.1.0
 * @param password string
 * @returns boolean
 * @description Attempt to authenticate user with provided `password`, returning true on success or false on failure.
 */
User.prototype.authenticate = function (arg) {
  if ( this.hash(arg) == this.password() )
    return true;

  return false;
};

/**
 * @signature fullName()
 * @added v0.6.0
 * @returns string
 * @description Gets the user`s full name.
 */
User.prototype.fullName = function () {
  /** Getter */
  return `${this.firstName()} ${this.lastName()}`;
};

/**
 * @signature hash(password)
 * @added v0.1.0
 * @param password string
 * @returns string
 * @description Encrypts `password` using the SHA-512 hash algorithm and returns the resulting hash.
 */
User.prototype.hash = function (arg) {
  const hash = crypto.createHash(`sha512`);

  hash.update(arg);

  return hash.digest(`hex`);
};

module.exports.User = User;
