/**
 * Client model: Person
 * Built from API response rows.
 */

export class Person {
  constructor({
    id, display_name, is_herald, is_ai, ai_model, is_super_admin,
    linked_identities = [], created_at,
  }) {
    this.id            = id;
    this.displayName   = display_name ?? '';
    this.isHerald      = Boolean(is_herald);
    this.isAi          = Boolean(is_ai);
    this.aiModel       = ai_model ?? null;
    this.isSuperAdmin  = Boolean(is_super_admin);
    this.identities    = linked_identities;
    this.createdAt     = created_at;
  }

  /** Primary handle — first linked identity's handle, or display name. */
  get handle() {
    return this.identities[0]?.handle ?? this.displayName ?? '?';
  }

  /** Primary platform — first linked identity's platform. */
  get platform() {
    return this.identities[0]?.platform ?? null;
  }

  /** Primary profile pic URL. */
  get profilePicUrl() {
    return this.identities[0]?.profile_pic_url ?? '';
  }

  get isHeraldAccount() {
    return this.handle.toLowerCase() === 'herald';
  }

  static fromApi(data) {
    if (!data) return null;
    return new Person(data);
  }
}
