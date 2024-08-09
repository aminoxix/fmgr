import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// const handleFileDownload = ({
//   downloadUrl,
//   type,
//   name,
// }: {
//   downloadUrl: string;
//   type: string;
//   name: string;
// }) => {
//   if (downloadUrl && name) {
//     if (type.includes("image")) {
//       saveAs(downloadUrl, `${name}.${downloadUrl.split(".").pop()}`);
//     } else if (
//       type === "application/zip" ||
//       type === "text/plain" ||
//       type === "application/pdf"
//     ) {
//       const a = document.createElement("a");
//       a.href = downloadUrl;
//       a.download = `a.${
//         type === "application/zip"
//           ? "zip"
//           : type === "text/plain"
//             ? "txt"
//             : type === "application/pdf"
//               ? "pdf"
//               : ""
//       }`;
//       a.target = "_blank";
//       document.body.appendChild(a);
//       a.click();
//     } else {
//       saveAs(downloadUrl, `${name}`);
//     }
//   } else {
//     console.error("downloadUrl or name is not defined.");
//   }
// };
