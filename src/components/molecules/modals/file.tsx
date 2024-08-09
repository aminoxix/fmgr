import React from "react";

import { type UseFormReturnType } from "@mantine/form";
import { useToast } from "~/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";

import Image from "next/image";
import { UploadButton } from "~/components/atoms/buttons/uploadthing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const FileModal = ({
  id,
  fileForm,
  openFileModal,
  setOpenFileModal,
  fileId,
  setFileId,
  folderData,
}: {
  id?: string;
  fileForm: UseFormReturnType<
    {
      name: string;
      url: string;
      type: string;
      folderId: string;
    },
    (values: { name: string; url: string; type: string; folderId: string }) => {
      name: string;
      url: string;
      type: string;
      folderId: string;
    }
  >;
  openFileModal: boolean;
  setOpenFileModal: React.Dispatch<React.SetStateAction<boolean>>;
  fileId: string;
  setFileId: React.Dispatch<React.SetStateAction<string>>;
  folderData: {
    label: string;
    value: string;
  }[];
  selectedFilesType?: string;
}) => {
  const { toast } = useToast();

  const { refetch: refetchFiles } = api.fManager.getAllFiles.useQuery();
  const { refetch: refetchFilesOfFolder } =
    api.fManager.getAllFilesOfFolder.useQuery(
      {
        folderId: id!,
      },
      {
        enabled: !!id,
      },
    );

  const url = fileForm.values.url;
  const type = fileForm.values.type;

  const { mutate: addOneFile, isPending } = api.fManager.createFile.useMutation(
    {
      onSuccess: () => {
        toast({
          title: "File added",
          description: "File has been added successfully!",
          color: "green",
        });
        fileForm.reset();
        setOpenFileModal(false);
        void refetchFiles();
        void refetchFilesOfFolder();
      },
      onError: (error) => {
        toast({
          title: "Failed to add file",
          description: `Error adding file: ${error.message}`,
          color: "red",
        });
      },
    },
  );

  return (
    <Dialog
      open={openFileModal}
      onOpenChange={() => {
        setFileId("");
        setOpenFileModal(false);
      }}
    >
      <DialogContent className="max-w-[300px] rounded-md md:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <form className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-2">
            <Label>Name</Label>
            <Input
              {...fileForm.getInputProps("name")}
              onChange={(event) => {
                fileForm.setFieldValue("name", event.currentTarget.value);
              }}
              placeholder="Enter File Name"
            />
          </div>
          {!id && (
            <div className="flex w-full flex-col gap-2">
              <Label>Folder</Label>
              <Select
                {...fileForm.getInputProps("folderId")}
                onValueChange={(value) => {
                  fileForm.setFieldValue("folderId", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Folder" />
                </SelectTrigger>
                <SelectContent>
                  {folderData.map((folder) => (
                    <SelectItem key={folder.value} value={folder.value}>
                      {folder.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {fileForm.values.url ? (
            <Image
              src={fileForm.values.url}
              alt={fileForm.values.name}
              width={150}
              height={150}
            />
          ) : (
            <UploadButton
              endpoint="imageUploader"
              config={{
                mode: "auto",
              }}
              appearance={{
                button: ({ isUploading }) =>
                  `ut-ready:bg-yellow-300 ut-uploading:cursor-not-allowed rounded bg-white/20 bg-none after:bg-yellow-300 ${isUploading ? "text-yellow-300" : "text-black"}`,
                container: () => "mt-4 flex w-full h-full",
              }}
              onClientUploadComplete={(res) => {
                // Do something with the response
                fileForm.setFieldValue("type", res[0]?.type ?? "");
                fileForm.setFieldValue("url", res[0]?.url ?? "");
              }}
              onUploadError={(error: Error) => {
                // Do something with the error.
                console.error(`ERROR! ${error.message}`);
                toast({
                  title: "Failed to upload file",
                  description: `Error uploading file: ${error.message}`,
                });
              }}
            />
          )}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="default"
              onClick={() => {
                url
                  ? addOneFile({
                      url,
                      type,
                      name: fileForm.values.name,
                      folderId: id ? id : fileForm.values.folderId,
                    })
                  : null;
              }}
              disabled={!fileForm.isValid() || isPending}
              className={isPending ? "cursor-wait" : ""}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FileModal;

export const RenameFileModal = ({
  id,
  fileForm,
  openFileModal,
  setOpenFileModal,
  fileId,
  setFileId,
  folderData,
}: {
  id?: string;
  fileForm: UseFormReturnType<
    {
      name: string;
      url: string;
      type: string;
      folderId: string;
    },
    (values: { name: string; url: string; type: string; folderId: string }) => {
      name: string;
      url: string;
      type: string;
      folderId: string;
    }
  >;
  openFileModal: boolean;
  setOpenFileModal: React.Dispatch<React.SetStateAction<boolean>>;
  fileId: string;
  setFileId: React.Dispatch<React.SetStateAction<string>>;
  folderData: {
    label: string;
    value: string;
  }[];
}) => {
  const { toast } = useToast();

  const { refetch: refetchFiles } = api.fManager.getAllFiles.useQuery();
  const { refetch: refetchFilesOfFolder } =
    api.fManager.getAllFilesOfFolder.useQuery(
      {
        folderId: id!,
      },
      {
        enabled: !!id,
      },
    );

  const { mutate: updateFileName, isPending } =
    api.fManager.updateFileName.useMutation({
      onSuccess: () => {
        toast({
          title: "File updated",
          description: "File has been updated successfully!",
        });
        fileForm.reset();
        setOpenFileModal(false);
        setFileId("");
        void refetchFiles();
        void refetchFilesOfFolder();
      },
      onError: (error) => {
        toast({
          title: "Failed to update file",
          description: `Error updating file: ${error.message}`,
        });
      },
    });

  return (
    <Dialog
      open={openFileModal}
      onOpenChange={() => {
        setFileId("");
        setOpenFileModal(false);
      }}
    >
      <DialogContent className="max-w-[300px] rounded-md md:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update File</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-2">
            <Label>Name</Label>
            <Input
              {...fileForm.getInputProps("name")}
              onChange={(event) => {
                fileForm.setFieldValue("name", event.currentTarget.value);
              }}
              placeholder="Enter File Name"
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Label>Folder</Label>
            <Select
              {...fileForm.getInputProps("folderId")}
              onValueChange={(value) => {
                fileForm.setFieldValue("folderId", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Folder" />
              </SelectTrigger>
              <SelectContent>
                {folderData.map((folder) => (
                  <SelectItem key={folder.value} value={folder.value}>
                    {folder.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="default"
              onClick={(e) => {
                e.preventDefault();
                fileId &&
                  updateFileName({
                    id: fileId,
                    name: fileForm.values.name,
                  });
              }}
              disabled={!fileForm.isValid() || isPending}
              className={isPending ? "cursor-wait" : ""}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
