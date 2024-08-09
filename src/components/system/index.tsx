import { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { api } from "~/utils/api";

import { useForm } from "@mantine/form";
import { useClickOutside } from "@mantine/hooks";

import { LuLoader2 } from "react-icons/lu";
import { PiFile } from "react-icons/pi";

import FileModal, { RenameFileModal } from "../molecules/modals/file";
import FolderModal from "../molecules/modals/folder";

import { useToast } from "../ui/use-toast";

import type { SingleFileDataType } from "~/lib/types";
import FilesTable from "../files-table";
import InitialUI from "../initials";

import InformationDrawer from "../molecules/drawer";
import SystemFiles from "../molecules/files";
import Folders from "../molecules/folders";
import SystemHeader from "../molecules/header";

const System = () => {
  const zip = new JSZip();
  const { toast } = useToast();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openFolderModal, setOpenFolderModal] = useState<boolean>(false);
  const [openFileModal, setOpenFileModal] = useState<boolean>(false);
  const [openFileRenameModal, setOpenFileRenameModal] =
    useState<boolean>(false);
  const [deleteFolderOpened, setDeleteFolderOpened] = useState<boolean>(false);
  const [deleteFileOpened, setDeleteFileOpened] = useState<boolean>(false);
  const [openedInformation, setOpenedInformation] = useState<boolean>(false);

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
  const [singleFileData, setSingleFileData] = useState<SingleFileDataType>({
    id: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: null,
    url: null,
    type: null,
    createdBy: null,
    folderId: null,
  });

  const {
    data: allFolders,
    refetch: refetchFolders,
    isPending,
  } = api.fManager.getAllFolders.useQuery();
  const { data: allFiles } = api.fManager.getAllFiles.useQuery();

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

  useEffect(() => {
    if (detailsFileId || detailsFolderId) {
      setOpenedInformation(true);
    }
  }, [detailsFileId, detailsFolderId]);

  return (
    <>
      <InformationDrawer
        openedInformation={openedInformation}
        setOpenedInformation={setOpenedInformation}
        detailsFolderId={detailsFolderId}
        ownerId={ownerId}
        detailsFileId={detailsFileId}
        singleFileData={singleFileData}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />

      {isPending ? (
        <LuLoader2 className="h-6 w-6 animate-spin" color="#fff" />
      ) : (
        <div className="flex w-full flex-col gap-8 md:p-4">
          <SystemHeader
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            isTable={isTable}
            setIsTable={setIsTable}
            setOpenFolderModal={setOpenFolderModal}
            folderForm={folderForm}
            setFileId={setFileId}
            fileForm={fileForm}
            setOpenFileModal={setOpenFileModal}
            selectedRowIds={selectedRowIds}
            setSelectedRowIds={setSelectedRowIds}
            setDeleteFileOpened={setDeleteFileOpened}
            setDeleteFolderOpened={setDeleteFolderOpened}
            deleteFolderOpened={deleteFolderOpened}
          />

          {filteredFolders.length > 0 ? (
            <>
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
                      <Folders
                        filteredFolders={filteredFolders}
                        setDetailsFolderId={setDetailsFolderId}
                        setDetailsFileId={setDetailsFileId}
                        setOpenFolderModal={setOpenFolderModal}
                        setFolderId={setFolderId}
                        folderId={folderId}
                        setDeleteFolderOpened={setDeleteFolderOpened}
                        deleteFolderOpened={deleteFolderOpened}
                      />
                    </div>
                  )}
                  {filteredFiles?.length !== 0 && (
                    <div className="flex flex-col gap-4">
                      <h2>All Files</h2>
                      <SystemFiles
                        filteredFiles={filteredFiles}
                        setDetailsFileId={setDetailsFileId}
                        fileId={fileId}
                        setFileId={setFileId}
                        deleteFileOpened={deleteFileOpened}
                        setDeleteFileOpened={setDeleteFileOpened}
                        setDetailsFolderId={setDetailsFolderId}
                        setSingleFileData={setSingleFileData}
                        setOpenModal={setOpenModal}
                        setOpenFileRenameModal={setOpenFileRenameModal}
                      />
                    </div>
                  )}

                  {detailsFolderId && filesById?.length > 1 && (
                    <div
                      ref={ref}
                      className="sticky bottom-2 left-0 right-0 flex w-full items-end justify-end text-black"
                    >
                      <div className="z-10 flex w-[276px] flex-col rounded-b-lg border-white/40 text-xs shadow-lg">
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
            </>
          ) : (
            <InitialUI />
          )}
        </div>
      )}

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
