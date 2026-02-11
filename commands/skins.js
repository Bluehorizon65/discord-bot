const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const axios = require('axios');

let skinCache = [];

/* ---------------- TIER MAPPING ---------------- */

const tierPrices = {
  "Select Edition": 875,
  "Deluxe Edition": 1275,
  "Premium Edition": 1775,
  "Ultra Edition": 2475,
  "Exclusive Edition": 2175
};

const tierColors = {
  "Select Edition": 0x6e6e6e,
  "Deluxe Edition": 0x00bcd4,
  "Premium Edition": 0xff9800,
  "Ultra Edition": 0x9c27b0,
  "Exclusive Edition": 0xff4655
};

/* ---------------- COMMAND ---------------- */

module.exports = {
  name: 'skins',
  data: new SlashCommandBuilder()
    .setName('skins')
    .setDescription('Advanced Valorant skin system')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Skin name')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('compare')
        .setDescription('Compare with another skin')
        .setRequired(false)
    ),

  /* ---------------- AUTOCOMPLETE ---------------- */

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();

    if (skinCache.length === 0) {
      const res = await axios.get(`https://valorant-api.com/v1/weapons/skins`);
      skinCache = res.data.data;
    }

    const filtered = skinCache
      .filter(s => s.displayName.toLowerCase().includes(focused.toLowerCase()))
      .slice(0, 25)
      .map(s => ({ name: s.displayName, value: s.displayName }));

    await interaction.respond(filtered);
  },

  /* ---------------- EXECUTE ---------------- */

  async execute(interaction) {
    await interaction.deferReply();

    const name = interaction.options.getString('name');
    const compare = interaction.options.getString('compare');

    const res = await axios.get(`https://valorant-api.com/v1/weapons/skins`);
    const skins = res.data.data;

    const found = skins.find(s => s.displayName.toLowerCase() === name.toLowerCase());
    if (!found) return interaction.editReply("❌ Skin not found.");

    const tierName = found.contentTier?.displayName || "Select Edition";
    const price = tierPrices[tierName] || "Unknown";
    const color = tierColors[tierName] || 0xff4655;

    const chromas = found.chromas || [];
    const levels = found.levels || [];

    /* ---------------- COMPARE MODE ---------------- */

    if (compare) {
      const second = skins.find(s => s.displayName.toLowerCase() === compare.toLowerCase());
      if (!second) return interaction.editReply("❌ Second skin not found.");

      const embed = new EmbedBuilder()
        .setTitle("🔫 Skin Comparison")
        .setColor(0xff4655)
        .addFields(
          {
            name: found.displayName,
            value: `Tier: ${tierName}\nChromas: ${chromas.length}\nLevels: ${levels.length}`,
            inline: true
          },
          {
            name: second.displayName,
            value: `Tier: ${second.contentTier?.displayName}\nChromas: ${second.chromas.length}\nLevels: ${second.levels.length}`,
            inline: true
          }
        );

      return interaction.editReply({ embeds: [embed] });
    }

    /* ---------------- NORMAL VIEW ---------------- */

    let page = 0;

    const generateEmbed = () => {
      const chroma = chromas[page] || chromas[0];

      return new EmbedBuilder()
        .setTitle(`${found.displayName} 🏷 ${tierName}`)
        .setColor(color)
        .setImage(chroma?.displayIcon || found.displayIcon)
        .addFields(
          { name: "💰 Estimated Price", value: `${price} VP`, inline: true },
          { name: "🎨 Chromas", value: chromas.length.toString(), inline: true },
          { name: "⭐ Levels", value: levels.length.toString(), inline: true },
          { name: "📦 Bundle", value: found.bundle?.displayName || "Unknown", inline: true },
          {
            name: "▶ Video Preview",
            value: `[Search on YouTube](https://www.youtube.com/results?search_query=${encodeURIComponent(found.displayName + " valorant skin")})`
          }
        )
        .setFooter({ text: `Page ${page + 1}/${chromas.length}` });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⬅')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('➡')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('night')
        .setLabel('🎲 Night Market')
        .setStyle(ButtonStyle.Success)
    );

    const message = await interaction.editReply({
      embeds: [generateEmbed()],
      components: [row]
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {

      if (i.user.id !== interaction.user.id)
        return i.reply({ content: "Not your interaction.", ephemeral: true });

      if (i.customId === 'next') {
        page = (page + 1) % chromas.length;
      }

      if (i.customId === 'prev') {
        page = (page - 1 + chromas.length) % chromas.length;
      }

      if (i.customId === 'night') {
        const discount = Math.floor(Math.random() * 40) + 10;
        const discounted = Math.floor(price * (1 - discount / 100));

        const nightEmbed = new EmbedBuilder()
          .setTitle("🎲 Night Market Deal")
          .setColor(0x00ff99)
          .setDescription(`**${found.displayName}**\nOriginal: ${price} VP\nDiscount: ${discount}%\nNow: ${discounted} VP`);

        return i.update({ embeds: [nightEmbed], components: [] });
      }

      await i.update({ embeds: [generateEmbed()], components: [row] });
    });

    collector.on('end', async () => {
      await message.edit({ components: [] });
    });
  }
};
