import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Geist } from "next/font/google";
import { ErrorBoundary } from "~/components/ErrorBoundary";

import "~/styles/globals.css";
import { api } from "~/utils/api";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={geist.className}>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
