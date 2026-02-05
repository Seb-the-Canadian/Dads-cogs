import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type db } from "~/server/db";

async function computeLeagueScores(
  database: typeof db,
  leagueId: string,
): Promise<Map<string, number>> {
  const scores = await database.submission.groupBy({
    by: ["userId"],
    where: {
      round: {
        leagueId,
        status: "COMPLETED",
      },
    },
    _sum: { totalPoints: true },
  });

  return new Map(scores.map((s) => [s.userId, s._sum.totalPoints ?? 0]));
}

export const leagueRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        discordWebhookUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const league = await ctx.db.league.create({
        data: {
          name: input.name,
          slug: input.slug,
          discordWebhookUrl: input.discordWebhookUrl,
          adminId: ctx.session.user.id,
          members: {
            create: {
              userId: ctx.session.user.id,
            },
          },
        },
      });
      return league;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const league = await ctx.db.league.findUnique({
        where: { slug: input.slug },
        include: {
          admin: true,
          members: {
            include: {
              user: true,
            },
          },
          rounds: {
            orderBy: {
              roundNumber: "desc",
            },
          },
        },
      });

      if (!league) return null;

      const scoreMap = await computeLeagueScores(ctx.db, league.id);

      const membersWithScores = league.members
        .map((m) => ({
          ...m,
          totalScore: scoreMap.get(m.userId) ?? 0,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      return { ...league, members: membersWithScores };
    }),

  getMyLeagues: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.leagueMember.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        league: {
          include: {
            admin: true,
          },
        },
      },
    });
    return memberships.map((m) => m.league);
  }),

  join: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const league = await ctx.db.league.findUnique({
        where: { slug: input.slug },
      });

      if (!league) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found",
        });
      }

      try {
        const member = await ctx.db.leagueMember.create({
          data: {
            userId: ctx.session.user.id,
            leagueId: league.id,
          },
        });

        return member;
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code: string }).code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You are already a member of this league",
          });
        }
        throw err;
      }
    }),

  getLeaderboard: publicProcedure
    .input(z.object({ leagueId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.leagueMember.findMany({
        where: {
          leagueId: input.leagueId,
        },
        include: {
          user: true,
        },
      });

      const scoreMap = await computeLeagueScores(ctx.db, input.leagueId);

      return members
        .map((m) => ({
          ...m,
          totalScore: scoreMap.get(m.userId) ?? 0,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);
    }),
});
