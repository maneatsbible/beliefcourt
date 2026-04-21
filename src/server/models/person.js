/**
 * Server model: Person
 */

import { v4 as uuid } from 'uuid';
import { getDb }      from '../../../db/db.js';

export function getPersonById(id) {
  const db = getDb();
  const person = db.get('SELECT * FROM persons WHERE id = ?', [id]);
  if (!person) return null;
  const identities = db.query('SELECT * FROM linked_identities WHERE person_id = ?', [id]);
  return { ...person, linked_identities: identities };
}

export function getPersonByPlatformId(platform, platformUserId) {
  const db = getDb();
  const identity = db.get(
    'SELECT * FROM linked_identities WHERE platform = ? AND platform_user_id = ?',
    [platform, platformUserId]
  );
  if (!identity) return null;
  return getPersonById(identity.person_id);
}

export function upsertPerson({ platform, platformUserId, handle, displayName, profilePicUrl }) {
  const db = getDb();
  let identity = db.get(
    'SELECT * FROM linked_identities WHERE platform = ? AND platform_user_id = ?',
    [platform, platformUserId]
  );

  let personId;
  if (identity) {
    personId = identity.person_id;
    // Update handle/pic if changed
    db.run(
      'UPDATE linked_identities SET handle = ?, profile_pic_url = ? WHERE id = ?',
      [handle, profilePicUrl ?? '', identity.id]
    );
  } else {
    personId = uuid();
    db.run(
      'INSERT INTO persons (id, display_name) VALUES (?, ?)',
      [personId, displayName ?? handle]
    );
    db.run(
      'INSERT INTO linked_identities (id, person_id, platform, platform_user_id, handle, profile_pic_url) VALUES (?, ?, ?, ?, ?, ?)',
      [uuid(), personId, platform, platformUserId, handle, profilePicUrl ?? '']
    );
  }

  return getPersonById(personId);
}
