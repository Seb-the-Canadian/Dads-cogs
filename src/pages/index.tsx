import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/utils/api";

export default function Home() {
  const { data: session } = useSession();
  const { data: leagues, isLoading } = api.league.getMyLeagues.useQuery(
    undefined,
    { enabled: !!session }
  );

  return (
    <>
      <Head>
        <title>Dads-cogs - Music League</title>
        <meta name="description" content="Share music, vote, and compete with friends" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold">🎵 Dads-cogs</h1>
            {session ? (
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {session.user.name}
                </p>
                <Button variant="outline" onClick={() => void signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => void signIn("spotify")}>
                Sign in with Spotify
              </Button>
            )}
          </div>

          {session ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Your Leagues</h2>
                <Button asChild>
                  <Link href="/league/create">Create League</Link>
                </Button>
              </div>

              {isLoading ? (
                <p>Loading leagues...</p>
              ) : leagues && leagues.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {leagues.map((league) => (
                    <Card key={league.id}>
                      <CardHeader>
                        <CardTitle>{league.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Status: {league.status}
                        </p>
                        <Button asChild className="w-full">
                          <Link href={`/league/${league.slug}`}>
                            View League
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="mb-4 text-center text-muted-foreground">
                      You haven&apos;t joined any leagues yet.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button asChild>
                        <Link href="/league/create">Create a League</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/league/join">Join a League</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Dads-cogs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  A Music League clone for sharing music, voting on tracks, and
                  competing with friends throughout a season.
                </p>
                <ul className="mb-4 space-y-2 text-sm">
                  <li>🎵 Submit Spotify tracks each round</li>
                  <li>🗳️ Vote on anonymous submissions</li>
                  <li>🏆 Track scores on the season leaderboard</li>
                  <li>📱 Mobile-first PWA design</li>
                </ul>
                <Button onClick={() => void signIn("spotify")} className="w-full">
                  Get Started with Spotify
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
