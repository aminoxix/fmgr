import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (user, funcs) => funcs.eq(user.id, input.id),
      });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.query.users.findMany();
    return users;
  }),
});
