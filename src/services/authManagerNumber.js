const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");

const API_ID = 21293768;
const API_HASH = "06c705422ba86a5929fbcf2f80f5fc11";

// Variável para armazenar sessões na memória temporária
let clients = {};
let phoneHashes = {}; // Armazena phoneCodeHash por número de telefone


// Inicializa o cliente Telegram
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

// Envia o código de autenticação para o telefone
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
  
    // Armazena o phoneCodeHash associado ao número de telefone
    phoneHashes[phoneNumber] = result.phoneCodeHash;
  
    return result;
  }

// Realiza o login com o código recebido
async function signIn(client, phoneNumber, code) {
    const phoneCodeHash = phoneHashes[phoneNumber]; // Recupera o hash armazenado
    if (!phoneCodeHash) {
      throw new Error("phoneCodeHash não encontrado. Envie o código novamente.");
    }
  
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash, // Usa o hash armazenado
        phoneCode: code, // Código fornecido pelo usuário
      })
    );
  
    // Limpa o hash após o login bem-sucedido
    delete phoneHashes[phoneNumber];
  
    return result;
  }
  
module.exports = { initTelegramClient, sendCode, signIn };
