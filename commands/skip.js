const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/player');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip current song'),

  async execute(interaction) {

    if (!interaction.member.voice.channel)
      return interaction.reply("❌ Join a voice channel first.");

    const skipped = music.skip(interaction.guild);

    if (!skipped)
      return interaction.reply("❌ Nothing is playing.");

    interaction.reply("⏭ Song skipped.");
  }
};
