import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { leagueRouter } from "./routers/league";
import { roundRouter } from "./routers/round";
import { submissionRouter } from "./routers/submission";
import { voteRouter } from "./routers/vote";

export const appRouter = createTRPCRouter({
  league: leagueRouter,
  round: roundRouter,
  submission: submissionRouter,
  vote: voteRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
