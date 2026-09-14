import { ATTEMPTS_BEFORE_COOLDOWN, cooldownMsAfter, formatWait } from '../attempts';

describe('cooldownMsAfter', () => {
  it('does not punish a musician for mistyping in the dark', () => {
    for (let failures = 1; failures < ATTEMPTS_BEFORE_COOLDOWN; failures += 1) {
      expect(cooldownMsAfter(failures)).toBe(0);
    }
  });

  it('doubles the wait once guessing starts', () => {
    expect(cooldownMsAfter(5)).toBe(15_000);
    expect(cooldownMsAfter(6)).toBe(30_000);
    expect(cooldownMsAfter(7)).toBe(60_000);
  });

  it('stops at five minutes, so a forgotten password is never a locked account', () => {
    expect(cooldownMsAfter(20)).toBe(300_000);
    expect(cooldownMsAfter(500)).toBe(300_000);
  });
});

describe('formatWait', () => {
  it('says the wait in words', () => {
    expect(formatWait(1_000)).toBe('1 second');
    expect(formatWait(15_000)).toBe('15 seconds');
    expect(formatWait(60_000)).toBe('1 minute');
    expect(formatWait(150_000)).toBe('3 minutes');
  });
});
