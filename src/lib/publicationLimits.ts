export const PUBLICATION_LIMITS = {
  marca: 30,
  modelo: 30,
  descripcion: 500,
  kilometros: 9,
  precio: 9,
} as const;

export const PUBLICATION_WARNINGS = {
  marca: 5,
  modelo: 5,
  descripcion: 50,
  numeric: 2,
} as const;

export function getCounterClass(current: number, limit: number, warning: number) {
  const remaining = limit - current;
  if (remaining < 0) return "text-red-600";
  if (remaining <= warning) return "text-amber-500";
  return "text-gray-500";
}

export function keepDigits(value: string, limit: number) {
  return value.replace(/\D/g, "").slice(0, limit);
}
