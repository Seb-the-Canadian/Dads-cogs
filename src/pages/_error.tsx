import { type NextPageContext } from "next";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface ErrorPageProps {
  statusCode: number | undefined;
}

function ErrorPage({ statusCode }: ErrorPageProps) {
  const title = statusCode === 404
    ? "Page Not Found"
    : "An Error Occurred";

  const message = statusCode === 404
    ? "The page you're looking for doesn't exist."
    : `An error ${statusCode ? statusCode : ""} occurred on the server.`;

  return (
    <>
      <Head>
        <title>{title} | Dads-cogs</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {statusCode && (
                <span className="text-4xl font-bold text-muted-foreground">
                  {statusCode}
                </span>
              )}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{message}</p>
            <Button asChild className="w-full">
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;
