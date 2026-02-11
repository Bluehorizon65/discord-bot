require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

/* ================= LOAD COMMANDS ================= */

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.name) {
    client.commands.set(command.name, command);
  }
}

/* ================= READY ================= */

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ================= INTERACTIONS ================= */

client.on('interactionCreate', async interaction => {

  const music = require('./music/player');

  /* ---------- BUTTON HANDLER ---------- */

  if (interaction.isButton()) {

    switch (interaction.customId) {

      case 'pause':
        music.pause(interaction.guild);
        return interaction.reply({ content: "⏸ Paused", ephemeral: true });

      case 'resume':
        music.resume(interaction.guild);
        return interaction.reply({ content: "▶ Resumed", ephemeral: true });

      case 'skip':
        music.skip(interaction.guild);
        return interaction.reply({ content: "⏭ Skipped", ephemeral: true });

      case 'stop':
        music.stop(interaction.guild);
        return interaction.reply({ content: "⏹ Stopped", ephemeral: true });

      case 'loop':
        const state = music.toggleLoop(interaction.guild);
        return interaction.reply({
          content: state ? "🔁 Loop Enabled" : "🔁 Loop Disabled",
          ephemeral: true
        });
    }
  }

  /* ---------- AUTOCOMPLETE ---------- */

  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command?.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error('Autocomplete Error:', error);
      }
    }
    return;
  }

  /* ---------- SLASH COMMANDS ---------- */

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error('Command Error:', error);

    if (interaction.deferred) {
      await interaction.editReply('❌ Error executing command.');
    } else if (interaction.replied) {
      await interaction.followUp({
        content: '❌ Error executing command.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '❌ Error executing command.',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
