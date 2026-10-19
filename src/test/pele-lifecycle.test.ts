import { describe, expect, it } from 'vitest';
import { mountIfCurrent } from '@/lib/pele-lifecycle';

describe('Pele mount lifecycle', () => {
  it('destroys a mount that resolves after its article generation is invalidated', async () => {
    let resolveMount: ((mount: { destroy: () => void }) => void) | undefined;
    let generation = 1;
    let destroyed = false;
    const result = mountIfCurrent(
      () =>
        new Promise<{ destroy: () => void }>((resolve) => {
          resolveMount = resolve;
        }),
      () => generation === 1,
    );

    generation += 1;
    resolveMount?.({ destroy: () => (destroyed = true) });

    await expect(result).resolves.toBeNull();
    expect(destroyed).toBe(true);
  });

  it('returns a mount while its owning article generation remains current', async () => {
    const mounted = { destroy: () => undefined };

    await expect(mountIfCurrent(async () => mounted, () => true)).resolves.toBe(mounted);
  });
});
