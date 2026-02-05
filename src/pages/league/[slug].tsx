import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { SeasonLeaderboard } from "~/components/SeasonLeaderboard";
import { api } from "~/utils/api";

export default function LeaguePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session } = useSession();

  const { data: league, isLoading } = api.league.getBySlug.useQuery(
    { slug: slug as string },
    { enabled: !!slug },
  );

  if (isLoading) {
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

  return (
    <>
      <Head>
        <title>{league.name} - Dads-cogs</title>
        <meta
          name="description"
          content={`Season leaderboard for ${league.name}`}
        />
      </Head>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">{league.name}</h1>
            <p className="text-muted-foreground">
              Admin: {league.admin.name} • Status: {league.status}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Season Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <SeasonLeaderboard members={league.members} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Rounds</CardTitle>
                  {session?.user?.id === league.adminId && (
                    <Button asChild size="sm">
                      <Link href={`/round/create?slug=${league.slug}`}>
                        + New Round
                      </Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {league.rounds.length > 0 ? (
                    <div className="space-y-2">
                      {league.rounds.map((round) => (
                        <Button
                          key={round.id}
                          variant="outline"
                          className="w-full justify-between"
                          asChild
                        >
                          <Link href={`/round/${round.id}`}>
                            <span>
                              Round {round.roundNumber}
                              {round.theme && `: ${round.theme}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {round.status}
                            </span>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No rounds yet
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{league.members.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Dads competing
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
