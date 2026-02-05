import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { addTracksToPlaylist } from "~/server/spotify";

export const submissionRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        roundId: z.string(),
        spotifyTrackId: z.string(),
        trackName: z.string(),
        artistName: z.string(),
        albumArt: z.string().optional(),
        previewUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const round = await ctx.db.round.findUnique({
        where: { id: input.roundId },
      });

      if (!round) {
        throw new Error("Round not found");
      }

      if (round.status !== "SUBMISSION") {
        throw new Error("Submissions are not open for this round");
      }

      const now = new Date();
      if (now < round.submissionStart || now > round.submissionEnd) {
        throw new Error("Submission period has not started or has ended");
      }

      const existingSubmission = await ctx.db.submission.findUnique({
        where: {
          roundId_userId: {
            roundId: input.roundId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingSubmission) {
        const updated = await ctx.db.submission.update({
          where: { id: existingSubmission.id },
          data: {
            spotifyTrackId: input.spotifyTrackId,
            trackName: input.trackName,
            artistName: input.artistName,
            albumArt: input.albumArt,
            previewUrl: input.previewUrl,
          },
        });
        return updated;
      }

      const submission = await ctx.db.submission.create({
        data: {
          roundId: input.roundId,
          userId: ctx.session.user.id,
          spotifyTrackId: input.spotifyTrackId,
          trackName: input.trackName,
          artistName: input.artistName,
          albumArt: input.albumArt,
          previewUrl: input.previewUrl,
        },
      });

      await addTracksToPlaylist(input.roundId, [input.spotifyTrackId]);

      return submission;
    }),

  getMySubmission: protectedProcedure
    .input(z.object({ roundId: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findUnique({
        where: {
          roundId_userId: {
            roundId: input.roundId,
            userId: ctx.session.user.id,
          },
        },
      });
      return submission;
    }),

  getByRound: protectedProcedure
    .input(z.object({ roundId: z.string() }))
    .query(async ({ ctx, input }) => {
      const round = await ctx.db.round.findUnique({
        where: { id: input.roundId },
      });

      if (!round) {
        throw new Error("Round not found");
      }

      const submissions = await ctx.db.submission.findMany({
        where: { roundId: input.roundId },
        include: {
          user: round.status === "COMPLETED",
          votes: true,
        },
      });

      return submissions.map((submission) => ({
        ...submission,
        user: round.status === "COMPLETED" ? submission.user : null,
      }));
    }),
});
