const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'valorant',
  data: new SlashCommandBuilder()
    .setName('valorant')
    .setDescription('Check Valorant Store')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Tag')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const username = interaction.options.getString('username');
    const tag = interaction.options.getString('tag');

    try {
      const response = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/store/${username}/${tag}`
      );

      const skins = response.data.data.offers;

      let output = "🛒 **Today's Store:**\n";
      skins.forEach(skin => {
        output += `• ${skin.name}\n`;
      });

      await interaction.editReply(output);

    } catch (error) {
      console.error(error.response?.data || error.message);
      await interaction.editReply("Error fetching store.");
    }
  }
};