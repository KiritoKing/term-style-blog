export type DestroyableMount = {
  destroy: () => void;
};

/** Resolve a mount only while its owning article generation is still active. */
export const mountIfCurrent = async <T extends DestroyableMount>(
  mount: () => Promise<T>,
  isCurrent: () => boolean,
): Promise<T | null> => {
  const result = await mount();
  if (isCurrent()) return result;

  result.destroy();
  return null;
};
