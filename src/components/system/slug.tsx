import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { api, type RouterOutputs } from "~/utils/api";

import { useForm } from "@mantine/form";

import type { JSONValue } from "postgres";
import InitialUI from "../initials";

import { LuLoader2 } from "react-icons/lu";

import FilesTable from "~/components/files-table";
import FileModal, { RenameFileModal } from "~/components/molecules/modals/file";
import FolderModal from "~/components/molecules/modals/folder";
import { useToast } from "~/components/ui/use-toast";

import InformationDrawer from "../molecules/drawer";
import SystemFiles from "../molecules/files";
import Folders from "../molecules/folders";
import SystemHeader from "../molecules/header";

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
    createdAt: Date;
    updatedAt: Date;
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

  const { data: allFolders, isPending } = api.fManager.getAllFolders.useQuery();
  const { data: singleFolder } = api.fManager.getSingleFolder.useQuery(
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

          {Number(filteredFolders?.length) > 0 ||
          Number(filteredFiles?.length) > 0 ? (
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
                      <Folders
                        id={id}
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
                      <h1>Files</h1>
                      <SystemFiles
                        id={id}
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
