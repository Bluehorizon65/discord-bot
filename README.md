#  Discord Utility Bot: SoundCloud & Valorant Hub
Welcome to the repository for a multi-purpose Discord bot that seamlessly integrates high-quality audio streaming with competitive gaming utilities. This bot serves as a centralized hub for server entertainment, offering robust music controls and in-depth Valorant player analytics.

# System Architecture
The bot is built on a modular, event-driven architecture designed to handle concurrent user interactions efficiently:

Client Dispatcher: The core entry point for all Discord interactions. It acts as an intelligent router, intercepting and directing slash commands and interactive UI elements (like music player buttons) to their respective service handlers.

Audio Player Service: A dedicated playback engine. The main music commands delegate state management, queue controls, and SoundCloud streaming directly to this module to ensure uninterrupted playback.

External API Integrations: Leverages third-party REST APIs to fetch real-time game telemetry, account statistics, and cosmetic data for Valorant.

# Core Features
#  Music & Audio Playback
SoundCloud Integration: Stream high-quality audio directly from SoundCloud.

Delegated Queue Management: Full control over track queuing, skipping, and looping handled by the isolated Player module.

Interactive UI: Utilizes Discord's button components for intuitive, click-based playback controls (Play, Pause, Skip) routed seamlessly through the client dispatcher.

# Valorant Lookup Tools
Competitive Analytics: Fetch real-time user stats, current competitive rank, and detailed match history.

Account & Cosmetics: Advanced account lookup features, including dedicated commands to view in-game weapon skins and player inventories via external API sampling.
