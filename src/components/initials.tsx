import { useRouter } from "next/router";
import { useState } from "react";

import { useForm } from "@mantine/form";
import { api } from "~/utils/api";

import FolderModal from "./molecules/modals/folder";
import { Button } from "./ui/button";

import { PiFolderPlus } from "react-icons/pi";
import { HeroIcon } from "./atoms/icons/hero";

const InitialUI = () => {
  const router = useRouter();

  const id = router.query.slug?.[router.query.slug?.length - 1];

  const [openFolderModal, setOpenFolderModal] = useState<boolean>(false);
  const [folderId, setFolderId] = useState<string>("");

  const { data: allFolders } = api.fManager.getAllFolders.useQuery();

  const folderForm = useForm<{
    name: string;
  }>({
    initialValues: {
      name: "",
    },
    validateInputOnChange: true,
    validate: {
      name: (value) => {
        if (allFolders?.some((folder) => folder.name === value)) {
          return "name already exists";
        }
        return null;
      },
    },
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 md:flex-row">
      <div>
        <h1 className="text-5xl font-bold text-white">
          Welcome to <span className="text-yellow-300">f</span>Mgr.
        </h1>
        <p className="mt-4 text-white">
          The only file management system you&apos;ll ever need.
        </p>
        <Button
          className="mt-10 flex items-center gap-2 border border-white/40 hover:bg-white/20"
          onClick={() => setOpenFolderModal(true)}
        >
          <PiFolderPlus className="h-5 w-5" />
          Create Folder
        </Button>
      </div>

      <HeroIcon />

      <FolderModal
        openFolderModal={openFolderModal}
        setOpenFolderModal={setOpenFolderModal}
        folderForm={folderForm}
        folderId={folderId}
        parentId={id}
        setFolderId={setFolderId}
      />
    </div>
  );
};

export default InitialUI;
