const {PrismaClient} = require("@prisma/client")

const prisma = new PrismaClient()

async function extractGroupMembers(sessionId, groupId, db) {
    const sessionData = await db.collection("sessions").doc(sessionId).get();
    const client = new TelegramClient(new StringSession(sessionData.data().session), API_ID, API_HASH);
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
  
  async function addMembersToGroup(sessionId, groupId, targetGroupId, db) {
    const sessionData = await db.collection("sessions").doc(sessionId).get();
    const client = new TelegramClient(new StringSession(sessionData.data().session), API_ID, API_HASH);
    await client.connect();
  
    const group = await client.getEntity(groupId);
    const targetGroup = await client.getEntity(targetGroupId);
    const participants = await client.getParticipants(group);
  
    for (const participant of participants) {
      try {
        await client.addChatUser(targetGroup, participant.id);
        //SALVAR NO BD
        await prisma.groups.create({
          data: {
            name: participant.id,
            from: group,
            to: targetGroup,
          },
        });
        console.log(`Adicionado: ${participant.username || participant.firstName}`);
      } catch (err) {
        console.error(`Erro ao adicionar: ${err.message}`);
      }
    }
  }
  
  module.exports = { extractGroupMembers, addMembersToGroup };
  
