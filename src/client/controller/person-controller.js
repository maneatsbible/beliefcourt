/**
 * Controller: Person (Worldview Profile)
 * Loads a person profile and associated records.
 */

import { apiGet } from '../api/client.js';
import { Person } from '../model/person.js';
import { Record } from '../model/record.js';

export class PersonController {
  /** @param {{ id: string, handle: string }|null} currentUser */
  constructor(currentUser) {
    this._user = currentUser;
  }

  /**
   * Load a person profile.
   * @param {string} personId
   * @returns {Promise<Person>}
   */
  async loadProfile(personId) {
    const data = await apiGet(`/api/persons/${encodeURIComponent(personId)}`);
    return Person.fromApi(data);
  }

  /**
   * Load all records authored by a person.
   * @param {string} personId
   * @returns {Promise<Record[]>}
   */
  async loadRecords(personId) {
    const data = await apiGet(`/api/persons/${encodeURIComponent(personId)}/records`);
    return (data.records ?? data ?? []).map(r => Record.fromApi(r));
  }

  /** True if the current user is viewing their own profile. */
  isOwnProfile(personId) {
    return this._user?.id === personId;
  }
}
