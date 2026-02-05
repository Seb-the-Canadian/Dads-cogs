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
    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
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
    },
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
  trackIds: string[],
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
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
  }
}

interface SpotifyTrackResponse {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string; height: number; width: number }>;
  };
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface TrackLookupResult {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumArt: string | null;
  previewUrl: string | null;
}

export function extractTrackId(input: string): string | null {
  const trimmed = input.trim();

  // Spotify URI: spotify:track:4cOdK2wGLETKBW3PvgPWqT
  const uriMatch = trimmed.match(/^spotify:track:([a-zA-Z0-9]{22})$/);
  if (uriMatch?.[1]) return uriMatch[1];

  // Spotify URL: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=...
  try {
    const url = new URL(trimmed);
    if (url.hostname === "open.spotify.com") {
      const pathMatch = url.pathname.match(/^\/track\/([a-zA-Z0-9]{22})/);
      if (pathMatch?.[1]) return pathMatch[1];
    }
  } catch {
    // Not a URL
  }

  // Bare track ID (22 char alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;

  return null;
}

export async function lookupTrack(
  trackId: string,
  accessToken: string,
): Promise<TrackLookupResult> {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Track not found on Spotify");
    }
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  const track = (await response.json()) as SpotifyTrackResponse;

  const albumArt =
    track.album.images.find((img) => img.height === 300)?.url ??
    track.album.images[0]?.url ??
    null;

  return {
    spotifyTrackId: track.id,
    trackName: track.name,
    artistName: track.artists.map((a) => a.name).join(", "),
    albumArt,
    previewUrl: track.preview_url,
  };
}
