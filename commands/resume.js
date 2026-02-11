const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/player');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction) {

    if (!interaction.member.voice.channel)
      return interaction.reply("❌ Join a voice channel first.");

    const resumed = music.resume(interaction.guild);

    if (!resumed)
      return interaction.reply("❌ Nothing to resume.");

    interaction.reply("▶ Music resumed.");
  }
};
