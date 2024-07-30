import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { GithubSignInButton } from "~/components/buttons/auth/github";
import { GoogleSignInButton } from "~/components/buttons/auth/google";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function Home() {
  const { data: sessionData } = useSession();

  console.log("sessionData", sessionData);

  return (
    <>
      <Head>
        <title>file management system</title>
        <meta name="description" content="developed by aminos" />
        <link rel="icon" href="/fmgr.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-yellow-300">f</span> Manager
          </h1>
          {sessionData ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-white/20 px-2 py-1">
                <Avatar>
                  <AvatarImage
                    src={String(sessionData?.user?.image)}
                    alt={String(sessionData?.user?.name)}
                  />
                  <AvatarFallback>
                    {sessionData?.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-white">{sessionData?.user?.name}</p>
                  <p className="text-[10px] text-slate-300">
                    {sessionData?.user?.email}
                  </p>
                </div>
              </div>
              <button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <GoogleSignInButton />
              <GithubSignInButton />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
