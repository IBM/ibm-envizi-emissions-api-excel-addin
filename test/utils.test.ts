// Copyright IBM Corp. 2025
import { convertExcelDateToISO } from "../src/functions/utils";

describe("convertExcelDateToISO", () => {
  it("returns ISO string if input is already in YYYY-MM-DD format", () => {
    expect(convertExcelDateToISO("2024-12-31")).toBe("2024-12-31");
  });

  it("converts Excel serial number to ISO date", () => {
    // Excel date 44562 → 2022-01-01
    expect(convertExcelDateToISO("44562")).toBe("2022-01-01");
  });
});
