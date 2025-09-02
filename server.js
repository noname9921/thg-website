const express = require('express');
const path = require('path');
const app = express();
const dotenv = require('dotenv')

dotenv.config()
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;

let guildMembersCache = []; 

client.once("ready", async () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return console.error("Guild not found");

  const members = await guild.members.fetch();
  guildMembersCache = members
  .filter(m => !m.user.bot)
  .map(m => ({
    id: m.id,
    username: m.user.username,
    discriminator: m.user.discriminator,
    displayName: `${m.user.username}#${m.user.discriminator}`,
    nickname: m.nickname || null
  }));

  console.log("Cached members:", guildMembersCache.length);
  guildMembersCache.forEach(m => {
    console.log(`id: ${m.id}`)
    console.log(`Username: ${m.username}`)
    console.log(`Display Name: ${m.displayName}`)
    console.log(`Nickname: ${m.nickname}`)
  })
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
  const idx = guildMembersCache.findIndex(m => m.id === newMember.id);
  if (idx === -1) return;

  guildMembersCache[idx].username = newMember.user.username;
  guildMembersCache[idx].discriminator = newMember.user.discriminator;
  guildMembersCache[idx].displayName = `${newMember.user.username}#${newMember.user.discriminator}`;
  guildMembersCache[idx].nickname = newMember.nickname || null;

  console.log(`Updated cache for ${newMember.id}: ${guildMembersCache[idx].displayName}`);
});

client.on("guildMemberAdd", member => {
  guildMembersCache.push({
    id: member.id,
    username: member.user.username,
    discriminator: member.user.discriminator,
    displayName: `${member.user.username}#${member.user.discriminator}`,
    nickname: member.nickname || null
  });
  console.log(`Added ${member.id} to cache`);
});

client.on("guildMemberRemove", member => {
  guildMembersCache = guildMembersCache.filter(m => m.id !== member.id);
  console.log(`Removed ${member.id} from cache`);
});

app.get("/members", (req, res) => {
  const ids = guildMembersCache.map(m => m.id);
  const usernames = guildMembersCache.map(m => m.displayName);
  res.json({ ids, usernames });
});

app.post("/send", async (req, res) => {
  const { message } = req.body;
  console.log(`Got message: ${message}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return res.status(404).send("Channel not found");

    await channel.send(message || "hello from backend");
    console.log("Message sent to Discord");
    res.send("Message sent!");
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).send("Failed to send message");
  }
});

app.post("/assign-role", async (req, res) => {
  const { userId, roleId } = req.body;

  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return res.status(404).send("Guild not found");

    let member = guild.members.cache.get(userId);
    if (!member) member = await guild.members.fetch(userId);
    if (!member) return res.status(404).send("User not found");

    await member.roles.add(roleId);
    res.send(`Role ${roleId} assigned to ${userId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to assign role");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

client.login(TOKEN);
