/**
 * Model: Person
 *
 * Represents an authenticated user participating in judgmental.io.
 * The special "@herald" placeholder is used when Claims are imported from
 * external sources pending the real author claiming ownership.
 */

export const HERALD_LOGIN = 'herald'; // overridden by CONFIG.heraldLogin at runtime

export class Person {
  /**
   * @param {number} id        User id
   * @param {string} login     User login (no @)
   * @param {string} profilePicUrl Profile pic URL
   */
  constructor(id, login, profilePicUrl = '') {
    this.id        = id;
    this.login     = login;
    this.profilePicUrl = profilePicUrl;
  }

  /** True when this person is the configured @herald placeholder account. */
  isHerald(heraldLogin) {
    return this.login.toLowerCase() === heraldLogin.toLowerCase();
  }

  /**
   * Factory: create a Person from a GitHub REST /user or /users/:login response.
   * @param {object} ghUser
   * @returns {Person}
   */
  static fromGitHubUser(ghUser) {
    return new Person(
      ghUser.id,
      ghUser.login,
      ghUser.avatar_url ?? ''  // stored as profilePicUrl
    );
  }
}
