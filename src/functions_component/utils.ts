function convertExcelDateToISO(input: string): string {
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

  // Case 3: DD/MM/YYYY or MM/DD/YYYY
  const parts = trimmed.split(/[\/\-]/);
  if (parts.length === 3) {
    let [day, month, year] = parts.map((p) => parseInt(p, 10));

    // Handle MM/DD/YYYY (US style)
    if (month > 12 && day <= 12) {
      [day, month] = [month, day];
    }

    if (year < 100) year += 2000; // handle 2-digit years

    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  return "Invalid date";
}



