const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'rank',
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check Valorant rank')
    .addStringOption(option =>
      option.setName('username').setDescription('Riot username').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('tag').setDescription('Riot tag').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const username = interaction.options.getString('username');
    const tag = interaction.options.getString('tag');

    try {
      const response = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/mmr/ap/${username}/${tag}`,
        {
          headers: {
            Authorization: process.env.HENRIK_API_KEY
          }
        }
      );

      const data = response.data.data;

      const embed = new EmbedBuilder()
        .setTitle(`${username}#${tag} Rank`)
        .setColor('#ff4655')
        .addFields(
          {
            name: 'Current Rank',
            value: data.currenttierpatched || "Unranked",
            inline: true
          },
          {
            name: 'RR',
            value: data.ranking_in_tier?.toString() || "0",
            inline: true
          },
          {
            name: 'Elo',
            value: data.elo?.toString() || "0",
            inline: true
          }
        );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("Henrik API Error:", error.response?.data || error.message);
      await interaction.editReply("❌ Player not found or API error.");
    }
  }
};
