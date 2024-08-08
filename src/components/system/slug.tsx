import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import moment from "moment";
import { api, type RouterOutputs } from "~/utils/api";

import { Avatar, Button } from "@mantine/core";
import { useForm } from "@mantine/form";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import type { JSONValue } from "postgres";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import InitialUI from "../initials";

import { LuFolderEdit, LuLoader2 } from "react-icons/lu";
import {
  PiArrowLeft,
  PiDotsThree,
  PiDownload,
  PiEye,
  PiFileAudio,
  PiFileDoc,
  PiFilePdf,
  PiFilePlus,
  PiFilePng,
  PiFileTxt,
  PiFileZip,
  PiFolder,
  PiFolderOpen,
  PiFolderPlus,
  PiList,
  PiMagnifyingGlass,
  PiTable,
  PiTrash,
  PiVideo,
} from "react-icons/pi";

import FileDisplay from "~/components/file-details";
import FilesTable from "~/components/files-table";
import FileModal, { RenameFileModal } from "~/components/modals/file";
import FolderModal from "~/components/modals/folder";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";

const SystemSlug = () => {
  const router = useRouter();
  const { toast } = useToast();

  const id = router.query.slug?.[router.query.slug?.length - 1];

  const [openFileModal, setOpenFileModal] = useState<boolean>(false);
  const [openFileRenameModal, setOpenFileRenameModal] =
    useState<boolean>(false);
  const [openFolderModal, setOpenFolderModal] = useState<boolean>(false);
  const [fileId, setFileId] = useState<string>("");
  const [folderId, setFolderId] = useState<string>("");
  const [detailsFolderId, setDetailsFolderId] = useState<string>("");
  const [detailsFileId, setDetailsFileId] = useState<string>("");
  const [isTable, setIsTable] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState<string>("");
  const [deleteFolderOpened, setDeleteFolderOpened] = useState<boolean>(false);
  const [deleteFileOpened, setDeleteFileOpened] = useState<boolean>(false);

  const [openedInformation, setOpenedInformation] = useState<boolean>(false);
  const [singleFolderData, setSingleFolderData] = useState<
    | (RouterOutputs["fManager"]["getSingleFolder"] & {
        modification: unknown[] | JSONValue[] | null;
      })
    | null
  >(null);
  const [singleFileData, setSingleFileData] = useState<{
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    name: string | null;
    url: string | null;
    type: string | null;
    createdBy: string | null;
    folderId: string | null;
  }>({
    id: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: null,
    url: null,
    type: null,
    createdBy: null,
    folderId: null,
  });

  const { data: allUsers } = api.user.getAllUsers.useQuery();

  const {
    data: allFolders,
    refetch: refetchFolders,
    isPending,
  } = api.fManager.getAllFolders.useQuery();
  const { data: singleFolder, refetch: refetchSingleFolder } =
    api.fManager.getSingleFolder.useQuery(
      {
        id: id!,
      },
      {
        enabled: !!id,
      },
    );
  const { data: singleFolderInFolder } = api.fManager.getSingleFolder.useQuery(
    {
      id: folderId || detailsFolderId,
    },
    {
      enabled: !!folderId || !!detailsFolderId,
    },
  );

  useEffect(() => {
    if (singleFolder) {
      setSingleFolderData(singleFolder);
      setOwnerId(singleFolder.createdBy!);
    }
  }, [id, singleFolder, allFolders]);

  const { data: allFiles, refetch: refetchFiles } =
    api.fManager.getAllFilesOfFolder.useQuery(
      {
        folderId: id!,
      },
      {
        enabled: !!id,
      },
    );

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

  const fileForm = useForm<{
    name: string;
    url: string;
    type: string;
    folderId: string;
  }>({
    initialValues: {
      name: "",
      url: "",
      type: "",
      folderId: "",
    },
    validateInputOnChange: true,
    validate: {
      name: (value) => {
        if (allFiles?.some((file) => file.name === value)) {
          return "name already exists";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (singleFolderInFolder) {
      folderForm.setValues({
        name: singleFolderInFolder.name!,
      });
    }
  }, [singleFolderInFolder]);

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

  const { data: singleFile } = api.fManager.getSingleFile.useQuery(
    {
      id: detailsFileId || fileId,
    },
    {
      enabled: !!detailsFileId || !!fileId,
    },
  );

  useEffect(() => {
    if (singleFile) {
      fileForm.setValues({
        name: singleFile.name!,
      });
      setSingleFileData(singleFile);
    }
  }, [singleFile]);

  const filteredFolders = searchInput
    ? singleFolderData?.children?.filter((folder) =>
        folder.name?.toLocaleLowerCase().startsWith(searchInput.toLowerCase()),
      )
    : singleFolderData?.children;

  const filteredFiles = searchInput
    ? allFiles?.filter((file) =>
        file.name?.toLocaleLowerCase().startsWith(searchInput.toLowerCase()),
      )
    : allFiles;

  const filteredFilesFolders = searchInput
    ? [...(singleFolderData?.children ?? []), ...(allFiles ?? [])]?.filter(
        (fileFolder) =>
          fileFolder.name
            ?.toLocaleLowerCase()
            .startsWith(searchInput.toLowerCase()),
      )
    : [...(singleFolderData?.children ?? []), ...(allFiles ?? [])];

  useEffect(() => {
    if (detailsFileId || detailsFolderId) {
      setOpenedInformation(true);
    }
  }, [detailsFileId, detailsFolderId]);

  return (
    <>
      <Drawer
        open={openedInformation}
        onClose={() => setOpenedInformation(false)}
        onOpenChange={(opened: boolean) => setOpenedInformation(opened)}
      >
        <DrawerContent>
          <div className="flex shrink-0 flex-col gap-2 px-7 py-4 text-black">
            <p className="text-center text-xl font-semibold">Information</p>
            {detailsFolderId ? (
              <div className="flex w-full flex-col items-center gap-7">
                <div className="flex flex-col items-center gap-2">
                  <PiFolder className="h-[42px] w-[42px]" />
                  <p className="font-semibold">
                    {
                      allFolders?.find(
                        (folder) => folder.id === detailsFolderId,
                      )?.name
                    }
                  </p>
                  <div className="flex gap-1 text-sm">
                    <p className="font-semibold">Owner:</p>
                    {allUsers?.find((user) => user.id === ownerId)?.name ??
                      allUsers?.find((user) => user.id === ownerId)?.email ??
                      "Unknown"}
                  </div>
                </div>
                {allFolders
                  ?.find((folder) => folder.id === detailsFolderId)
                  ?.modification.map((item, index) => (
                    <div
                      className="flex w-full justify-between gap-6"
                      key={index}
                    >
                      <div className="flex gap-3">
                        <Avatar
                          src={
                            allUsers?.find(
                              (user) => user.id === item?.lastModifiedBy,
                            )?.image ?? ""
                          }
                          className="h-8 w-8"
                        />
                        <div className="flex flex-col">
                          <p className="text-xs font-thin">Last modified by</p>
                          <p className="text-sm">{item?.name}</p>
                        </div>
                      </div>
                      <p className="text-xs font-thin">
                        {item?.lastModifiedAt}
                      </p>
                    </div>
                  ))}
              </div>
            ) : detailsFileId ? (
              <>
                {singleFileData && (
                  <FileDisplay
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    singleFileData={singleFileData}
                  />
                )}
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

      <FolderModal
        parentId={id}
        openFolderModal={openFolderModal}
        setOpenFolderModal={setOpenFolderModal}
        folderForm={folderForm}
        folderId={folderId}
        setFolderId={setFolderId}
      />

      <FileModal
        id={id}
        fileForm={fileForm}
        openFileModal={openFileModal}
        setOpenFileModal={setOpenFileModal}
        fileId={fileId}
        setFileId={setFileId}
        folderData={[
          {
            value: singleFolderData?.id ?? "",
            label: singleFolderData?.name ?? "",
          },
        ]}
      />

      <RenameFileModal
        id={id}
        fileForm={fileForm}
        openFileModal={openFileRenameModal}
        setOpenFileModal={setOpenFileRenameModal}
        fileId={fileId}
        setFileId={setFileId}
        folderData={[]}
      />

      {isPending ? (
        <LuLoader2 className="h-6 w-6" color="#fff" />
      ) : (
        <div className="flex w-full flex-col gap-8 md:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PiArrowLeft
                className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-white/40 p-1 hover:bg-white/20"
                onClick={() => void router.back()}
              />
              <div className="flex items-center gap-2">
                <Input
                  className="w-auto border border-white/40 2xl:w-1/3"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.currentTarget.value)}
                />
                <PiMagnifyingGlass />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-white/40 p-1.5"
                onClick={() => {
                  folderForm.reset();
                  setOpenFolderModal(true);
                }}
              >
                <PiFolderPlus />
              </button>
              <button
                disabled={allFolders?.length === 0}
                className="rounded-md border border-white/40 p-1.5 md:hidden"
                onClick={() => {
                  setFileId("");
                  fileForm.reset();
                  setDetailsFileId("");
                  setOpenFileModal(true);
                }}
              >
                <PiFilePlus />
              </button>
              <Button
                disabled={allFolders?.length === 0}
                onClick={() => {
                  setFileId("");
                  fileForm.reset();
                  setDetailsFileId("");
                  setOpenFileModal(true);
                }}
                className="hidden h-[34px] w-auto rounded border-white/40 bg-white/20 hover:border hover:bg-transparent md:block md:w-40"
              >
                Add File
              </Button>
              <button
                className="rounded-md border border-white/40 p-1.5"
                onClick={() => setIsTable((prev) => !prev)}
              >
                {isTable ? <PiTable /> : <PiList />}
              </button>
            </div>
          </div>

          {filteredFolders?.length ? (
            <>
              {isTable ? (
                <FilesTable
                  setFileId={setFileId}
                  folderId={id ? id : folderId}
                  setFolderId={setFolderId}
                  filesFolders={filteredFilesFolders}
                  setOpenFileModal={setOpenFileRenameModal}
                  setOpenFolderModal={setOpenFolderModal}
                  setDetailsFolderId={setDetailsFolderId}
                  setDetailsFileId={setDetailsFileId}
                  selectedRowIds={selectedRowIds}
                  setSelectedRowIds={setSelectedRowIds}
                />
              ) : (
                <>
                  {filteredFolders?.length !== 0 && (
                    <div className="flex flex-col gap-4">
                      <h1>Child Folders</h1>
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                        {filteredFolders?.map((folder) => {
                          const convertedCreatedAt = moment(
                            folder?.createdAt,
                          ).calendar();
                          return (
                            <button
                              type="button"
                              key={folder.id}
                              className="flex justify-between gap-4 rounded-md border border-white/40 px-5 py-4 hover:bg-white/20"
                              onDoubleClick={() =>
                                void router.push(
                                  `${location.pathname}/${folder.id}`,
                                )
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
                                      <DropdownMenuLabel>
                                        Folder
                                      </DropdownMenuLabel>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        void router.push(
                                          `${location.pathname}/${folder.id}`,
                                        );
                                      }}
                                      // href={{
                                      //   pathname: `${router.pathname}/${folder.id}`,
                                      //   query: { slug: router.query.slug },
                                      // }}
                                    >
                                      <PiFolderOpen
                                        size={14}
                                        className="mr-2"
                                      />{" "}
                                      Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setDetailsFolderId(folder.id);
                                        setDetailsFileId("");
                                      }}
                                    >
                                      <PiEye size={14} className="mr-2" />{" "}
                                      Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setOpenFolderModal(true);
                                        setFolderId(folder.id);
                                      }}
                                    >
                                      <LuFolderEdit
                                        size={14}
                                        className="mr-2"
                                      />{" "}
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setFolderId(folder.id)}
                                    >
                                      <PiDownload size={14} className="mr-2" />{" "}
                                      Download
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuLabel>
                                      Danger zone
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setFolderId(folder.id);
                                        setDeleteFolderOpened(true);
                                      }}
                                      className="cursor-pointer py-2 text-red-600 hover:!text-red-700"
                                    >
                                      <PiTrash size={14} className="mr-2" />{" "}
                                      Delete
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
                                        Do you really want to delete these
                                        records?
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button
                                        variant="ghost"
                                        className="border border-white/20 bg-white text-white/20 hover:bg-white"
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
                    </div>
                  )}
                  {filteredFiles?.length !== 0 && (
                    <div className="flex flex-col gap-4">
                      <h1>Files</h1>
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
                                  </DropdownMenuItem>{" "}
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
                                      Do you really want to delete these
                                      records?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="ghost"
                                      className="border border-white/20 bg-white text-white/20 hover:bg-white"
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
                                Uploaded{" "}
                                {moment(file.createdAt).format("MMM DD")}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <InitialUI />
          )}
        </div>
      )}
    </>
  );
};

export default SystemSlug;

function GetFileExtension({
  type,
  url,
  name,
}: {
  type: string;
  url: string;
  name: string;
}) {
  return (
    <div>
      {type.includes("image") ? (
        <Image
          src={url}
          alt={name}
          width="150"
          height="150"
          className="rounded"
        />
      ) : type.includes("pdf") ? (
        <PiFilePdf width="150" height="150" className="h-24 w-24" />
      ) : type.includes("audio") ? (
        <PiFileAudio width="150" height="150" className="h-24 w-24" />
      ) : type.includes("video") ? (
        <PiVideo width="150" height="150" className="h-24 w-24" />
      ) : type.includes("text") ? (
        <PiFileTxt width="150" height="150" className="h-24 w-24" />
      ) : type.includes("zip") ? (
        <PiFileZip width="150" height="150" className="h-24 w-24" />
      ) : type.includes("document") ? (
        <PiFileDoc width="150" height="150" className="h-24 w-24" />
      ) : type.includes("png") ? (
        <PiFilePng width="150" height="150" className="h-24 w-24" />
      ) : null}
    </div>
  );
}
