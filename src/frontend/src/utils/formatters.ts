export function formatRupees(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return `₹${(n / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function parseRupees(value: string): bigint {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return 0n;
  return BigInt(Math.round(parsed * 100));
}

export function formatDate(timestamp: bigint | number): string {
  const n = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(n).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function dateToTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime());
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function isToday(timestamp: bigint): boolean {
  const d = new Date(Number(timestamp));
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}
