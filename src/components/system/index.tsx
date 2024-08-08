import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import moment from "moment";
import { api } from "~/utils/api";

import { Avatar, Button, Drawer, Group, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";

import { LuFolderEdit } from "react-icons/lu";
import {
  PiDotsThree,
  PiDownload,
  PiEye,
  PiFile,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useClickOutside, useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import FileDisplay from "../file-details";
import FilesTable from "../files-table";
import FileModal, { RenameFileModal } from "../modals/file";
import FolderModal from "../modals/folder";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

const System = () => {
  const zip = new JSZip();
  const router = useRouter();
  const { toast } = useToast();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openFolderModal, setOpenFolderModal] = useState<boolean>(false);
  const [openFileModal, setOpenFileModal] = useState<boolean>(false);
  const [openFileRenameModal, setOpenFileRenameModal] =
    useState<boolean>(false);
  const [
    deleteFolderOpened,
    { open: deleteFolderOpen, close: deleteFolderClose },
  ] = useDisclosure(false);
  const [deleteFileOpened, { open: deleteFileOpen, close: deleteFileClose }] =
    useDisclosure(false);
  const [
    openedInformation,
    { open: informationOpen, close: informationClose },
  ] = useDisclosure(false);

  const [folderId, setFolderId] = useState<string>("");
  const [fileId, setFileId] = useState<string>("");
  const [detailsFolderId, setDetailsFolderId] = useState<string>("");
  const [detailsFileId, setDetailsFileId] = useState<string>("");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState<string>("");
  const [isTable, setIsTable] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [downloadFolderName, setDownloadFolderName] = useState<string>("");
  const [filesById, setFilesById] = useState<
    {
      name: string | null;
      id: string;
      url: string | null;
      type: string | null;
    }[]
  >([]);
  const [folderData, setFolderData] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
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

  const { data: allFolders, refetch: refetchFolders } =
    api.fManager.getAllFolders.useQuery();
  const { data: allFiles, refetch: refetchFiles } =
    api.fManager.getAllFiles.useQuery();
  const { data: allUsers } = api.user.getAllUsers.useQuery();
  const ref = useClickOutside(() => setDetailsFolderId(""));
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
      folderId: (value) => (value === "" ? "folder is required" : null),
      url: (value) => (value === "" ? "url is required" : null),
    },
  });

  useEffect(() => {
    if (allFolders && allFolders?.length > 0) {
      const data = allFolders?.map((folder) => {
        return {
          label: folder.name,
          value: folder.id,
        };
      });
      setFolderData(data as { label: string; value: string }[]);
    }
  }, [allFolders]);

  const { mutate: deleteFolder } = api.fManager.deleteFolder.useMutation({
    onSuccess: () => {
      toast({
        title: "Folder deleted",
        description: "Folder has been deleted successfully!",
      });
      setFolderId("");
      void refetchFolders();
      void refetchFiles();
      deleteFolderClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete folder",
        description: `Error deleting folder: ${error.message}`,
        variant: "destructive",
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
      deleteFileClose();
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

  const { data: singleFolder } = api.fManager.getSingleFolder.useQuery(
    {
      id: folderId || detailsFolderId,
    },
    {
      enabled: !!folderId || !!detailsFolderId,
    },
  );

  useEffect(() => {
    if (singleFolder) {
      setFilesById(singleFolder.files);
      setDetailsFileId("");
      folderForm.setValues({
        name: singleFolder.name!,
      });
      setOwnerId(singleFolder.createdBy!);
    }
  }, [singleFolder]);

  const { data: singleFile } = api.fManager.getSingleFile.useQuery(
    {
      id: fileId || detailsFileId,
    },
    {
      enabled: !!fileId || !!detailsFileId,
    },
  );

  useEffect(() => {
    if (singleFile) {
      setDetailsFolderId("");
      fileForm.setValues({
        name: singleFile.name!,
        folderId: singleFile.folderId!,
      });
      setSingleFileData(singleFile);
    }
  }, [singleFile]);

  const { mutate: deleteMultipleFiles } =
    api.fManager.deleteMultipleFiles.useMutation({
      onSuccess: () => {
        toast({
          title: "Files deleted",
          description: "Files has been deleted successfully!",
        });
        setSelectedRowIds([]);
        deleteFileClose();
        void refetchFiles();
        void refetchFolders();
      },
      onError: (error) => {
        toast({
          title: "Failed to delete files",
          description: `Error deleting files: ${error.message}`,
          color: "red",
        });
      },
    });

  const handleFileDownload = ({
    downloadUrl,
    type,
    name,
  }: {
    downloadUrl: string;
    type: string;
    name: string;
  }) => {
    if (downloadUrl && name) {
      if (type.includes("image")) {
        saveAs(downloadUrl, `${name}.${downloadUrl.split(".").pop()}`);
      } else if (
        type === "application/zip" ||
        type === "text/plain" ||
        type === "application/pdf"
      ) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `a.${
          type === "application/zip"
            ? "zip"
            : type === "text/plain"
              ? "txt"
              : type === "application/pdf"
                ? "pdf"
                : ""
        }`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
      } else {
        saveAs(downloadUrl, `${name}`);
      }
    } else {
      console.error("downloadUrl or name is not defined.");
    }
  };

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

  const allFoldersData =
    allFolders?.filter((folder) => folder.parentId === null) ?? [];
  const allFilesData = allFiles ?? [];

  const filesFolders = [...allFoldersData, ...allFilesData];

  const filteredFilesFolders = searchInput
    ? filesFolders.filter((fileFolder) =>
        fileFolder.name
          ?.toLocaleLowerCase()
          .startsWith(searchInput.toLowerCase()),
      )
    : filesFolders;

  const filteredFolders = searchInput
    ? allFoldersData.filter((folder) =>
        folder.name?.toLocaleLowerCase().startsWith(searchInput.toLowerCase()),
      )
    : allFoldersData;

  const filteredFiles = searchInput
    ? allFilesData.filter((file) =>
        file.name?.toLocaleLowerCase().startsWith(searchInput.toLowerCase()),
      )
    : allFilesData;

  const isFolderIncluded = allFolders?.some((folder) =>
    selectedRowIds.includes(folder.id),
  );

  return (
    <>
      {/* <button
        onClick={informationOpen}
        className="absolute right-0 top-3/4 z-10 flex h-10 w-10 items-center rounded-l-md bg-white px-2 py-2.5 md:top-[90%] md:hidden"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.42 7.406C14.7 7.154 15.036 7 15.4 7C15.778 7 16.1 7.154 16.394 7.406C16.66 7.7 16.8 8.036 16.8 8.4C16.8 8.778 16.66 9.1 16.394 9.394C16.1 9.66 15.778 9.8 15.4 9.8C15.036 9.8 14.7 9.66 14.42 9.394C14.154 9.1 14 8.778 14 8.4C14 8.036 14.154 7.7 14.42 7.406ZM10.92 13.958C10.92 13.958 13.958 11.55 15.064 11.452C16.1 11.368 15.89 12.558 15.792 13.174L15.778 13.258C15.582 14 15.344 14.896 15.106 15.75C14.574 17.696 14.056 19.6 14.182 19.95C14.322 20.426 15.19 19.824 15.82 19.404C15.904 19.348 15.974 19.292 16.044 19.25C16.044 19.25 16.156 19.138 16.268 19.292C16.296 19.334 16.324 19.376 16.352 19.404C16.478 19.6 16.548 19.67 16.38 19.782L16.324 19.81C16.016 20.02 14.7 20.944 14.168 21.28C13.594 21.658 11.396 22.918 11.732 20.468C12.026 18.746 12.418 17.262 12.726 16.1C13.3 14 13.552 13.048 12.264 13.874C11.746 14.182 11.438 14.378 11.256 14.504C11.102 14.616 11.088 14.616 10.99 14.434L10.948 14.35L10.878 14.238C10.78 14.098 10.78 14.084 10.92 13.958ZM28 14C28 21.7 21.7 28 14 28C6.3 28 0 21.7 0 14C0 6.3 6.3 0 14 0C21.7 0 28 6.3 28 14ZM25.2 14C25.2 7.812 20.188 2.8 14 2.8C7.812 2.8 2.8 7.812 2.8 14C2.8 20.188 7.812 25.2 14 25.2C20.188 25.2 25.2 20.188 25.2 14Z"
            fill="#309DF4"
          />
        </svg>
      </button> */}
      <Drawer
        opened={openedInformation}
        onClose={informationClose}
        position="right"
        closeOnClickOutside
        closeOnEscape
        overlayProps={{ opacity: 0.5, blur: 4 }}
        size={"sm"}
      >
        <div className="flex shrink-0 flex-col gap-2 px-4 py-4">
          <p className="text-center text-xl font-semibold">Information</p>
          {detailsFolderId && (
            <div className="flex w-full flex-col items-center gap-7">
              <div className="flex flex-col items-center gap-2">
                <PiFolder className="h-[42px] w-[42px]" />
                <p className="font-semibold">
                  {
                    allFolders?.find((folder) => folder.id === detailsFolderId)
                      ?.name
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
                        radius="50%"
                      />
                      <div className="flex flex-col">
                        <p className="text-xs font-thin">Last modified by</p>
                        <p className="text-sm">{item?.name}</p>
                      </div>
                    </div>
                    <p className="text-xs font-thin">{item?.lastModifiedAt}</p>
                  </div>
                ))}
            </div>
          )}
          {detailsFileId && (
            <>
              {singleFileData && (
                <FileDisplay
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                  singleFileData={singleFileData}
                />
              )}
            </>
          )}
          {!detailsFolderId && !detailsFileId && (
            <div className="flex justify-center gap-1">
              Click <PiDotsThree /> to see the details of folder
            </div>
          )}
        </div>
      </Drawer>

      <div className="flex w-full flex-col gap-8 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full items-center gap-2">
            <Input
              className="w-auto border border-white/40 md:w-1/3"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
            />
            <PiMagnifyingGlass />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-white/40 p-1.5"
              onClick={() => {
                setFolderId("");
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

            {isTable && (
              <>
                {!isFolderIncluded && (
                  <>
                    <Modal
                      opened={deleteFolderOpened}
                      onClose={deleteFolderClose}
                      withCloseButton={false}
                      title="Are you sure?"
                      centered
                      closeOnEscape
                    >
                      <div className="pb-4">
                        Do you really want to delete these records?
                      </div>
                      <Group justify="right">
                        <Button
                          className="border border-white/20 bg-white text-white/20 hover:bg-white"
                          onClick={deleteFolderClose}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={() =>
                            deleteMultipleFiles({
                              ids: selectedRowIds,
                            })
                          }
                        >
                          Delete
                        </Button>
                      </Group>
                    </Modal>
                    <button
                      onClick={deleteFolderOpen}
                      disabled={selectedRowIds.length < 1}
                      className="rounded-md border border-gray-400 p-2.5"
                    >
                      <PiTrash width={17} height={17} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {isTable ? (
          <FilesTable
            setFileId={setFileId}
            folderId={folderId}
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
          <div className="relative flex h-full flex-col gap-8">
            {filteredFolders?.length !== 0 && (
              <div className="flex flex-col gap-4">
                <h2>Parent Folders</h2>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                  {filteredFolders
                    ?.filter((folder) => folder.parentId === null)
                    .map((folder) => {
                      const convertedCreatedAt = moment(
                        folder?.createdAt,
                      ).calendar();
                      return (
                        <button
                          type="button"
                          key={folder.id}
                          className="flex justify-between gap-4 rounded-md border border-white/40 px-5 py-4 hover:bg-white/20"
                          onClick={() => setDetailsFolderId(folder.id)}
                          onDoubleClick={() => void router.push(`${folder.id}`)}
                        >
                          <div className="">
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
                                  Folder
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    void router.push(`team-files/${folder.id}`);
                                  }}
                                  className="cursor-pointer py-2"
                                >
                                  <PiFolderOpen size={14} className="mr-2" />
                                  <span>Open</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDetailsFolderId(folder.id);
                                  }}
                                  className="cursor-pointer py-2"
                                >
                                  <PiEye size={14} className="mr-2" />
                                  <span>Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOpenFolderModal(true);
                                    setFolderId(folder.id);
                                  }}
                                  className="cursor-pointer py-2"
                                >
                                  <LuFolderEdit size={14} className="mr-2" />
                                  <span>Rename</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setFolderId(folder.id);
                                  }}
                                  className="cursor-pointer py-2"
                                >
                                  <PiDownload size={14} className="mr-2" />
                                  <span>Download</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="!text-[0.75rem] font-medium text-[#868e96]">
                                  Danger zone
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setFolderId(folder.id);
                                    deleteFolderOpen();
                                  }}
                                  className="cursor-pointer py-2 text-red-600 hover:!text-red-700"
                                >
                                  <PiTrash size={14} className="mr-2" />
                                  <span className="">Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Modal
                              opened={deleteFolderOpened}
                              onClose={() => {
                                setFolderId("");
                                deleteFolderClose();
                              }}
                              withCloseButton={false}
                              title="Are you sure?"
                              centered
                              closeOnEscape
                            >
                              <div className="pb-4">
                                Do you really want to delete these records?
                              </div>
                              <Group justify="right">
                                <Button
                                  className="border border-white/20 bg-white text-white/20 hover:bg-white"
                                  onClick={() => {
                                    setFolderId("");
                                    deleteFolderClose();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  onClick={() =>
                                    deleteFolder({
                                      id: folderId,
                                    })
                                  }
                                >
                                  Delete
                                </Button>
                              </Group>
                            </Modal>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
            {filteredFiles?.length !== 0 && (
              <div className="flex flex-col gap-4">
                <h2>All Files</h2>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-2 xl:grid-cols-5">
                  {filteredFiles?.map((file, index) => (
                    <button
                      key={index}
                      className="flex cursor-pointer flex-col items-center justify-between gap-4 rounded-md border border-white/40 px-2 py-2 pb-6 hover:bg-white/20 md:px-6"
                      onClick={() => {
                        setDetailsFileId(file.id);
                        setDetailsFolderId("");
                      }}
                      onDoubleClick={() => {
                        setOpenModal(true);
                        setSingleFileData(file);
                      }}
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
                            </DropdownMenuItem>
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
                            <DropdownMenuItem
                              onClick={() => {
                                handleFileDownload({
                                  name: file.name!,
                                  type: file.type!,
                                  downloadUrl: file.url!,
                                });
                              }}
                              className="cursor-pointer py-2"
                            >
                              <PiDownload size={14} className="mr-2" />
                              <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="!text-[0.75rem] font-medium text-[#868e96]">
                              Danger zone
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setFileId(file.id);
                                deleteFileOpen();
                              }}
                              className="cursor-pointer py-2 text-red-600 hover:!text-red-700"
                            >
                              <PiTrash size={14} className="mr-2" />
                              <span className="">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Modal
                          opened={deleteFileOpened}
                          onClose={() => {
                            setFileId("");
                            deleteFileClose();
                          }}
                          withCloseButton={false}
                          title="Are you sure?"
                          centered
                          closeOnEscape
                        >
                          <div className="pb-4">
                            Do you really want to delete these records?
                          </div>
                          <Group justify="right">
                            <Button
                              className="border border-white/20 bg-white text-white/20 hover:bg-white"
                              onClick={() => {
                                setFileId("");
                                deleteFileClose();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() =>
                                deleteOneFile({
                                  id: fileId,
                                })
                              }
                            >
                              Delete
                            </Button>
                          </Group>
                        </Modal>
                      </div>
                      <div className="shrink-0">
                        <GetFileExtension
                          name={file?.name ?? ""}
                          type={file?.type ?? ""}
                          url={file?.url ?? ""}
                        />
                      </div>
                      <div>
                        <p className="text-center text-sm">{file.name}</p>
                        <p className="text-center text-xs font-light">
                          Uploaded {moment(file.createdAt).format("MMM DD")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {detailsFolderId && filesById?.length > 1 && (
              <div
                ref={ref}
                className="sticky bottom-2 left-0 right-0 flex w-full items-end justify-end text-black"
              >
                <div className="z-10 flex w-[276px] flex-col rounded-b-lg border-white/40 bg-black text-xs shadow-lg">
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
              </div>
            )}
          </div>
        )}
      </div>

      <FolderModal
        openFolderModal={openFolderModal}
        setOpenFolderModal={setOpenFolderModal}
        folderForm={folderForm}
        folderId={folderId}
        setFolderId={setFolderId}
      />
      <FileModal
        fileForm={fileForm}
        openFileModal={openFileModal}
        setOpenFileModal={setOpenFileModal}
        fileId={fileId}
        setFileId={setFileId}
        folderData={folderData}
      />
      <RenameFileModal
        fileForm={fileForm}
        openFileModal={openFileRenameModal}
        setOpenFileModal={setOpenFileRenameModal}
        fileId={fileId}
        setFileId={setFileId}
        folderData={folderData}
      />
    </>
  );
};

export default System;

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
