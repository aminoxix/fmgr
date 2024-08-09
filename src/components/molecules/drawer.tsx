import React from "react";

import { PiDotsThree, PiFolder } from "react-icons/pi";
import type { SingleFileDataType } from "~/lib/types";
import { api } from "~/utils/api";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import FileDisplay from "../file-details";

const InformationDrawer = ({
  openedInformation,
  setOpenedInformation,
  detailsFolderId,
  ownerId,
  detailsFileId,
  singleFileData,
  openModal,
  setOpenModal,
}: {
  openedInformation: boolean;
  setOpenedInformation: React.Dispatch<React.SetStateAction<boolean>>;
  detailsFolderId: string | null;
  ownerId: string | null;
  detailsFileId: string | null;
  singleFileData: SingleFileDataType;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { data: allFolders } = api.fManager.getAllFolders.useQuery();

  const { data: allUsers } = api.user.getAllUsers.useQuery();

  return (
    <Drawer
      open={openedInformation}
      onClose={() => setOpenedInformation(false)}
      onOpenChange={(opened: boolean) => setOpenedInformation(opened)}
    >
      <DrawerContent>
        <div className="flex shrink-0 flex-col gap-2 px-4 py-4 text-black">
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
                      <Avatar>
                        <AvatarImage
                          src={String(
                            allUsers?.find(
                              (user) => user.id === item?.lastModifiedBy,
                            )?.image ?? "",
                          )}
                          alt={String(
                            allUsers?.find(
                              (user) => user.id === item?.lastModifiedBy,
                            )?.name ?? "",
                          )}
                        />
                        <AvatarFallback>
                          {allUsers
                            ?.find((user) => user.id === item?.lastModifiedBy)
                            ?.name?.charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
      </DrawerContent>
    </Drawer>
  );
};

export default InformationDrawer;
