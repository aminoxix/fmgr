import { signOut } from "next-auth/react";
import Link from "next/link";

import { PiSignOut } from "react-icons/pi";
import { sidebarMenus as menus } from "~/lib/data";

const MobileSidebar = () => {
  return (
    <aside className="sticky flex justify-between gap-2 md:invisible">
      <div className="flex rounded-full border border-gray-300 bg-gray-900 bg-opacity-0 bg-clip-padding backdrop-blur-sm backdrop-filter">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.url}
            className="flex w-full flex-col items-center gap-1 rounded-lg px-4 py-2 text-white transition"
          >
            {menu.icon}
          </Link>
        ))}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-900 bg-opacity-0 bg-clip-padding backdrop-blur-sm backdrop-filter">
        <button onClick={() => void signOut()}>
          <PiSignOut className="h-8 w-8 hover:text-white/20 md:h-5 md:w-5" />
        </button>
      </div>
    </aside>
  );
};

export default MobileSidebar;
