// excelExporter.js
const ExcelJS = require("exceljs");

async function exportMembersToExcel(members, fileName) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Membros");

  sheet.columns = [
    { header: "Nome", key: "name", width: 30 },
    { header: "ID", key: "id", width: 15 },
    { header: "Username", key: "username", width: 25 },
    { header: "Tipo", key: "type", width: 10 },
  ];

  members.forEach((member) =>
    sheet.addRow({
      name: member.firstName || "",
      id: member.id,
      username: member.username || "",
      type: member.isBot ? "Bot" : "Usuário",
    })
  );

  await workbook.xlsx.writeFile(fileName);
  console.log(`Arquivo salvo como ${fileName}`);
}

module.exports = { exportMembersToExcel };