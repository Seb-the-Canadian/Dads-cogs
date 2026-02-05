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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium leading-none";

export default function CreateLeaguePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createLeague = api.league.create.useMutation({
    onSuccess: (league) => {
      void router.push(`/league/${league.slug}`);
    },
    onError: (err) => {
      if (err.message.includes("Unique constraint")) {
        setError("A league with this slug already exists. Try a different name.");
      } else {
        setError(err.message);
      }
    },
  });

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) return;

    createLeague.mutate({
      name: name.trim(),
      slug: slug.trim(),
      discordWebhookUrl: discordWebhookUrl.trim() || undefined,
    });
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
              <p className="mb-4">You need to sign in to create a league.</p>
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
        <title>Create League - Dads-cogs</title>
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
              <CardTitle>Create a League</CardTitle>
              <CardDescription>
                Start a new music league and invite your friends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className={labelClass}>
                    League Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={inputClass}
                    placeholder="The Dad Rock League"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="slug" className={labelClass}>
                    URL Slug
                  </label>
                  <input
                    id="slug"
                    type="text"
                    className={inputClass}
                    placeholder="the-dad-rock-league"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    /league/{slug || "..."}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="webhook" className={labelClass}>
                    Discord Webhook URL{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="webhook"
                    type="url"
                    className={inputClass}
                    placeholder="https://discord.com/api/webhooks/..."
                    value={discordWebhookUrl}
                    onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createLeague.isPending || !name.trim() || !slug.trim()
                  }
                >
                  {createLeague.isPending ? "Creating..." : "Create League"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
