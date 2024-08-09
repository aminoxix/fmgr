import { TRPCClientError } from "@trpc/client";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { file, folder } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const fManagerRouter = createTRPCRouter({
  createFolder: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      if (input.parentId) {
        return await ctx.db.insert(folder).values({
          name: input.name,
          createdBy: ctx.session.user.id,
          modification: [
            {
              lastModifiedBy: ctx.session.user.id,
              name: ctx.session.user.name,
              lastModifiedAt: new Date().toTimeString(),
            },
          ],
          parentId: input.parentId,
        });
      } else
        return await ctx.db.insert(folder).values({
          name: input.name,
          createdBy: ctx.session.user.id,
          modification: [
            {
              lastModifiedBy: ctx.session.user.id,
              name: ctx.session.user.name,
              lastModifiedAt: new Date().toTimeString(),
            },
          ],
        });
    }),
  updateFolder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const folderData = await ctx.db.query.folder.findFirst({
        where: (folder, funcs) => funcs.eq(folder.id, input.id),
      });
      const { id, name } = input;
      return await ctx.db
        .update(folder)
        .set({
          name,
          modification: [
            ...(folderData?.modification as {
              lastModifiedBy: string;
              name: string;
              lastModifiedAt: string;
            }[]),
            {
              lastModifiedBy: ctx.session.user.id,
              name: ctx.session.user.name,
              lastModifiedAt: new Date().toTimeString(),
            },
          ],
        })
        .where(eq(folder.id, id));
    }),

  deleteFolder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const { id } = input;
      const folderData = await ctx.db.query.folder.findFirst({
        where: (folder, funcs) => funcs.eq(folder.id, id),
      });
      if (!folderData) throw new TRPCClientError("Folder not found");

      return await ctx.db.delete(folder).where(eq(folder.id, id));
    }),

  getAllFolders: protectedProcedure
    .input(
      z
        .object({
          take: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const take = input?.take ?? 0;
      const data = await ctx.db.query.folder.findMany({
        limit: input?.take ? take + 10 : undefined,
        orderBy: (folder, { desc }) => [desc(folder.createdAt)],
        where: (folder, funcs) =>
          funcs.eq(folder.createdBy, ctx.session.user.id),
      });

      return data as {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        modification: {
          name: string;
          lastModifiedAt: string;
          lastModifiedBy: string;
        }[];
        organizationId: string | null;
        createdBy: string | null;
        parentId: string | null;
      }[];
    }),

  getSingleFolder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const { id } = input;
      const folderData = await ctx.db.query.folder.findFirst({
        where: (folder, funcs) => funcs.eq(folder.id, id),
        with: {
          files: true,
          parent: true,
          children: true,
        },
      });
      return folderData;
    }),

  // File operations
  createFile: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        folderId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const { name, url, type, folderId } = input;
      const folderData = await ctx.db.query.folder.findFirst({
        where: (folder, funcs) => funcs.eq(folder.id, folderId),
      });
      if (!folderData) throw new TRPCClientError("Folder not found");
      await ctx.db.insert(file).values({
        name,
        url,
        type,
        folderId,
        createdBy: ctx.session.user.id,
      });
      if (!file) throw new TRPCClientError("File not found");
      const modifications = Array.isArray(folderData?.modification)
        ? folderData.modification
        : [];
      await ctx.db
        .update(folder)
        .set({
          name: folderData.name,
          modification: [
            ...modifications,
            {
              lastModifiedBy: ctx.session.user.id,
              name: ctx.session.user.name,
              lastModifiedAt: new Date().toTimeString(),
            },
          ],
        })
        .where(eq(folder.id, folderId));

      return {
        message: "File added successfully",
      };
    }),

  deleteOneFile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const { id } = input;
      const fileData = await ctx.db.query.file.findFirst({
        where: (file, funcs) => funcs.eq(file.id, id),
      });
      if (!fileData?.folderId) throw new TRPCClientError("File not found");
      const folderData = await ctx.db.query.folder.findFirst({
        where: (folder, funcs) =>
          funcs.eq(folder.id, String(fileData.folderId)),
      });
      if (!folderData) throw new TRPCClientError("Folder not found");
      await ctx.db.delete(file).where(eq(file.id, id));
      await ctx.db
        .update(folder)
        .set({
          modification: [
            ...(folderData?.modification as {
              lastModifiedBy: string;
              name: string;
              lastModifiedAt: string;
            }[]),
            {
              lastModifiedBy: ctx.session.user.id,
              name: ctx.session.user.name,
              lastModifiedAt: new Date().toTimeString(),
            },
          ],
        })
        .where(eq(folder.id, id));
      return {
        message: "File deleted successfully",
      };
    }),

  deleteMultipleFiles: protectedProcedure
    .input(
      z.object({
        ids: z.string().array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const { ids } = input;
      const files = await ctx.db.query.file.findMany({
        where: (file, funcs) => funcs.inArray(file.id, ids),
        orderBy: (file, { desc }) => [desc(file.createdAt)],
      });
      if (!files) {
        throw new TRPCClientError("Files not found");
      }
      await ctx.db.delete(file).where(inArray(file.id, ids));
      for (const file of files) {
        if (file.folderId) {
          const folderData = await ctx.db.query.folder.findFirst({
            where: (folder, funcs) =>
              funcs.eq(folder.id, String(file.folderId)),
          });
          if (folderData) {
            await ctx.db
              .update(folder)
              .set({
                modification: [
                  ...(folderData?.modification as {
                    lastModifiedBy: string;
                    name: string;
                    lastModifiedAt: string;
                  }[]),
                  {
                    lastModifiedBy: ctx.session.user.id,
                    name: ctx.session.user.name,
                    lastModifiedAt: new Date().toTimeString(),
                  },
                ],
              })
              .where(eq(folder.id, file.folderId));
          }
        }
      }

      return {
        message: "Files deleted successfully",
      };
    }),

  getSingleFile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }

      const { id } = input;
      const fileData = await ctx.db.query.file.findFirst({
        where: (file, funcs) => funcs.eq(file.id, id),
      });

      if (!fileData) {
        throw new TRPCClientError("File not found");
      }

      return fileData;
    }),

  updateFileName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      const { id, name } = input;
      const fileData = await ctx.db.query.file.findFirst({
        where: (file, funcs) => funcs.eq(file.id, id),
      });
      if (!fileData?.folderId) throw new TRPCClientError("File not found");
      const folderData = await ctx.db.query.folder.findFirst({
        where: (folder, funcs) =>
          funcs.eq(folder.id, String(fileData.folderId)),
      });
      if (!folderData) throw new TRPCClientError("Folder not found");
      await ctx.db
        .update(file)
        .set({
          name,
        })
        .where(eq(file.id, id));
      await ctx.db
        .update(folder)
        .set({
          modification: [
            ...(folderData?.modification as {
              lastModifiedBy: string;
              name: string;
              lastModifiedAt: string;
            }[]),
            {
              lastModifiedBy: ctx.session.user.id,
              name: ctx.session.user.name,
              lastModifiedAt: new Date().toTimeString(),
            },
          ],
        })
        .where(eq(folder.id, fileData.folderId));
      return {
        message: "File updated successfully",
      };
    }),

  getAllFiles: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      throw new TRPCClientError("User not found");
    }
    return await ctx.db.query.file.findMany({
      orderBy: (file, { desc }) => [desc(file.createdAt)],
      where: (file, funcs) => funcs.eq(file.createdBy, ctx.session.user.id),
    });
  }),

  getAllFilesOfFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      return await ctx.db.query.file.findMany({
        where: (file, funcs) => funcs.eq(file.folderId, input.folderId),
        orderBy: (file, { desc }) => [desc(file.createdAt)],
      });
    }),

  getMultipleFilesByIds: protectedProcedure
    .input(
      z.object({
        fileIds: z.string().array(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCClientError("User not found");
      }
      return await ctx.db.query.file.findMany({
        where: (file, funcs) => funcs.inArray(file.id, input.fileIds),
        columns: {
          id: true,
          name: true,
          url: true,
          type: true,
        },
        orderBy: (file, { desc }) => [desc(file.createdAt)],
      });
    }),
});
