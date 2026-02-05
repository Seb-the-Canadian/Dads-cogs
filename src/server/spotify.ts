import { db } from "~/server/db";
import { env } from "~/env";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface SpotifyPlaylistResponse {
  id: string;
  external_urls: {
    spotify: string;
  };
}

export async function refreshAdminToken(userId: string): Promise<string> {
  const account = await db.account.findFirst({
    where: {
      userId,
      provider: "spotify",
    },
  });

  if (!account?.refresh_token) {
    throw new Error("No Spotify refresh token found for user");
  }

  const basicAuth = Buffer.from(
    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  await db.account.update({
    where: {
      id: account.id,
    },
    data: {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      refresh_token: data.refresh_token ?? account.refresh_token,
    },
  });

  return data.access_token;
}

export async function createRoundPlaylist(roundId: string): Promise<void> {
  const round = await db.round.findUnique({
    where: { id: roundId },
    include: {
      league: {
        include: {
          admin: {
            include: {
              accounts: {
                where: {
                  provider: "spotify",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!round) {
    throw new Error("Round not found");
  }

  const adminSpotifyId = round.league.admin.accounts[0]?.providerAccountId;
  if (!adminSpotifyId) {
    throw new Error("Admin does not have a Spotify account linked");
  }

  const accessToken = await refreshAdminToken(round.league.adminId);

  const playlistName = round.theme
    ? `Dads-cogs: ${round.theme}`
    : `Dads-cogs: Round ${round.roundNumber}`;

  const createResponse = await fetch(
    `https://api.spotify.com/v1/users/${adminSpotifyId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        description: `Round ${round.roundNumber} - ${round.league.name}`,
        public: false,
      }),
    }
  );

  if (!createResponse.ok) {
    throw new Error(`Failed to create playlist: ${createResponse.statusText}`);
  }

  const playlist = (await createResponse.json()) as SpotifyPlaylistResponse;

  await db.round.update({
    where: { id: roundId },
    data: {
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls.spotify,
    },
  });
}

export async function addTracksToPlaylist(
  roundId: string,
  trackIds: string[]
): Promise<void> {
  const round = await db.round.findUnique({
    where: { id: roundId },
    include: {
      league: true,
    },
  });

  if (!round?.playlistId) {
    throw new Error("Playlist not found for round");
  }

  const accessToken = await refreshAdminToken(round.league.adminId);

  const trackUris = trackIds.map((id) => `spotify:track:${id}`);

  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${round.playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
  }
}
