const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/player');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song'),

  async execute(interaction) {

    if (!interaction.member.voice.channel)
      return interaction.reply("❌ Join a voice channel first.");

    const paused = music.pause(interaction.guild);

    if (!paused)
      return interaction.reply("❌ Nothing is playing.");

    interaction.reply("⏸ Music paused.");
  }
};
