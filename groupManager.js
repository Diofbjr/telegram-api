// groupManager.js
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { db } = require("./firebaseConfig");

const API_ID = 21293768;
const API_HASH = "06c705422ba86a5929fbcf2f80f5fc11";

async function extractGroupMembers(sessionId, groupId) {
  const sessionDoc = await db.collection("sessions").doc(sessionId).get();
  if (!sessionDoc.exists) {
    throw new Error("Sessão não encontrada.");
  }

  const client = new TelegramClient(new StringSession(sessionDoc.data().session), API_ID, API_HASH);
  await client.connect();

  const group = await client.getEntity(groupId);
  const participants = await client.getParticipants(group);

  return participants.map((participant) => ({
    id: participant.id,
    username: participant.username || null,
    firstName: participant.firstName || null,
    isBot: participant.bot,
  }));
}

async function addMembersToGroup(sessionId, groupId, targetGroupId) {
  const sessionDoc = await db.collection("sessions").doc(sessionId).get();
  if (!sessionDoc.exists) {
    throw new Error("Sessão não encontrada.");
  }

  const client = new TelegramClient(new StringSession(sessionDoc.data().session), API_ID, API_HASH);
  await client.connect();

  const group = await client.getEntity(groupId);
  const targetGroup = await client.getEntity(targetGroupId);
  const participants = await client.getParticipants(group);

  for (const participant of participants) {
    try {
      await client.addChatUser(targetGroup, participant.id);
      console.log(`Adicionado: ${participant.username || participant.firstName}`);
    } catch (err) {
      console.error(`Erro ao adicionar: ${err.message}`);
    }
  }
}

module.exports = { extractGroupMembers, addMembersToGroup };