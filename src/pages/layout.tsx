import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";

import DesktopSidebar from "~/components/sidebar/desktop";
import MobileSidebar from "~/components/sidebar/mobile";

import { LuLoader2 } from "react-icons/lu";
import { GithubSignInButton } from "~/components/buttons/auth/github";
import { GoogleSignInButton } from "~/components/buttons/auth/google";

type PropsWithChildrenType = { children: React.ReactNode };

export default function Layout({ children }: PropsWithChildrenType) {
  const { data, status } = useSession();

  return (
    <>
      <Head>
        <title>file management system</title>
        <meta name="description" content="developed by aminos" />
        <link rel="icon" href="/fmgr.png" />
      </Head>
      <main className="flex min-h-screen flex-1 items-center justify-center bg-black">
        {status === "loading" ? (
          <LuLoader2 className="h-6 w-6" color="#fff" />
        ) : (
          <>
            {data ? (
              <div className="flex min-h-screen flex-1">
                <DesktopSidebar />
                <div className="flex min-h-screen flex-1 flex-col items-center justify-between gap-4 bg-black px-4 py-4 text-white md:px-12">
                  <Image
                    className="h-15 w-15 items-center justify-center rounded-md border border-gray-300 bg-gray-900 bg-opacity-0 bg-clip-padding p-2 backdrop-blur-sm backdrop-filter md:invisible"
                    src="/fmgr.png"
                    alt="f manager"
                    width={50}
                    height={50}
                  />
                  <div className="flex min-w-full flex-1 flex-col gap-4 md:gap-6">
                    {children}
                  </div>
                  <MobileSidebar />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                  <span className="text-yellow-300">f</span> Manager
                </h1>
                <div className="flex flex-col items-center gap-2">
                  <GoogleSignInButton />
                  <GithubSignInButton />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
