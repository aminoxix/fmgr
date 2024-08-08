import React from "react";
import { api } from "~/utils/api";

import { type UseFormReturnType } from "@mantine/form";
import { useToast } from "~/components/ui/use-toast";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const FolderModal = ({
  parentId,
  folderId,
  folderForm,
  setFolderId,
  openFolderModal,
  setOpenFolderModal,
}: {
  parentId?: string;
  openFolderModal: boolean;
  setOpenFolderModal: React.Dispatch<React.SetStateAction<boolean>>;
  folderForm: UseFormReturnType<
    {
      name: string;
    },
    (values: { name: string }) => {
      name: string;
    }
  >;
  folderId: string;
  setFolderId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { toast } = useToast();

  const { refetch: refetchFolders } = api.fManager.getAllFolders.useQuery();
  const { refetch: refetchSingleFolder } =
    api.fManager.getSingleFolder.useQuery(
      {
        id: parentId!,
      },
      {
        enabled: !!parentId,
      },
    );

  //  Do not remove this line. This is used to update the user's general flow detail
  const { mutate: createFolder } = api.fManager.createFolder.useMutation({
    onSuccess: () => {
      toast({
        title: "Folder created",
        description: "Folder has been created successfully!",
      });
      folderForm.reset();
      setOpenFolderModal(false);
      void refetchFolders();
      void refetchSingleFolder();
    },
    onError: (error) => {
      toast({
        title: "Failed to create folder",
        description: `Error creating folder: ${error.message}`,
      });
    },
  });

  const { mutate: updateFolder } = api.fManager.updateFolder.useMutation({
    onSuccess: () => {
      toast({
        title: "Folder updated",
        description: "Folder has been updated successfully!",
      });
      folderForm.reset();
      setOpenFolderModal(false);
      setFolderId("");
      void refetchFolders();
      void refetchSingleFolder();
    },
    onError: (error) => {
      toast({
        title: "Failed to update folder",
        description: `Error updating folder: ${error.message}`,
      });
    },
  });

  return (
    <Dialog
      open={openFolderModal}
      onOpenChange={() => {
        setFolderId("");
        setOpenFolderModal(false);
      }}
    >
      <DialogContent className="max-w-[300px] rounded-md md:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{folderId ? "Update" : "Create New"} Folder</DialogTitle>
        </DialogHeader>
        <form className="flex w-full flex-col gap-2">
          <Label>Name</Label>
          <Input
            {...folderForm.getInputProps("name")}
            onChange={(event) => {
              folderForm.setFieldValue("name", event.currentTarget.value);
            }}
            placeholder="Enter Folder Name"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
          />
          <DialogFooter className="pt-4">
            <Button
              variant="default"
              onClick={(e) => {
                e.preventDefault();
                folderId
                  ? updateFolder({
                      id: folderId,
                      name: folderForm.values.name,
                    })
                  : createFolder({
                      name: folderForm.values.name,
                      parentId,
                    });
              }}
              disabled={!folderForm.isValid()}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FolderModal;
