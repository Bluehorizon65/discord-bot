const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/player');

module.exports = {
  name: 'stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear queue'),

  async execute(interaction) {

    if (!interaction.member.voice.channel)
      return interaction.reply("❌ Join a voice channel first.");

    const stopped = music.stop(interaction.guild);

    if (!stopped)
      return interaction.reply("❌ Nothing is playing.");

    interaction.reply("⏹ Music stopped.");
  }
};
