import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "~/server/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const uploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" },
    audio: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "16MB" },
    "application/msword": { maxFileSize: "4MB" },
    "application/zip": { maxFileSize: "4MB" },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      const session = await getServerAuthSession({ req, res });

      // If you throw, the user will not be able to upload
      if (!session?.user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session?.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      //   console.log("Upload complete for userId:", metadata.userId);

      //   console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadthingRouter;
