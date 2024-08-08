import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { signOut, useSession } from "next-auth/react";
import { PiSignOut } from "react-icons/pi";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { sidebarMenus as menus } from "~/lib/data";

const DesktopSidebar = () => {
  const { pathname } = useRouter();
  const { data: sessionData } = useSession();

  return (
    <aside className="hidden basis-1/4 rounded-r-xl border-r border-white/20 bg-black p-4 md:flex md:p-8">
      <div className="flex h-screen w-full flex-col justify-between">
        <h1 className="text-base font-extrabold tracking-tight text-white">
          <Image src="/fmgr.png" alt="f manager" width={50} height={50} />
          <span className="text-yellow-300">f</span> Manager
        </h1>
        <div>
          {menus.map((menu) => (
            <div key={menu.name}>
              <Link
                href={menu.url}
                className={`flex w-full items-center gap-4 rounded-lg bg-black/20 px-4 py-2 text-white transition hover:bg-white/10 ${
                  pathname === menu.url && "bg-white/10"
                }`}
              >
                {menu.icon}
                <span>{menu.name}</span>
              </Link>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
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
              <p className="text-xs text-white">{sessionData?.user?.name}</p>
              <p className="text-[10px] text-slate-300">
                {sessionData?.user?.email}
              </p>
            </div>
          </div>
          <button
            className="flex items-center justify-center gap-4 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={() => void signOut()}
          >
            Sign out <PiSignOut />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
