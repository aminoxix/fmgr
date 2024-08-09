import { useRouter } from "next/router";

import moment from "moment";
import { useToast } from "~/components/ui/use-toast";
import type { ExplicitFilteredFoldersType } from "~/lib/types";
import { api } from "~/utils/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "../ui/button";

import { LuFolderEdit } from "react-icons/lu";
import {
  PiDotsThree,
  PiDownload,
  PiEye,
  PiFolder,
  PiFolderOpen,
  PiTrash,
} from "react-icons/pi";

const Folders = ({
  id,
  filteredFolders,
  setDetailsFolderId,
  setDetailsFileId,
  setOpenFolderModal,
  setFolderId,
  folderId,
  setDeleteFolderOpened,
  deleteFolderOpened,
}: {
  id?: string;
  filteredFolders: ExplicitFilteredFoldersType;
  setDetailsFolderId: React.Dispatch<React.SetStateAction<string>>;
  setDetailsFileId: React.Dispatch<React.SetStateAction<string>>;
  setOpenFolderModal: React.Dispatch<React.SetStateAction<boolean>>;
  setFolderId: React.Dispatch<React.SetStateAction<string>>;
  folderId: string;
  setDeleteFolderOpened: React.Dispatch<React.SetStateAction<boolean>>;
  deleteFolderOpened: boolean;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const { refetch: refetchFolders } = api.fManager.getAllFolders.useQuery();

  const { refetch: refetchSingleFolder } =
    api.fManager.getSingleFolder.useQuery(
      {
        id: id!,
      },
      {
        enabled: !!id,
      },
    );

  const { refetch: refetchFiles } = api.fManager.getAllFilesOfFolder.useQuery(
    {
      folderId: id!,
    },
    {
      enabled: !!id,
    },
  );

  const { mutate: deleteFolder } = api.fManager.deleteFolder.useMutation({
    onSuccess: () => {
      toast({
        title: "Folder deleted",
        description: "Folder has been deleted successfully!",
      });
      setFolderId("");
      void refetchFolders();
      void refetchFiles();
      void refetchSingleFolder();
      setDeleteFolderOpened(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete folder",
        description: `Error deleting folder: ${error.message}`,
      });
      setFolderId("");
    },
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
      {filteredFolders?.map((folder) => {
        const convertedCreatedAt = moment(folder?.createdAt).calendar();
        return (
          <button
            type="button"
            key={folder.id}
            className="flex justify-between gap-4 rounded-md border border-white/40 px-5 py-4 hover:bg-white/20"
            onDoubleClick={() =>
              void router.push(`${location.pathname}/${folder.id}`)
            }
          >
            <div className="shrink-0">
              <PiFolder className="h-[34px] w-[34px]" />
            </div>
            <div className="flex w-full items-center justify-between gap-x-2">
              <div className="text-start">
                {folder.name}
                <p className="text-left text-xs font-light">
                  Uploaded {convertedCreatedAt}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <PiDotsThree className="h-6 w-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-44">
                  <DropdownMenuLabel className="!text-[0.75rem] font-medium text-[#868e96]">
                    <DropdownMenuLabel>Folder</DropdownMenuLabel>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      void router.push(
                        id
                          ? `${location.pathname}/${folder.id}`
                          : `team-files/${folder.id}`,
                      );
                    }}
                    // href={{
                    //   pathname: `${router.pathname}/${folder.id}`,
                    //   query: { slug: router.query.slug },
                    // }}
                  >
                    <PiFolderOpen size={14} className="mr-2" /> Open
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setDetailsFolderId(folder.id);
                      id && setDetailsFileId("");
                    }}
                  >
                    <PiEye size={14} className="mr-2" /> Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setOpenFolderModal(true);
                      setFolderId(folder.id);
                    }}
                  >
                    <LuFolderEdit size={14} className="mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFolderId(folder.id)}>
                    <PiDownload size={14} className="mr-2" /> Download
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      setFolderId(folder.id);
                      setDeleteFolderOpened(true);
                    }}
                    className="cursor-pointer py-2 text-red-600 hover:!text-red-700"
                  >
                    <PiTrash size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog
                open={deleteFolderOpened}
                onOpenChange={() => {
                  setFolderId("");
                  setDeleteFolderOpened(false);
                }}
              >
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete</DialogTitle>
                    <DialogDescription>
                      Do you really want to delete these records?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFolderId("");
                        setDeleteFolderOpened(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() =>
                        deleteFolder({
                          id: folderId,
                        })
                      }
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default Folders;
