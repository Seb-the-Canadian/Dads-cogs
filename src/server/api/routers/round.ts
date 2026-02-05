import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { createRoundPlaylist } from "~/server/spotify";
import { RoundStatus } from "@prisma/client";

export const roundRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        leagueId: z.string(),
        theme: z.string().optional(),
        description: z.string().optional(),
        submissionStart: z.date(),
        submissionEnd: z.date(),
        votingStart: z.date(),
        votingEnd: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const league = await ctx.db.league.findUnique({
        where: { id: input.leagueId },
      });

      if (!league) {
        throw new Error("League not found");
      }

      if (league.adminId !== ctx.session.user.id) {
        throw new Error("Only league admin can create rounds");
      }

      const lastRound = await ctx.db.round.findFirst({
        where: { leagueId: input.leagueId },
        orderBy: { roundNumber: "desc" },
      });

      const roundNumber = (lastRound?.roundNumber ?? 0) + 1;

      const round = await ctx.db.round.create({
        data: {
          leagueId: input.leagueId,
          roundNumber,
          theme: input.theme,
          description: input.description,
          submissionStart: input.submissionStart,
          submissionEnd: input.submissionEnd,
          votingStart: input.votingStart,
          votingEnd: input.votingEnd,
        },
      });

      await createRoundPlaylist(round.id);

      return round;
    }),

  getByLeague: publicProcedure
    .input(z.object({ leagueId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rounds = await ctx.db.round.findMany({
        where: { leagueId: input.leagueId },
        orderBy: { roundNumber: "desc" },
      });
      return rounds;
    }),

  getById: publicProcedure
    .input(z.object({ roundId: z.string() }))
    .query(async ({ ctx, input }) => {
      const round = await ctx.db.round.findUnique({
        where: { id: input.roundId },
        include: {
          league: true,
          submissions: {
            include: {
              user: true,
              votes: true,
            },
          },
        },
      });
      return round;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        roundId: z.string(),
        status: z.nativeEnum(RoundStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const round = await ctx.db.round.findUnique({
        where: { id: input.roundId },
        include: { league: true },
      });

      if (!round) {
        throw new Error("Round not found");
      }

      if (round.league.adminId !== ctx.session.user.id) {
        throw new Error("Only league admin can update round status");
      }

      const updatedRound = await ctx.db.round.update({
        where: { id: input.roundId },
        data: { status: input.status },
      });

      return updatedRound;
    }),
});
