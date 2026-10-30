// SpreadsheetML uses explicitly typed text cells so learner writing is never a formula.
// No ss:Formula attribute is generated. Numbers keep their numeric type.
const xml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
export function notebookSpreadsheet(rows){
 const cell=v=>`<Cell><Data ss:Type="${typeof v==='number'&&Number.isFinite(v)?'Number':'String'}">${xml(v??'')}</Data></Cell>`;
 return '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>'+
 '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Inquiry"><Table>'+rows.map(row=>'<Row>'+row.map(cell).join('')+'</Row>').join('')+'</Table></Worksheet></Workbook>';
}
