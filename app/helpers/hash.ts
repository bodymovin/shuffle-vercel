type directions = -1 | 1

export function buildHash(
  totalOptions: number,
  direction: directions,
  prefix: string,
  hash: string,
): string {
  let currentHashIndex = 0;
  if (hash) {
    const hashParts = hash.split('-');
    if (hashParts.length) {
      const lastPart = parseInt(hashParts[hashParts.length - 1], 10);
      if (!Number.isNaN(lastPart)) {
        if (direction < 0) {
          if (lastPart > 0) {
            currentHashIndex = lastPart - 1;
          } else {
            currentHashIndex = 0;
          }
        } else if (direction > 0) {
          if (lastPart < totalOptions - 1) {
            currentHashIndex = lastPart + 1;
          } else {
            currentHashIndex = totalOptions - 1;
          }
        }
      }
    }
  } else {
    currentHashIndex = direction === -1 ? 0 : 1;
  }
  return `#${prefix}${currentHashIndex}`;
}
