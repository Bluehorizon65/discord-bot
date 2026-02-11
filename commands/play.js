const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/player');

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music from SoundCloud')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name')
        .setRequired(true)
    ),

  async execute(interaction) {

    if (!interaction.member.voice.channel)
      return interaction.reply("❌ Join a voice channel first.");

    // ✅ Reply immediately (no defer delay issue)
    await interaction.reply("🔎 Searching SoundCloud...");

    const query = interaction.options.getString('query');

    try {
      await music.addToQueue(interaction, query);
    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Failed to play track.");
    }
  }
};
