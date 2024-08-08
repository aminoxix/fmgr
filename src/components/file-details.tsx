/* eslint-disable @typescript-eslint/prefer-string-starts-ends-with */
import { Button, Modal } from "@mantine/core";
import { saveAs } from "file-saver";
import moment from "moment";
import Image from "next/image";
import React from "react";
import {
  PiFileAudio,
  PiFileDoc,
  PiFilePdf,
  PiFilePng,
  PiFileTxt,
  PiFileZip,
  PiVideo,
} from "react-icons/pi";
import { TbDownload, TbEye } from "react-icons/tb";
import { api } from "~/utils/api";

const FileDetails: React.FC<{
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  fileTypeIcon?: React.ReactNode;
  type: string[];
  name: string | null;
  createdAt: Date | null;
  createdBy: string | null;
  url: string | null;
}> = ({
  openModal,
  setOpenModal,
  fileTypeIcon,
  type,
  name,
  createdAt,
  createdBy,
  url,
}) => {
  const handleFileDownload = ({
    downloadUrl,
    type,
    name,
  }: {
    downloadUrl: string;
    type: string;
    name: string;
  }) => {
    if (downloadUrl && name && type) {
      if (type[0]?.includes("image")) {
        saveAs(downloadUrl, `${name}.${downloadUrl.split(".").pop()}`);
      } else if (type[1]?.includes("document")) {
        saveAs(downloadUrl, `${name}.docx`);
      } else if (
        type[1] === "application/zip" ||
        type[1] === "text/plain" ||
        type[1] === "application/pdf"
      ) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `a.${
          type[1] === "application/zip"
            ? "zip"
            : type[1] === "text/plain"
              ? "txt"
              : type[1] === "application/pdf"
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
      console.error("downloadUrl, name or type is not defined.");
    }
  };
  return (
    <>
      <Modal
        opened={openModal}
        closeOnEscape
        fullScreen
        onClose={() => setOpenModal(false)}
      >
        {type?.[1]?.includes("document") ? (
          <iframe
            src={`http://view.officeapps.live.com/op/view.aspx?src=${url}`}
            height={750}
            className="w-full overflow-scroll"
          ></iframe>
        ) : type && type[1] === "application/pdf" ? (
          <iframe
            src={`https://docs.google.com/gview?url=${url}&embedded=true`}
            height={750}
            className="w-full overflow-scroll"
          ></iframe>
        ) : type && type[1] === "video/mp4" ? (
          <div className="flex w-full items-center justify-center">
            <video controls>
              <source src={url!} type="video/mp4" />
            </video>
          </div>
        ) : type?.[1]?.includes("audio") ? (
          <div className="flex w-full items-center justify-center">
            <audio controls>
              <source src={url!} />
            </audio>
          </div>
        ) : type &&
          type[0]?.includes("image") &&
          (url?.split(".").pop()?.toLowerCase() === "png" ||
            url?.split(".").pop()?.toLowerCase() === "jpg" ||
            url?.split(".").pop()?.toLowerCase() === "jpeg") ? (
          <div className="flex w-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url || ""} alt={name!} className="h-full w-auto" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {fileTypeIcon && fileTypeIcon}
            <div className="flex flex-col items-center gap-2">
              <div>{name}</div>
              <div className="text-xs">
                Uploaded at {moment(createdAt).format("MMM DD")}
              </div>
              <div className="text-xs">
                <b>Created by: </b>
                {createdBy}
              </div>
            </div>
            <Button
              className="bg-white/20"
              onClick={() =>
                handleFileDownload({
                  downloadUrl: url!,
                  name: name!,
                  type: type[1]!,
                })
              }
            >
              <div className="flex items-center gap-2">
                <TbDownload className="w5 h-5" /> Download
              </div>
            </Button>
          </div>
        )}
      </Modal>
      <div className="flex flex-col items-center gap-5">
        {fileTypeIcon && fileTypeIcon}
        <div className="flex flex-col items-center gap-2">
          <div>{name}</div>
          <div className="text-xs">
            Uploaded at {moment(createdAt).format("MMM DD")}
          </div>
          <div className="text-xs">
            <b>Created by: </b>
            {createdBy}
          </div>
        </div>

        {type &&
          type[1]?.includes("image") &&
          //  eslint-disable-next-line @next/next/no-img-element
          (url?.split(".").pop()?.toLowerCase() === "png" ||
          url?.split(".").pop()?.toLowerCase() === "jpg" ||
          url?.split(".").pop()?.toLowerCase() === "jpeg" ? (
            <img src={url || ""} alt={name!} />
          ) : (
            <PiFilePng className="h-[54px] w-[54px]" />
          ))}

        {url && (
          <div className="flex justify-between gap-4">
            {type &&
              (type[1]?.includes("document") ??
                type[1] === "application/pdf") && (
                <Button
                  className="bg-custom-dark-blue"
                  onClick={() => setOpenModal(true)}
                >
                  <div className="flex items-center gap-2">
                    <TbEye />
                    Open
                  </div>
                </Button>
              )}
            {type && type[1] === "video/mp4" ? (
              <video controls>
                <source src={url || ""} type="video/mp4" />
              </video>
            ) : type?.[1]?.includes("audio") ? (
              <audio controls>
                <source src={url || ""} />
              </audio>
            ) : (
              <Button
                className="bg-white/20"
                onClick={() =>
                  handleFileDownload({
                    downloadUrl: url,
                    name: name!,
                    type: type[1]!,
                  })
                }
              >
                <div className="flex items-center gap-2">
                  <TbDownload className="w5 h-5" /> Download
                </div>
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

interface FileData {
  id: string;
  createdAt: Date | null;
  name: string | null;
  url: string | null;
  type: string | null;
  createdBy: string | null;
  folderId: string | null;
}

const FileDisplay: React.FC<{
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  singleFileData: FileData;
}> = ({ singleFileData, openModal, setOpenModal }) => {
  const { data: allUsers } = api.user.getAllUsers.useQuery();
  const type = singleFileData.type!;

  return (
    <FileDetails
      openModal={openModal}
      setOpenModal={setOpenModal}
      fileTypeIcon={
        <GetFileExtension
          name={singleFileData.name!}
          type={singleFileData.type!}
          url={singleFileData.url!}
        />
      }
      type={fileExtension(type)}
      name={singleFileData.name}
      createdAt={singleFileData.createdAt}
      createdBy={
        allUsers?.find((user) => user.id === singleFileData.createdBy)?.name ??
        allUsers?.find((user) => user.id === singleFileData.createdBy)?.email ??
        "Unknown"
      }
      url={singleFileData.url}
    />
  );
};

export default FileDisplay;

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
      {type?.includes("image") ? (
        <Image
          src={url}
          alt={name}
          width="150"
          height="150"
          className="rounded"
        />
      ) : type?.includes("pdf") ? (
        <PiFilePdf width="150" height="150" className="h-24 w-24" />
      ) : type?.includes("audio") ? (
        <PiFileAudio width="150" height="150" className="h-24 w-24" />
      ) : type?.includes("video") ? (
        <PiVideo width="150" height="150" className="h-24 w-24" />
      ) : type?.includes("text") ? (
        <PiFileTxt width="150" height="150" className="h-24 w-24" />
      ) : type?.includes("zip") ? (
        <PiFileZip width="150" height="150" className="h-24 w-24" />
      ) : type?.includes("document") ? (
        <PiFileDoc width="150" height="150" className="h-24 w-24" />
      ) : type?.includes("png") ? (
        <PiFilePng width="150" height="150" className="h-24 w-24" />
      ) : null}
    </div>
  );
}

const fileExtension = (type: string) => {
  const fileExtension = type?.split("/");
  return fileExtension;
};
