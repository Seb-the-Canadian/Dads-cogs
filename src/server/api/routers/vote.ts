import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "../../../../generated/prisma";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const voteRouter = createTRPCRouter({
  castVote: protectedProcedure
    .input(
      z.object({
        roundId: z.string(),
        submissionId: z.string(),
        points: z.number().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const round = await ctx.db.round.findUnique({
        where: { id: input.roundId },
      });

      if (!round) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Round not found",
        });
      }

      if (round.status !== "VOTING") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voting is not open for this round",
        });
      }

      const now = new Date();
      if (now < round.votingStart || now > round.votingEnd) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voting period has not started or has ended",
        });
      }

      const submission = await ctx.db.submission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      if (submission.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot vote for your own submission",
        });
      }

      return ctx.db.$transaction(async (tx) => {
        const existingVote = await tx.vote.findUnique({
          where: {
            roundId_userId_submissionId: {
              roundId: input.roundId,
              userId: ctx.session.user.id,
              submissionId: input.submissionId,
            },
          },
        });

        let vote;
        if (existingVote) {
          vote = await tx.vote.update({
            where: { id: existingVote.id },
            data: { points: input.points },
          });
        } else {
          vote = await tx.vote.create({
            data: {
              roundId: input.roundId,
              userId: ctx.session.user.id,
              submissionId: input.submissionId,
              points: input.points,
            },
          });
        }

        await updateSubmissionPoints(tx, input.submissionId);

        return vote;
      });
    }),

  getMyVotes: protectedProcedure
    .input(z.object({ roundId: z.string() }))
    .query(async ({ ctx, input }) => {
      const votes = await ctx.db.vote.findMany({
        where: {
          roundId: input.roundId,
          userId: ctx.session.user.id,
        },
        include: {
          submission: true,
        },
      });
      return votes;
    }),

  finalizeRound: protectedProcedure
    .input(z.object({ roundId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const round = await ctx.db.round.findUnique({
        where: { id: input.roundId },
        include: {
          league: true,
        },
      });

      if (!round) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Round not found",
        });
      }

      if (round.league.adminId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only league admin can finalize rounds",
        });
      }

      const updated = await ctx.db.round.update({
        where: { id: input.roundId },
        data: { status: "COMPLETED" },
      });

      return updated;
    }),
});

async function updateSubmissionPoints(
  tx: Prisma.TransactionClient,
  submissionId: string,
): Promise<void> {
  const votes = await tx.vote.findMany({
    where: { submissionId },
  });

  const totalPoints = votes.reduce(
    (sum: number, vote: { points: number }) => sum + vote.points,
    0,
  );

  await tx.submission.update({
    where: { id: submissionId },
    data: { totalPoints },
  });
}
