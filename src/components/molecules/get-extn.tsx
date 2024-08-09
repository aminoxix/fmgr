import Image from "next/image";
import {
  PiFileAudio,
  PiFileDoc,
  PiFilePdf,
  PiFilePng,
  PiFileTxt,
  PiFileZip,
  PiVideo,
} from "react-icons/pi";

export function GetFileExtension({
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
