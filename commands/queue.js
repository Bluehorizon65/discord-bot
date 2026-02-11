const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/player');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show current music queue'),

  async execute(interaction) {

    const q = music.getQueue(interaction.guild);

    if (!q)
      return interaction.reply("🎵 Queue is empty.");

    interaction.reply(`📜 Current Queue:\n${q}`);
  }
};
