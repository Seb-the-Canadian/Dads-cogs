import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/utils/api";
import { cn } from "~/lib/utils";

interface Submission {
  id: string;
  trackName: string;
  artistName: string;
  albumArt: string | null;
  userId: string;
}

interface VotingPanelProps {
  roundId: string;
  submissions: Submission[];
}

export function VotingPanel({ roundId, submissions }: VotingPanelProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();

  const { data: myVotes } = api.vote.getMyVotes.useQuery(
    { roundId },
    { enabled: !!session },
  );

  const castVote = api.vote.castVote.useMutation({
    onSuccess: () => {
      void utils.vote.getMyVotes.invalidate({ roundId });
    },
  });

  const getVoteForSubmission = (submissionId: string): number => {
    if (!myVotes) return 0;
    const vote = myVotes.find((v) => v.submissionId === submissionId);
    return vote?.points ?? 0;
  };

  const handleVote = (submissionId: string, points: number) => {
    castVote.mutate({ roundId, submissionId, points });
  };

  const isOwnSubmission = (submission: Submission): boolean => {
    return session?.user?.id === submission.userId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Votes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submissions.map((submission) => {
          const isOwn = isOwnSubmission(submission);
          const currentPoints = getVoteForSubmission(submission.id);

          return (
            <div
              key={submission.id}
              className={cn(
                "rounded-lg border p-4",
                isOwn && "opacity-50",
              )}
            >
              <div className="mb-2 flex items-center gap-3">
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
                {currentPoints > 0 && (
                  <span className="text-sm font-medium">
                    {currentPoints} pts
                  </span>
                )}
              </div>

              {isOwn ? (
                <p className="text-sm text-muted-foreground">
                  You can&apos;t vote for your own submission
                </p>
              ) : (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((points) => (
                    <Button
                      key={points}
                      variant={currentPoints === points ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleVote(submission.id, points)}
                      disabled={castVote.isPending}
                    >
                      {points}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {submissions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No submissions to vote on yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
