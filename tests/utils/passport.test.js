import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import passport from 'passport';
import * as db from '../../src/utils/db';
import '../../src/utils/passport';

describe('passport.deserializeUser', () => {
  let originalQuery;

  beforeEach(() => {
    originalQuery = db.query;
    vi.spyOn(db, 'query');
  });

  afterEach(() => {
    db.query.mockRestore();
  });

  it('should_return_false_if_user_id_not_found_on_deserialize', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const done = vi.fn();

    // Find the registered deserializer
    const deserializer = passport._deserializers[0];
    await deserializer(12345, done);

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [12345]);
    expect(done).toHaveBeenCalledWith(null, false);
  });
});