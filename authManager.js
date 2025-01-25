// authManager.js
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");
const { db } = require("./firebaseConfig");

const API_ID = 21293768;
const API_HASH = "06c705422ba86a5929fbcf2f80f5fc11";

let clients = {};
let phoneHashes = {};

async function initTelegramClient(phoneNumber) {
  if (!clients[phoneNumber]) {
    const stringSession = new StringSession(""); // Sessão vazia inicialmente
    const client = new TelegramClient(stringSession, API_ID, API_HASH, {
      connectionRetries: 5,
    });
    await client.connect();
    clients[phoneNumber] = client;
  }
  return clients[phoneNumber];
}

async function sendCode(client, phoneNumber) {
  const result = await client.invoke(
    new Api.auth.SendCode({
      phoneNumber,
      apiId: API_ID,
      apiHash: API_HASH,
      settings: new Api.CodeSettings({
        allowFlashcall: false,
        currentNumber: true,
        allowAppHash: true,
      }),
    })
  );

  phoneHashes[phoneNumber] = result.phoneCodeHash;
  return result;
}

async function signIn(client, phoneNumber, code) {
  const phoneCodeHash = phoneHashes[phoneNumber];
  if (!phoneCodeHash) {
    throw new Error("phoneCodeHash não encontrado. Envie o código novamente.");
  }

  const result = await client.invoke(
    new Api.auth.SignIn({
      phoneNumber,
      phoneCodeHash,
      phoneCode: code,
    })
  );

  // Salvar a sessão no Firestore
  const session = client.session.save();
  await db.collection("sessions").doc(phoneNumber).set({ session });

  delete phoneHashes[phoneNumber];
  return result;
}

module.exports = { initTelegramClient, sendCode, signIn };