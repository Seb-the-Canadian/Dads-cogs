import { useState } from "react";
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
import { api } from "~/utils/api";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium leading-none";

export default function CreateRoundPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const slug = router.query.slug as string | undefined;

  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [submissionStart, setSubmissionStart] = useState("");
  const [submissionEnd, setSubmissionEnd] = useState("");
  const [votingStart, setVotingStart] = useState("");
  const [votingEnd, setVotingEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: league, isLoading: leagueLoading } =
    api.league.getBySlug.useQuery(
      { slug: slug as string },
      { enabled: !!slug },
    );

  const createRound = api.round.create.useMutation({
    onSuccess: (round) => {
      void router.push(`/round/${round.id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You need to sign in to create a round.</p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (leagueLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p>Loading league...</p>
        </div>
      </main>
    );
  }

  if (!league) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>League Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This league doesn&apos;t exist.</p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (league.adminId !== session.user.id) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Only the league admin can create rounds.</p>
              <Button asChild>
                <Link href={`/league/${slug}`}>Back to League</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!submissionStart || !submissionEnd || !votingStart || !votingEnd) {
      setError("All date fields are required.");
      return;
    }

    const ssDate = new Date(submissionStart);
    const seDate = new Date(submissionEnd);
    const vsDate = new Date(votingStart);
    const veDate = new Date(votingEnd);

    if (ssDate >= seDate) {
      setError("Submission Start must be before Submission End.");
      return;
    }
    if (seDate > vsDate) {
      setError("Submission End must be on or before Voting Start.");
      return;
    }
    if (vsDate >= veDate) {
      setError("Voting Start must be before Voting End.");
      return;
    }

    createRound.mutate({
      leagueId: league.id,
      theme: theme.trim() || undefined,
      description: description.trim() || undefined,
      submissionStart: ssDate,
      submissionEnd: seDate,
      votingStart: vsDate,
      votingEnd: veDate,
    });
  };

  return (
    <>
      <Head>
        <title>Create Round - Dads-cogs</title>
      </Head>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-lg px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href={`/league/${slug}`}>← Back to {league.name}</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create a Round</CardTitle>
              <CardDescription>
                Add a new round to {league.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="theme" className={labelClass}>
                    Theme{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="theme"
                    type="text"
                    className={inputClass}
                    placeholder="Songs that remind you of summer"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className={labelClass}>
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    className={inputClass}
                    rows={3}
                    placeholder="Any extra details about this round..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="submissionStart" className={labelClass}>
                    Submission Start
                  </label>
                  <input
                    id="submissionStart"
                    type="datetime-local"
                    className={inputClass}
                    value={submissionStart}
                    onChange={(e) => setSubmissionStart(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="submissionEnd" className={labelClass}>
                    Submission End
                  </label>
                  <input
                    id="submissionEnd"
                    type="datetime-local"
                    className={inputClass}
                    value={submissionEnd}
                    onChange={(e) => setSubmissionEnd(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="votingStart" className={labelClass}>
                    Voting Start
                  </label>
                  <input
                    id="votingStart"
                    type="datetime-local"
                    className={inputClass}
                    value={votingStart}
                    onChange={(e) => setVotingStart(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="votingEnd" className={labelClass}>
                    Voting End
                  </label>
                  <input
                    id="votingEnd"
                    type="datetime-local"
                    className={inputClass}
                    value={votingEnd}
                    onChange={(e) => setVotingEnd(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRound.isPending}
                >
                  {createRound.isPending ? "Creating..." : "Create Round"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
