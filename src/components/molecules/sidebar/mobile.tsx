import { signOut } from "next-auth/react";
import Link from "next/link";

import { PiSignOut } from "react-icons/pi";
import { sidebarMenus as menus } from "~/lib/data";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const MobileSidebar = () => {
  return (
    <aside className="sticky flex w-full justify-between gap-2 md:invisible">
      <div className="h-12 w-12"></div>
      <div className="flex rounded-full border border-gray-300 bg-gray-900 bg-opacity-0 bg-clip-padding backdrop-blur-sm backdrop-filter">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.url}
            className="flex w-full flex-col items-center gap-1 rounded-lg px-4 py-2 text-white transition"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-default">{menu.icon}</button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{menu.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
        ))}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-900 bg-opacity-0 bg-clip-padding backdrop-blur-sm backdrop-filter">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => void signOut()}>
                <PiSignOut className="h-8 w-8 hover:text-white/20 md:h-5 md:w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Peace out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};

export default MobileSidebar;
