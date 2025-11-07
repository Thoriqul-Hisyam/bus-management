export function formatRupiah(value: number | undefined) {
  if (!value) return "Rp 0";
  return "Rp " + value.toLocaleString("id-ID");
}

export function parseRupiah(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}
