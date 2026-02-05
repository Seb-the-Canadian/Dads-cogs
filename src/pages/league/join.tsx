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
import { api } from "~/utils/api";

function extractSlug(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/^\/league\/([^/]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // Not a URL
  }
  const pathMatch = trimmed.match(/^\/league\/([^/]+)/);
  if (pathMatch?.[1]) return pathMatch[1];
  return trimmed;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium leading-none";

export default function JoinLeaguePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.query.slug && typeof router.query.slug === "string") {
      setSlug(router.query.slug);
    }
  }, [router.query.slug]);

  const joinLeague = api.league.join.useMutation({
    onSuccess: () => {
      const extracted = extractSlug(slug);
      void router.push(`/league/${extracted}`);
    },
    onError: (err) => {
      if (err.data?.code === "NOT_FOUND") {
        setError(
          "No league found with that slug. Check the URL and try again.",
        );
      } else if (err.data?.code === "CONFLICT") {
        setError("You're already a member of this league.");
      } else {
        setError(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const extracted = extractSlug(slug);
    if (!extracted) return;

    joinLeague.mutate({ slug: extracted });
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You need to sign in to join a league.</p>
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
        <title>Join League - Dads-cogs</title>
      </Head>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-lg px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Join a League</CardTitle>
              <CardDescription>
                Enter a league slug or paste the full league URL to join.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="slug" className={labelClass}>
                    League Slug or URL
                  </label>
                  <input
                    id="slug"
                    type="text"
                    className={inputClass}
                    placeholder="dads-league"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask the league admin for the slug, or paste the full league
                    URL.
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={joinLeague.isPending || !slug.trim()}
                >
                  {joinLeague.isPending ? "Joining..." : "Join League"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
