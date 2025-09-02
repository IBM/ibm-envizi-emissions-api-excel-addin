// Copyright IBM Corp. 2025
export function convertExcelDateToISO(input: string): string {
  const trimmed = input.trim();

  // Case 1: Already in ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 2: Excel serial date (e.g., 44562)
  const asNumber = parseFloat(trimmed);
  if (!isNaN(asNumber) && asNumber > 20000) {
    const date = new Date(Math.round((asNumber - 25569) * 86400 * 1000));
    return date.toISOString().split("T")[0];
  }

  
}
