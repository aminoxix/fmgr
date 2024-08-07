import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import { type uploadthingRouter } from "../server/api/routers/uploadthing";

type UploadThingRouter = typeof uploadthingRouter;

export const UploadButton = generateUploadButton<UploadThingRouter>();
export const UploadDropzone = generateUploadDropzone<UploadThingRouter>();
