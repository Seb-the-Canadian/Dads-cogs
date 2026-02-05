import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { VotingPanel } from "~/components/VotingPanel";
import { api } from "~/utils/api";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium leading-none";

function getRankDisplay(index: number): string {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUBMISSION: "bg-blue-100 text-blue-800",
    VOTING: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  const labels: Record<string, string> = {
    SUBMISSION: "Submissions Open",
    VOTING: "Voting Open",
    COMPLETED: "Completed",
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function SubmissionForm({
  roundId,
  existing,
}: {
  roundId: string;
  existing: {
    spotifyTrackId: string;
    trackName: string;
    artistName: string;
    albumArt: string | null;
  } | null;
}) {
  const utils = api.useUtils();
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<{
    spotifyTrackId: string;
    trackName: string;
    artistName: string;
    albumArt: string | null;
    previewUrl: string | null;
  } | null>(
    existing
      ? {
          spotifyTrackId: existing.spotifyTrackId,
          trackName: existing.trackName,
          artistName: existing.artistName,
          albumArt: existing.albumArt,
          previewUrl: null,
        }
      : null,
  );

  const [lookupInput, setLookupInput] = useState<string | null>(null);
  const {
    data: lookupResult,
    isFetching: isLookingUp,
    error: lookupError,
  } = api.submission.lookupTrack.useQuery(
    { spotifyUrl: lookupInput ?? "" },
    {
      enabled: !!lookupInput,
      retry: false,
    },
  );

  useEffect(() => {
    if (lookupResult) {
      setTrackData({
        spotifyTrackId: lookupResult.spotifyTrackId,
        trackName: lookupResult.trackName,
        artistName: lookupResult.artistName,
        albumArt: lookupResult.albumArt,
        previewUrl: lookupResult.previewUrl,
      });
      setLookupInput(null);
      setError(null);
    }
  }, [lookupResult]);

  useEffect(() => {
    if (lookupError) {
      setError(lookupError.message);
      setLookupInput(null);
    }
  }, [lookupError]);

  const submit = api.submission.submit.useMutation({
    onSuccess: () => {
      void utils.round.getById.invalidate({ roundId });
      void utils.submission.getMySubmission.invalidate({ roundId });
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleLookup = () => {
    const trimmed = spotifyUrl.trim();
    if (!trimmed) return;
    setError(null);
    setTrackData(null);
    setLookupInput(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackData) return;

    submit.mutate({
      roundId,
      spotifyTrackId: trackData.spotifyTrackId,
      trackName: trackData.trackName,
      artistName: trackData.artistName,
      albumArt: trackData.albumArt ?? undefined,
      previewUrl: trackData.previewUrl ?? undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existing ? "Update Submission" : "Submit a Track"}
        </CardTitle>
        <CardDescription>
          {existing
            ? "You can update your submission until the submission period ends."
            : "Paste a Spotify link to submit a track for this round."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!trackData ? (
            <>
              <div className="space-y-2">
                <label htmlFor="spotifyUrl" className={labelClass}>
                  Spotify Link
                </label>
                <div className="flex gap-2">
                  <input
                    id="spotifyUrl"
                    type="text"
                    className={inputClass}
                    placeholder="https://open.spotify.com/track/..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLookup}
                    disabled={isLookingUp || !spotifyUrl.trim()}
                  >
                    {isLookingUp ? "Looking up..." : "Look Up"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  In Spotify: Share → Copy Link, then paste here.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                {trackData.albumArt && (
                  <img
                    src={trackData.albumArt}
                    alt=""
                    className="h-12 w-12 rounded"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    &ldquo;{trackData.trackName}&rdquo;
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {trackData.artistName}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTrackData(null);
                    setSpotifyUrl("");
                  }}
                >
                  Change
                </Button>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {trackData && (
            <Button
              type="submit"
              className="w-full"
              disabled={submit.isPending}
            >
              {submit.isPending
                ? "Submitting..."
                : existing
                  ? "Update Submission"
                  : "Submit Track"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default function RoundDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const roundId = id as string;

  const { data: round, isLoading } = api.round.getById.useQuery(
    { roundId },
    { enabled: !!roundId },
  );

  const { data: mySubmission } = api.submission.getMySubmission.useQuery(
    { roundId },
    { enabled: !!roundId && !!session },
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p>Loading round...</p>
        </div>
      </main>
    );
  }

  if (!round) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Round Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This round doesn&apos;t exist.</p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const sortedSubmissions = [...round.submissions].sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  return (
    <>
      <Head>
        <title>
          Round {round.roundNumber}
          {round.theme ? `: ${round.theme}` : ""} - Dads-cogs
        </title>
      </Head>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href={`/league/${round.league.slug}`}>
                ← Back to {round.league.name}
              </Link>
            </Button>
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-4xl font-bold">
                Round {round.roundNumber}
                {round.theme ? `: ${round.theme}` : ""}
              </h1>
              <StatusBadge status={round.status} />
            </div>
            {round.description && (
              <p className="mb-2 text-muted-foreground">{round.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {round.status === "SUBMISSION" && (
                <>Submissions close {formatDate(round.submissionEnd)}</>
              )}
              {round.status === "VOTING" && (
                <>Voting closes {formatDate(round.votingEnd)}</>
              )}
              {round.status === "COMPLETED" && <>Round completed</>}
            </p>
          </div>

          <div className="space-y-6">
            {/* Submission phase: show form + anonymous submissions */}
            {round.status === "SUBMISSION" && session && (
              <SubmissionForm
                roundId={roundId}
                existing={mySubmission ?? null}
              />
            )}

            {/* Voting phase: show voting panel */}
            {round.status === "VOTING" && session && (
              <VotingPanel roundId={roundId} submissions={round.submissions} />
            )}

            {/* Completed: show results with names revealed */}
            {round.status === "COMPLETED" && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sortedSubmissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <span className="w-8 text-center text-lg">
                        {getRankDisplay(index)}
                      </span>
                      {submission.albumArt && (
                        <img
                          src={submission.albumArt}
                          alt=""
                          className="h-10 w-10 rounded"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          &ldquo;{submission.trackName}&rdquo; by{" "}
                          {submission.artistName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          submitted by {submission.user?.name ?? "Unknown"}
                        </p>
                      </div>
                      <span className="font-semibold">
                        {submission.totalPoints} pts
                      </span>
                    </div>
                  ))}

                  {sortedSubmissions.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No submissions were made this round.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submissions list (shown during SUBMISSION and VOTING phases) */}
            {round.status !== "COMPLETED" && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Submissions ({round.submissions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {round.submissions.length > 0 ? (
                    round.submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        {submission.albumArt && (
                          <img
                            src={submission.albumArt}
                            alt=""
                            className="h-10 w-10 rounded"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            &ldquo;{submission.trackName}&rdquo;
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {submission.artistName}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No submissions yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Spotify playlist link */}
            {round.playlistUrl && (
              <Button asChild variant="outline" className="w-full">
                <a href={round.playlistUrl} target="_blank" rel="noreferrer">
                  Open Spotify Playlist
                </a>
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
