import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import { type uploadthingRouter } from "~/server/api/routers/uploadthing";

type UploadThingRouter = typeof uploadthingRouter;

export const UploadButton = generateUploadButton<UploadThingRouter>();
export const UploadDropzone = generateUploadDropzone<UploadThingRouter>();
