import * as XLSX from "xlsx";

// Generator to yield rows one by one for large datasets
async function* ExCelGenerator() {
  const response = await fetch("/data.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (rows.length === 0) return;

  const headers = rows[0];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty rows
    if (!row || row.length === 0) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    yield obj;
  }
}

// Helper to collect all rows if needed (not memory efficient for huge files)
async function ExCel() {
  const result = [];
  for await (const row of ExCelGenerator()) {
    result.push(row);
  }
  return result;
}

export default ExCel;
