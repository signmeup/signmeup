export function jsonToCsv(json) {
  if (json.length === 0) return '';

  const header = Object.keys(json[0]);
  const cells = [header].concat(json.slice(1).map(entry => {
    return header.map(key => entry[key]);
  }));

  // Join cell data into a single string
  return cells.map((row) => {
    return row.map((cell) => {
      // Escape the cell using excel-compatible format
      const data = (cell || '').toString().replace('"', '""');
      return '"' + data + '"';
    }).join(',');
  }).join('\n');
}
