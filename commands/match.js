const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'match',
  data: new SlashCommandBuilder()
    .setName('match')
    .setDescription('Recent Valorant matches (detailed)')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Riot username')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Riot tag')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of recent matches (1-10)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const username = interaction.options.getString('username');
    const tag = interaction.options.getString('tag');
    const count = interaction.options.getInteger('count') || 5; // Default 5

    try {

      // 🔹 Detect region
      const accountRes = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/account/${username}/${tag}`,
        {
          headers: {
            Authorization: process.env.HENRIK_API_KEY
          }
        }
      );

      const region = accountRes.data.data.region;

      // 🔹 Get matches
      const matchRes = await axios.get(
  `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${username}/${tag}?size=${count}`,
  {
    headers: {
      Authorization: process.env.HENRIK_API_KEY
    }
  }
);


      const matches = matchRes.data.data.slice(0, count);

      let desc = "";

      matches.forEach((match, index) => {

        const player = match.players.all_players.find(
          p => p.name.toLowerCase() === username.toLowerCase()
        );

        if (!player) return;

        const didRedWin = match.teams.red.has_won;
        const playerTeam = player.team;

        const result =
          (playerTeam === "Red" && didRedWin) ||
          (playerTeam === "Blue" && !didRedWin)
            ? "🟦 Win"
            : "🟥 Loss";

        desc += `**Match ${index + 1}: ${match.metadata.map}** (${match.metadata.mode})\n`;
        desc += `Agent: ${player.character}\n`;
        desc += `KDA: ${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}\n`;
        desc += `${result}\n\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle(`${username}#${tag} - Last ${count} Matches`)
        .setDescription(desc || "No recent matches found.")
        .setColor('#ff4655')
        .setFooter({ text: "Powered by HenrikDev API" });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error.response?.data || error.message);
      await interaction.editReply("❌ Could not fetch matches. Check username/tag.");
    }
  }
};
