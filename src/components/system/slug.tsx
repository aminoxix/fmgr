import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import moment from "moment";
import { api, type RouterOutputs } from "~/utils/api";

import { Avatar, Button, Drawer, Group, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { LuFolderEdit } from "react-icons/lu";

import Image from "next/image";
import type { JSONValue } from "postgres";
import {
    PiArrowLeft,
    PiDotsThree,
    PiDownload,
    PiEye,
    PiFileAudio,
    PiFileDoc,
    PiFilePdf,
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

  const { data: allFolders, refetch: refetchFolders } =
    api.fManager.getAllFolders.useQuery();
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
      deleteFolderClose();
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

  const isScreenSizeGreaterThan768px = useMediaQuery("(min-width: 768px)");

  useMemo(() => {
    if (isScreenSizeGreaterThan768px) {
      informationClose();
    }
  }, [informationClose, isScreenSizeGreaterThan768px]);

  return (
    <>
      {/* <button
        onClick={informationOpen}
        className="absolute right-0 top-3/4 z-10 flex h-10 w-10 items-center rounded-l-md bg-white px-2 py-2.5 md:top-[90%] xl:hidden"
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
        <div className="flex shrink-0 flex-col gap-2 px-7 py-4 md:w-[276px] 2xl:w-[376px]">
          <p className="text-center text-xl font-semibold">Information</p>
          {detailsFolderId ? (
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
          ) : (
            <div className="flex justify-center gap-1">
              Click <PiDotsThree /> to see the details of folder
            </div>
          )}
        </div>
      </Drawer>

      {/* <div className="flex shrink-0 flex-col gap-2 px-7 py-4">
              <p className="text-center text-xl font-semibold">Information</p>
              {detailsFolderId ? (
                <div className="flex w-full flex-col items-center gap-7">
                  <div className="flex flex-col items-center gap-2">
                    <Folder42Icon />
                    <p className="font-semibold">
                      {
                        allFolders?.find(
                          (folder) => folder.id === detailsFolderId,
                        )?.name
                      }
                    </p>
                    <div className="flex gap-1 text-sm">
                      <p className="font-semibold">Owner:</p>
                      {allUsers?.users?.find((user) => user.id === ownerId)
                        ?.name ??
                        allUsers?.users?.find((user) => user.id === ownerId)
                          ?.email ??
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
                              allUsers?.users?.find(
                                (user) => user.id === item?.lastModifiedBy,
                              )?.image ?? ""
                            }
                            radius="50%"
                          />
                          <div className="flex flex-col">
                            <p className="text-xs font-thin">
                              Last modified by
                            </p>
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
              ) : (
                <div className="flex justify-center gap-1">
                  Click <TbDots /> to see the details of folder
                </div>
              )}
            </div> */}
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
      <div className="flex w-full flex-col gap-8 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PiArrowLeft
              className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-white/40 p-1 hover:bg-white/20"
              onClick={() => void router.back()}
            />
            <div className="flex items-center gap-2">
              <Input
                className="w-auto border border-white/40 md:w-1/3"
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
            <Button
              disabled={allFolders?.length === 0}
              onClick={() => {
                setFileId("");
                fileForm.reset();
                setDetailsFileId("");
                setOpenFileModal(true);
              }}
              className="h-[34px] w-auto rounded border-white/40 bg-white/20 hover:border hover:bg-transparent md:w-40"
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
                        onClick={() => {
                          setDetailsFolderId(folder.id);
                          setDetailsFileId("");
                        }}
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
                                    `${location.pathname}/${folder.id}`,
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
                                  setDetailsFileId("");
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
                                <LuFolderEdit size={14} className="mr-2" />{" "}
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setFolderId(folder.id)}
                              >
                                <PiDownload size={14} className="mr-2" />{" "}
                                Download
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setFolderId(folder.id);
                                  deleteFolderOpen();
                                }}
                                className="cursor-pointer py-2 text-red-600 hover:!text-red-700"
                              >
                                <PiTrash size={14} className="mr-2" /> Delete
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
                                className="border border-white/40 bg-white text-white/40 hover:bg-white"
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
                              className="border border-white/40 bg-white text-white/40 hover:bg-white"
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
              </div>
            )}
          </>
        )}
      </div>
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
