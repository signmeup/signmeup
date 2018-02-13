export function jsonToCsv(json) {
  if (json.length == 0) return '';

  const header = Object.keys(json[0]);
  const cells = [header].concat(json.slice(1).map(entry => {
    return header.map(key => entry[key]);
  }));
  return cells.map(row => row.join(',')).join('\n');
}
