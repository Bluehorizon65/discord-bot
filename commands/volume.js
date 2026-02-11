const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/player');

module.exports = {
  name: 'volume',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set music volume (0-100)')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Volume percentage')
        .setRequired(true)
    ),

  async execute(interaction) {

    const level = interaction.options.getInteger('level');

    if (level < 0 || level > 100)
      return interaction.reply("❌ Volume must be between 0-100.");

    const success = music.setVolume(interaction.guild, level / 100);

    if (!success)
      return interaction.reply("❌ Nothing is playing.");

    interaction.reply(`🔊 Volume set to ${level}%`);
  }
};
