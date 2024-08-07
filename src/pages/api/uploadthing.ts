import { createRouteHandler } from "uploadthing/next-legacy";
import { uploadthingRouter } from "~/server/api/routers/uploadthing";

export default createRouteHandler({
  router: uploadthingRouter,
});
