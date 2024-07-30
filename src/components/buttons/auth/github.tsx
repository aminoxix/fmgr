import { signIn } from "next-auth/react";
import { PiGithubLogo } from "react-icons/pi";

export function GithubSignInButton() {
  const handleClick = () => signIn("github");

  return (
    <button
      onClick={handleClick}
      className="focus:shadow-outline mt-4 flex h-14 w-full items-center justify-center rounded-lg border-2 border-black bg-white px-6 text-xl font-semibold text-black transition-colors duration-300 hover:bg-slate-200"
    >
      <PiGithubLogo className="h-8 w-8" />
      <span className="ml-4">Continue with GitHub</span>
    </button>
  );
}
