const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json"); // Substitua pelo caminho do seu arquivo de chave de serviço

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sistema-de-chamados-affc0.firebaseio.com" // Substitua pela URL do seu banco de dados Firebase
});

module.exports = admin;