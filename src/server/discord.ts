interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

export async function sendDiscordNotification(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<void> {
  if (!webhookUrl) {
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Failed to send Discord notification: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error sending Discord notification:", error);
  }
}

export function createRoundStartNotification(
  leagueName: string,
  roundNumber: number,
  theme: string | null,
  submissionEnd: Date
): DiscordWebhookPayload {
  return {
    embeds: [
      {
        title: `🎵 Round ${roundNumber} Started!`,
        description: theme
          ? `**Theme:** ${theme}`
          : `Round ${roundNumber} is now open for submissions!`,
        color: 0x1db954,
        fields: [
          {
            name: "League",
            value: leagueName,
            inline: true,
          },
          {
            name: "Submissions Close",
            value: `<t:${Math.floor(submissionEnd.getTime() / 1000)}:R>`,
            inline: true,
          },
        ],
        footer: {
          text: "Dads-cogs Music League",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function createVotingStartNotification(
  leagueName: string,
  roundNumber: number,
  theme: string | null,
  votingEnd: Date,
  playlistUrl: string | null
): DiscordWebhookPayload {
  const fields = [
    {
      name: "League",
      value: leagueName,
      inline: true,
    },
    {
      name: "Voting Closes",
      value: `<t:${Math.floor(votingEnd.getTime() / 1000)}:R>`,
      inline: true,
    },
  ];

  if (playlistUrl) {
    fields.push({
      name: "Playlist",
      value: `[Listen on Spotify](${playlistUrl})`,
      inline: false,
    });
  }

  return {
    embeds: [
      {
        title: `🗳️ Voting for Round ${roundNumber} is Open!`,
        description: theme ? `**Theme:** ${theme}` : undefined,
        color: 0x1db954,
        fields,
        footer: {
          text: "Dads-cogs Music League",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function createRoundCompleteNotification(
  leagueName: string,
  roundNumber: number,
  theme: string | null,
  topSubmissions: Array<{
    trackName: string;
    artistName: string;
    points: number;
    userName: string;
  }>
): DiscordWebhookPayload {
  const fields = topSubmissions.slice(0, 3).map((submission, index) => ({
    name: `${["🥇", "🥈", "🥉"][index]} ${submission.trackName}`,
    value: `${submission.artistName} - ${submission.points} points\nSubmitted by ${submission.userName}`,
    inline: false,
  }));

  return {
    embeds: [
      {
        title: `🏁 Round ${roundNumber} Complete!`,
        description: theme ? `**Theme:** ${theme}` : undefined,
        color: 0xffd700,
        fields: [
          {
            name: "League",
            value: leagueName,
            inline: false,
          },
          ...fields,
        ],
        footer: {
          text: "Dads-cogs Music League",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
