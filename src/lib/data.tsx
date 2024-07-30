import { PiFolderOpen, PiGear, PiUploadBold } from "react-icons/pi";

export const sidebarMenus = [
  {
    name: "System",
    icon: (
      <PiFolderOpen className="h-8 w-8 hover:text-white/20 md:h-5 md:w-5" />
    ),
    url: "/",
  },
  {
    name: "Upload",
    icon: (
      <PiUploadBold className="h-8 w-8 hover:text-white/20 md:h-5 md:w-5" />
    ),
    url: "/upload",
  },
  {
    name: "Profile",
    icon: <PiGear className="h-8 w-8 hover:text-white/20 md:h-5 md:w-5" />,
    url: "/settings",
  },
];
