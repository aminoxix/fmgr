import type { UseFormReturnType } from "@mantine/form";
import type { FolderFormType } from "~/lib/types";
import { api } from "~/utils/api";

import {
  PiFilePlus,
  PiFolderPlus,
  PiList,
  PiMagnifyingGlass,
  PiTable,
  PiTrash,
} from "react-icons/pi";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "../ui/button";

import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

const SystemHeader = ({
  searchInput,
  setSearchInput,
  isTable,
  setIsTable,
  setOpenFolderModal,
  folderForm,
  setFileId,
  fileForm,
  setOpenFileModal,
  selectedRowIds,
  setSelectedRowIds,
  setDeleteFileOpened,
  setDeleteFolderOpened,
  deleteFolderOpened,
}: {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  isTable: boolean;
  setIsTable: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenFolderModal: React.Dispatch<React.SetStateAction<boolean>>;
  folderForm: UseFormReturnType<
    {
      name: string;
    },
    (values: { name: string }) => {
      name: string;
    }
  >;
  setFileId: React.Dispatch<React.SetStateAction<string>>;
  fileForm: UseFormReturnType<
    FolderFormType,
    (values: FolderFormType) => FolderFormType
  >;
  setOpenFileModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRowIds: string[];
  setSelectedRowIds: React.Dispatch<React.SetStateAction<string[]>>;
  setDeleteFileOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteFolderOpened: React.Dispatch<React.SetStateAction<boolean>>;
  deleteFolderOpened: boolean;
}) => {
  const { toast } = useToast();

  const { data: allFolders, refetch: refetchFolders } =
    api.fManager.getAllFolders.useQuery();
  const { refetch: refetchFiles } = api.fManager.getAllFiles.useQuery();

  const { mutate: deleteMultipleFiles } =
    api.fManager.deleteMultipleFiles.useMutation({
      onSuccess: () => {
        toast({
          title: "Files deleted",
          description: "Files has been deleted successfully!",
        });
        setSelectedRowIds([]);
        setDeleteFileOpened(false);
        void refetchFiles();
        void refetchFolders();
      },
      onError: (error) => {
        toast({
          title: "Failed to delete files",
          description: `Error deleting files: ${error.message}`,
          variant: "destructive",
        });
      },
    });

  const isFolderIncluded = allFolders?.some((folder) =>
    selectedRowIds.includes(folder.id),
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex w-full items-center gap-2">
        <Input
          className="w-auto border border-white/40 md:w-1/3"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-default">
                <PiMagnifyingGlass />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start typing in search box...</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="rounded-md border border-white/40 p-1.5"
                onClick={() => {
                  folderForm.reset();
                  setOpenFolderModal(true);
                }}
              >
                <PiFolderPlus />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add folder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={allFolders?.length === 0}
                className="rounded-md border border-white/40 p-1.5 md:hidden"
                onClick={() => {
                  setFileId("");
                  fileForm.reset();
                  setOpenFileModal(true);
                }}
              >
                <PiFilePlus />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          disabled={allFolders?.length === 0}
          onClick={() => {
            setFileId("");
            fileForm.reset();
            setOpenFileModal(true);
          }}
          className="hidden h-[34px] w-auto rounded border-white/40 bg-white/20 hover:border hover:bg-transparent md:block md:w-40"
        >
          Add File
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="rounded-md border border-white/40 p-1.5"
                onClick={() => setIsTable((prev) => !prev)}
              >
                {isTable ? <PiTable /> : <PiList />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isTable ? "List view" : "Table view"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isTable && (
          <>
            {!isFolderIncluded && (
              <>
                <Dialog
                  open={deleteFolderOpened}
                  onOpenChange={() => setDeleteFolderOpened(false)}
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
                        className="border border-white/20 bg-white text-white/20 hover:bg-white"
                        onClick={() => setDeleteFolderOpened(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() =>
                          deleteMultipleFiles({
                            ids: selectedRowIds,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        disabled={selectedRowIds.length < 1}
                        onClick={() => setDeleteFolderOpened(true)}
                        className="rounded-md border border-gray-400 p-1"
                      >
                        <PiTrash width={17} height={17} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemHeader;
