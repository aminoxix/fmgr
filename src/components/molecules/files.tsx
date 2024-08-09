import moment from "moment";

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
import { PiDotsThree, PiEye, PiTrash } from "react-icons/pi";

import type { ExplicitFilteredFilesType } from "~/lib/types";
import { api, type RouterOutputs } from "~/utils/api";
import { useToast } from "../ui/use-toast";
import { GetFileExtension } from "./get-extn";

const SystemFiles = ({
  id,
  filteredFiles,
  setDetailsFileId,
  fileId,
  setFileId,
  deleteFileOpened,
  setDeleteFileOpened,
  setDetailsFolderId,
  setSingleFileData,
  setOpenModal,
  setOpenFileRenameModal,
}: {
  id?: string;
  filteredFiles: ExplicitFilteredFilesType;
  setDetailsFileId: React.Dispatch<React.SetStateAction<string>>;
  fileId: string;
  setFileId: React.Dispatch<React.SetStateAction<string>>;
  deleteFileOpened: boolean;
  setDeleteFileOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailsFolderId: React.Dispatch<React.SetStateAction<string>>;
  setSingleFileData: React.Dispatch<
    React.SetStateAction<RouterOutputs["fManager"]["getAllFilesOfFolder"][0]>
  >;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenFileRenameModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { toast } = useToast();

  const { refetch: refetchFiles } = api.fManager.getAllFilesOfFolder.useQuery(
    {
      folderId: id!,
    },
    {
      enabled: !!id,
    },
  );

  const { mutate: deleteOneFile } = api.fManager.deleteOneFile.useMutation({
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "File has been deleted successfully!",
      });
      setFileId("");
      void refetchFiles();
      setDeleteFileOpened(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete file",
        description: `Error deleting file: ${error.message}`,
        variant: "destructive",
      });
      setFileId("");
    },
  });

  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-2 xl:grid-cols-5">
      {filteredFiles?.map((file, index) => (
        <button
          key={index}
          onClick={() => {
            setDetailsFileId(file.id);
            setDetailsFolderId("");
          }}
          onDoubleClick={() => {
            setOpenModal(true);
            setSingleFileData(file);
          }}
          className="flex cursor-pointer flex-col items-center justify-between gap-4 rounded-md border border-white/40 px-2 py-2 pb-6 hover:bg-white/20 md:px-6"
        >
          <div className="flex w-full justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <PiDotsThree />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-44">
                <DropdownMenuLabel className="!text-[0.75rem] font-medium text-[#868e96]">
                  File
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDetailsFileId(file.id);
                  }}
                  className="cursor-pointer py-2"
                >
                  <PiEye size={14} className="mr-2" />
                  <span>Open</span>
                </DropdownMenuItem>{" "}
                <DropdownMenuItem
                  onClick={() => {
                    setOpenFileRenameModal(true);
                    setFileId(file.id);
                  }}
                  className="cursor-pointer py-2"
                >
                  <LuFolderEdit size={14} className="mr-2" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="!text-[0.75rem] font-medium text-[#868e96]">
                  Danger zone
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setFileId(file.id);
                    setDeleteFileOpened(true);
                  }}
                  className="cursor-pointer py-2 text-red-600 hover:!text-red-700"
                >
                  <PiTrash size={14} className="mr-2" />
                  <span className="">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
              open={deleteFileOpened}
              onOpenChange={() => {
                setFileId("");
                setDeleteFileOpened(false);
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
                      setFileId("");
                      setDeleteFileOpened(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() =>
                      deleteOneFile({
                        id: fileId,
                      })
                    }
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <GetFileExtension
            name={file?.name ?? ""}
            type={file?.type ?? ""}
            url={file?.url ?? ""}
          />

          <div>
            <p className="text-center text-sm">{file.name}</p>
            <p className="text-center text-xs font-light">
              Uploaded {moment(file.createdAt).format("MMM DD")}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SystemFiles;
