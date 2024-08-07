import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { type AppType } from "next/app";

import { MantineProvider } from "@mantine/core";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "~/components/ui/toaster";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <MantineProvider>
        <div className={GeistSans.className}>
          <Component {...pageProps} />
        </div>
        <Toaster />
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
