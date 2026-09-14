import {
  normalizeEmail,
  isPlausibleEmail,
  utf8ByteLength,
  validateSignIn,
  PASSWORD_MAX_BYTES,
} from '../credentials';

describe('normalizeEmail', () => {
  it('undoes what a phone keyboard does to an address', () => {
    // Autocapitalisation and a trailing space pasted from a chat message are
    // the two ways a correct address becomes a failed sign-in.
    expect(normalizeEmail('  Ferraro.Eli.99@Gmail.com ')).toBe('ferraro.eli.99@gmail.com');
  });
});

describe('isPlausibleEmail', () => {
  it('accepts the addresses musicians actually have', () => {
    expect(isPlausibleEmail('ferraro.eli.99@gmail.com')).toBe(true);
    expect(isPlausibleEmail('marco+jamly@band.co.uk')).toBe(true);
  });

  it('rejects what is obviously not an address', () => {
    expect(isPlausibleEmail('marco')).toBe(false);
    expect(isPlausibleEmail('marco@band')).toBe(false);
    expect(isPlausibleEmail('marco @band.it')).toBe(false);
  });
});

describe('utf8ByteLength', () => {
  it('counts bytes, not characters — bcrypt truncates at 72 bytes', () => {
    expect(utf8ByteLength('abc')).toBe(3);
    expect(utf8ByteLength('è')).toBe(2);
    expect(utf8ByteLength('あ')).toBe(3);
    expect(utf8ByteLength('🥁')).toBe(4);
    // 24 drums is 96 bytes: a passphrase that looks well short of the limit.
    expect(utf8ByteLength('🥁'.repeat(24))).toBeGreaterThan(PASSWORD_MAX_BYTES);
  });
});

describe('validateSignIn', () => {
  it('passes a complete pair straight through', () => {
    expect(validateSignIn('marco@band.it', 'a-real-password')).toBeNull();
  });

  it('names the empty field rather than the form', () => {
    expect(validateSignIn('', 'x')?.field).toBe('email');
    expect(validateSignIn('marco@band.it', '')?.field).toBe('password');
  });

  it('never rejects a short password', () => {
    // A strength rule on a sign-in field locks out whoever chose their
    // password before the rule existed. Strength belongs where it is chosen.
    expect(validateSignIn('marco@band.it', 'abc')).toBeNull();
  });
});
