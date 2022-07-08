export default function notEmpty<TValue>(value: TValue | null): value is TValue {
  return value !== null;
}
