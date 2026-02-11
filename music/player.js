const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} = require('@discordjs/voice');

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const play = require('play-dl');
// Initialize play-dl (auto fetch SoundCloud client id)
(async () => {
  await play.getFreeClientID().then((id) => {
    play.setToken({
      soundcloud: {
        client_id: id
      }
    });
  }).catch(() => {
    console.log("Failed to fetch SoundCloud client ID.");
  });
})();

const queues = new Map();

/* ================= CONNECTION ================= */

async function createConnection(interaction) {
  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
  return connection;
}

/* ================= PLAY SONG ================= */

async function playSong(guild, song) {
  const queue = queues.get(guild.id);

  if (!queue || !song) {
    if (queue) {
      queue.connection.destroy();
      queues.delete(guild.id);
    }
    return;
  }

  try {
    const stream = await play.stream(song.url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });

    resource.volume.setVolume(queue.volume);

    queue.currentResource = resource;
    queue.player.play(resource);

  } catch (err) {
    console.error("Stream Error:", err);

    queue.songs.shift();

    if (queue.songs.length > 0) {
      playSong(guild, queue.songs[0]);
    } else {
      queue.connection.destroy();
      queues.delete(guild.id);
    }
  }
}

/* ================= ADD TO QUEUE ================= */

async function addToQueue(interaction, query) {

  // 🔎 Search ONLY SoundCloud
  const results = await play.search(query, {
    limit: 1,
    source: { soundcloud: "tracks" }
  });

  if (!results || results.length === 0) {
    return interaction.editReply("❌ No SoundCloud results found.");
  }

  const song = {
    title: results[0].title,
    url: results[0].url
  };

  let queue = queues.get(interaction.guild.id);

  if (!queue) {
    const connection = await createConnection(interaction);
    const player = createAudioPlayer();

    connection.subscribe(player);

    queue = {
      connection,
      player,
      songs: [],
      volume: 0.5,
      loop: false,
      currentResource: null
    };

    queues.set(interaction.guild.id, queue);

    player.on(AudioPlayerStatus.Idle, () => {

      if (queue.loop && queue.songs.length > 0) {
        playSong(interaction.guild, queue.songs[0]);
        return;
      }

      queue.songs.shift();

      if (queue.songs.length > 0) {
        playSong(interaction.guild, queue.songs[0]);
      } else {
        queue.connection.destroy();
        queues.delete(interaction.guild.id);
      }
    });

    player.on('error', error => {
      console.error("Player Error:", error);

      queue.songs.shift();

      if (queue.songs.length > 0) {
        playSong(interaction.guild, queue.songs[0]);
      } else {
        queue.connection.destroy();
        queues.delete(interaction.guild.id);
      }
    });
  }

  queue.songs.push(song);

  if (queue.songs.length === 1) {
    playSong(interaction.guild, queue.songs[0]);
  }

  await interaction.editReply({
    content: `🎵 Now Playing (SoundCloud): **${song.title}**`,
    components: [musicButtons()]
  });
}

/* ================= BUTTON UI ================= */

function musicButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('pause').setLabel('⏸').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('resume').setLabel('▶').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('skip').setLabel('⏭').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('stop').setLabel('⏹').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('loop').setLabel('🔁').setStyle(ButtonStyle.Success)
  );
}

/* ================= CONTROLS ================= */

function pause(guild) {
  const queue = queues.get(guild.id);
  if (!queue) return false;
  queue.player.pause();
  return true;
}

function resume(guild) {
  const queue = queues.get(guild.id);
  if (!queue) return false;
  queue.player.unpause();
  return true;
}

function skip(guild) {
  const queue = queues.get(guild.id);
  if (!queue) return false;
  queue.player.stop();
  return true;
}

function stop(guild) {
  const queue = queues.get(guild.id);
  if (!queue) return false;

  queue.connection.destroy();
  queues.delete(guild.id);
  return true;
}

function toggleLoop(guild) {
  const queue = queues.get(guild.id);
  if (!queue) return false;

  queue.loop = !queue.loop;
  return queue.loop;
}

function setVolume(guild, value) {
  const queue = queues.get(guild.id);
  if (!queue) return false;

  queue.volume = value;

  if (queue.currentResource && queue.currentResource.volume) {
    queue.currentResource.volume.setVolume(value);
  }

  return true;
}

function getQueue(guild) {
  const queue = queues.get(guild.id);
  if (!queue || queue.songs.length === 0) return null;

  return queue.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n');
}

module.exports = {
  addToQueue,
  pause,
  resume,
  skip,
  stop,
  toggleLoop,
  setVolume,
  getQueue
};
