const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  name: 'chat',
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with AI')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your message')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const userMessage = interaction.options.getString('message');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(userMessage);
    const response = result.response.text();

    await interaction.editReply(response.substring(0, 2000));
  }
};
