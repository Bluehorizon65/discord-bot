const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'stats',
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Detailed Valorant player stats')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Riot username')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Riot tag')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const username = interaction.options.getString('username');
    const tag = interaction.options.getString('tag');

    try {

      // 🔹 Account Info
      const accountRes = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/account/${username}/${tag}`,
        {
          headers: {
            Authorization: process.env.HENRIK_API_KEY
          }
        }
      );

      // 🔹 MMR Info
      const mmrRes = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/mmr/ap/${username}/${tag}`,
        {
          headers: {
            Authorization: process.env.HENRIK_API_KEY
          }
        }
      );

      // 🔹 Recent Matches
      const matchRes = await axios.get(
        `https://api.henrikdev.xyz/valorant/v3/matches/ap/${username}/${tag}`,
        {
          headers: {
            Authorization: process.env.HENRIK_API_KEY
          }
        }
      );

      const account = accountRes.data.data;
      const mmr = mmrRes.data.data;
      const matches = matchRes.data.data.slice(0, 5);

      let totalKills = 0;
      let totalDeaths = 0;
      let totalAssists = 0;

      matches.forEach(match => {
        const player = match.players.all_players.find(
          p => p.name.toLowerCase() === username.toLowerCase()
        );

        if (player) {
          totalKills += player.stats.kills;
          totalDeaths += player.stats.deaths;
          totalAssists += player.stats.assists;
        }
      });

      const kd = totalDeaths === 0 ? totalKills : (totalKills / totalDeaths).toFixed(2);

      const embed = new EmbedBuilder()
        .setTitle(`${username}#${tag} Stats`)
        .setThumbnail(account.card?.small || null)
        .setColor('#ff4655')
        .addFields(
          { name: 'Region', value: account.region, inline: true },
          { name: 'Account Level', value: account.account_level.toString(), inline: true },
          { name: 'Rank', value: mmr.currenttierpatched || "Unranked", inline: true },
          { name: 'RR', value: mmr.ranking_in_tier?.toString() || "0", inline: true },
          { name: 'Recent Kills', value: totalKills.toString(), inline: true },
          { name: 'Recent Deaths', value: totalDeaths.toString(), inline: true },
          { name: 'Recent Assists', value: totalAssists.toString(), inline: true },
          { name: 'K/D (Last 5)', value: kd.toString(), inline: true }
        )
        .setFooter({ text: "Last 5 Matches Summary" });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error.response?.data || error.message);
      await interaction.editReply("❌ Player not found or API error.");
    }
  }
};
