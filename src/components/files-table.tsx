import React, { useEffect, useState } from "react";

import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

// import {
//   Doc17Icon,
//   FilesNavbarIcon,
//   Folder17Icon,
//   MpFour17Icon,
//   MpThree17Icon,
//   Pdf17Icon,
//   Png17Icon,
//   Txt17Icon,
//   Zip17Icon,
// } from "@/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import moment from "moment";
import { TbDots, TbEye, TbFolderOpen, TbTrash } from "react-icons/tb";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useRouter } from "next/router";
import { LuFileEdit, LuFolderEdit } from "react-icons/lu";
import { api } from "~/utils/api";

import { type JSONValue } from "postgres";
import {
  PiFile,
  PiFileAudio,
  PiFileDoc,
  PiFilePdf,
  PiFilePng,
  PiFileTxt,
  PiFileZip,
  PiFolder,
  PiVideo,
} from "react-icons/pi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const FilesTable = ({
  setFileId,
  folderId,
  setFolderId,
  filesFolders,
  setOpenFileModal,
  setOpenFolderModal,
  setDetailsFileId,
  setDetailsFolderId,
  selectedRowIds,
  setSelectedRowIds,
}: {
  setFileId: React.Dispatch<React.SetStateAction<string>>;
  folderId?: string;
  setFolderId?: React.Dispatch<React.SetStateAction<string>>;
  filesFolders?: (
    | {
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string | null;
        url: string | null;
        type: string | null;
        createdBy: string | null;
        folderId: string | null;
      }
    | {
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string | null;
        modification: unknown[] | JSONValue[] | null;
        createdBy: string | null;
      }
  )[];
  setOpenFileModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenFolderModal?: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailsFileId: React.Dispatch<React.SetStateAction<string>>;
  setDetailsFolderId?: React.Dispatch<React.SetStateAction<string>>;
  selectedRowIds: string[];
  setSelectedRowIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const zip = new JSZip();
  const router = useRouter();
  const { toast } = useToast();

  const [openedDelete, setOpenedDelete] = useState<boolean>(false);
  const [entityId, setEntityId] = useState<string>("");
  const [downloadFolderName, setDownloadFolderName] = useState<string>("");
  const [filesById, setFilesById] = useState<
    {
      name: string | null;
      id: string;
      url: string | null;
      type: string | null;
    }[]
  >([]);

  const { data: allUsers } = api.user.getAllUsers.useQuery();
  const { data: allFolders, refetch: refetchFolders } =
    api.fManager.getAllFolders.useQuery();
  const { data: allFiles, refetch: refetchFiles } =
    api.fManager.getAllFiles.useQuery();

  const { data: singleFolder, refetch: refetchSingleFolder } =
    api.fManager.getSingleFolder.useQuery(
      {
        id: folderId!,
      },
      { enabled: !!folderId },
    );

  const { refetch: refetchFilesOfFolder } =
    api.fManager.getAllFilesOfFolder.useQuery(
      {
        folderId: folderId!,
      },
      {
        enabled: !!folderId,
      },
    );

  useEffect(() => {
    if (singleFolder) {
      setFilesById(
        singleFolder?.files as {
          name: string | null;
          id: string;
          url: string | null;
          type: string | null;
        }[],
      );
      setDownloadFolderName(singleFolder.name!);
    }
  }, [singleFolder]);

  const { mutate: deleteFolder } = api.fManager.deleteFolder.useMutation({
    onSuccess: () => {
      toast({
        title: "Folder deleted",
        description: "Folder has been deleted successfully!",
      });
      setEntityId("");
      void refetchFolders();
      void refetchFiles();
      void refetchSingleFolder();
      setOpenedDelete(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete folder",
        description: `Error deleting folder: ${error.message}`,
      });
    },
  });

  //   const { mutate: deleteSharedWithXamtacFolder } =
  //     api.fManager.deleteSharedWithXamtacFolder.useMutation({
  //       onSuccess: () => {
  //         notifications.show({
  //           title: "Folder deleted",
  //           message: "Folder has been deleted successfully!",
  //           color: "green",
  //         });
  //         setEntityId("");
  //         void refetchFolders();
  //         void refetchFiles();
  //         void refetchSharedWithXamtacFolders();
  //         void refetchSingleSharedWithXamtacFolder();
  //         deleteClose();
  //       },
  //       onError: (error) => {
  //         notifications.show({
  //           title: "Failed to delete folder",
  //           message: `Error deleting folder: ${error.message}`,
  //           color: "red",
  //         });
  //       },
  //     });

  const { data: multipleFilesByIds } =
    api.fManager.getMultipleFilesByIds.useQuery(
      {
        fileIds: selectedRowIds,
      },
      {
        enabled: !!selectedRowIds,
      },
    );

  useEffect(() => {
    if (multipleFilesByIds) {
      setFilesById(multipleFilesByIds);
    }
  }, [multipleFilesByIds, selectedRowIds]);

  const { mutate: deleteOneFile } = api.fManager.deleteOneFile.useMutation({
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "File has been deleted successfully!",
      });
      setEntityId("");
      void refetchFolders();
      void refetchFiles();
      void refetchSingleFolder();
      void refetchFilesOfFolder();
      setOpenedDelete(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete file",
        description: `Error deleting file: ${error.message}`,
      });
    },
  });

  const handleFilesDownload = async (
    files: {
      name: string | null;
      id: string;
      url: string | null;
      type: string | null;
    }[],
  ) => {
    const promises = files.map((file) => {
      return new Promise<void>((resolve) => {
        const { name: name, type, url: downloadUrl } = file;

        if (downloadUrl && name) {
          if (type?.includes("image")) {
            zip.file(
              `${name}.${downloadUrl.split(".").pop()}`,
              fetch(downloadUrl).then((response) => response.blob()),
            );
          } else if (
            type === "application/zip" ||
            type === "text/plain" ||
            type === "application/pdf"
          ) {
            zip.file(
              `${name}.${type.toLowerCase()}`,
              fetch(downloadUrl).then((response) => response.blob()),
            );
          } else if (type?.includes("document")) {
            zip.file(
              `${name}.docx`,
              fetch(downloadUrl).then((response) => response.blob()),
            );
          } else {
            zip.file(
              name,
              fetch(downloadUrl).then((response) => response.blob()),
            );
          }
          resolve();
        } else {
          console.error("downloadUrl or name is not defined.");
          resolve();
        }
      });
    });

    await Promise.all(promises);

    void zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, `${downloadFolderName || "files"}.zip`);
      setDownloadFolderName("");
      setFilesById([]);
      setSelectedRowIds([]);
      toast({
        title: "Zip downloaded successfully",
        description:
          "All files downloaded within zip, extract & track your files",
      });
    });
  };

  const handleCheckboxChange = (id: string) => (checked: boolean) => {
    if (checked) {
      setSelectedRowIds([...selectedRowIds, id]);
    } else {
      setSelectedRowIds(
        selectedRowIds.filter((selectedId) => selectedId !== id),
      );
    }
  };

  const handleSelectAllCheckboxChange = () => {
    if (selectedRowIds.length === filesFolders?.length) {
      setSelectedRowIds([]);
    } else {
      const allIds = filesFolders?.map((entity) => entity.id);
      setSelectedRowIds(allIds!);
    }
  };

  const isFolderIncluded = allFolders?.some((folder) =>
    selectedRowIds.includes(folder.id),
  );

  return (
    <div className="relative h-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="md:w-1/3">
              <div className="flex gap-2">
                <Checkbox
                  className="border-white/20"
                  checked={selectedRowIds.length === filesFolders?.length}
                  onCheckedChange={handleSelectAllCheckboxChange}
                  aria-label="Select all"
                />
                Name
              </div>
            </TableHead>
            <TableHead className="md:w-1/3">Owner</TableHead>
            <TableHead className="md:w-1/3">Modified/ Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(filesFolders) &&
            filesFolders?.map((entity) => (
              <>
                <TableRow key={entity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        className="border-white/20"
                        checked={selectedRowIds.includes(entity.id)}
                        onCheckedChange={handleCheckboxChange(entity.id)}
                        aria-label="Select all"
                      />
                      {!("folderId" in entity) ? (
                        <PiFolder className="w-[17px]" />
                      ) : entity.type === "application/pdf" ? (
                        <PiFilePdf className="w-[17px]" />
                      ) : entity.type?.includes("document") ? (
                        <PiFileDoc className="w-[17px]" />
                      ) : entity.type?.includes("image") ? (
                        <PiFilePng className="w-[17px]" />
                      ) : entity.type === "text/plain" ? (
                        <PiFileTxt className="w-[17px]" />
                      ) : entity.type === "application/zip" ? (
                        <PiFileZip className="w-[17px]" />
                      ) : entity.type === "video/mp4" ? (
                        <PiVideo className="w-[17px]" />
                      ) : entity.type?.includes("audio") ? (
                        <PiFileAudio className="w-[17px]" />
                      ) : null}
                      {entity.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {allUsers?.find((user) => user.id === entity.createdBy)
                      ?.name ??
                      allUsers?.find((user) => user.id === entity.createdBy)
                        ?.email ??
                      "Unknown"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-between">
                      {moment(entity.updatedAt).format("ll")}
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <TbDots />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-44">
                          <DropdownMenuLabel className="!text-[0.75rem] font-medium text-[#868e96]">
                            Rename
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              if (
                                router.pathname.includes(
                                  "/marketing-dashboard/marketing-collaboration/team-files",
                                )
                              ) {
                                "folderId" in entity
                                  ? setDetailsFileId(entity.id)
                                  : void router.push(
                                      `${location.pathname}/${entity.id}`,
                                    );
                              } else {
                                "xamtacSharedFolderId" in entity
                                  ? setDetailsFileId(entity.id)
                                  : void router.push(
                                      `${location.pathname}/${entity.id}`,
                                    );
                              }
                            }}
                            className="cursor-pointer py-2"
                          >
                            {"folderId" in entity ||
                            "xamtacSharedFolderId" in entity ? (
                              <TbEye size={14} />
                            ) : (
                              <TbFolderOpen size={14} />
                            )}
                            <span className="ml-2">Open</span>
                          </DropdownMenuItem>

                          {!(
                            "folderId" in entity ||
                            "xamtacSharedFolderId" in entity
                          ) && (
                            <DropdownMenuItem
                              onClick={() => {
                                setDetailsFolderId &&
                                  setDetailsFolderId(entity.id);
                              }}
                              className="cursor-pointer py-2"
                            >
                              <TbEye size={14} className="mr-2" />
                              <span>Details</span>
                            </DropdownMenuItem>
                          )}

                          {"folderId" in entity ||
                          "xamtacSharedFolderId" in entity ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenFileModal(true);
                                setFileId(entity.id);
                              }}
                            >
                              <LuFileEdit size={14} className="mr-2" />
                              Rename
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenFolderModal && setOpenFolderModal(true);
                                setFolderId && setFolderId(entity.id);
                              }}
                            >
                              <LuFolderEdit size={14} className="mr-2" />
                              Rename
                            </DropdownMenuItem>
                          )}

                          {!("xamtacSharedFolderId" in entity) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="!text-[0.75rem] font-medium text-[#868e96]">
                                Danger zone
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                className="cursor-pointer py-2 text-red-600 hover:!text-red-700"
                                onClick={() => {
                                  setEntityId(entity.id);
                                  setOpenedDelete(true);
                                }}
                              >
                                <TbTrash size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
                <Dialog
                  open={openedDelete}
                  onOpenChange={() => {
                    setEntityId("");
                    setOpenedDelete(false);
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
                          setEntityId("");
                          setOpenedDelete(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => {
                          (allFiles?.some((file) => file.id === entityId) ??
                          singleFolder?.files.some(
                            (file) => file.id === entityId,
                          ))
                            ? deleteOneFile({
                                id: entityId,
                              })
                            : deleteFolder({
                                id: entityId,
                              });
                        }}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ))}
        </TableBody>
      </Table>

      {filesById?.length > 1 && (
        <>
          {!isFolderIncluded && (
            <div className="absolute bottom-2 right-2 flex w-[276px] flex-col rounded-b-lg border-white/40 bg-transparent text-xs shadow-lg">
              <div className="flex items-center justify-between rounded-t-lg bg-[#F4F4F4] p-2">
                <div className="flex items-center gap-1">
                  <PiFile />
                  {downloadFolderName || "Files"}
                </div>
                <p className="text-custom-pink">
                  {filesById.length} files selected
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-b-lg bg-white py-3">
                <div>Download All files</div>
                <button
                  onClick={() => void handleFilesDownload(filesById)}
                  className="text-[10px] underline"
                >
                  Click here
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FilesTable;
