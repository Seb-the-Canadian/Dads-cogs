import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface LeaderboardEntry {
  id: string;
  userId: string;
  totalScore: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SeasonLeaderboardProps {
  members: LeaderboardEntry[];
}

export function SeasonLeaderboard({ members }: SeasonLeaderboardProps) {
  const getRankDisplay = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Rank</TableHead>
              <TableHead>Dad</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {getRankDisplay(index)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={member.user.image ?? undefined}
                        alt={member.user.name ?? "User"}
                      />
                      <AvatarFallback>
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {member.user.name ?? "Anonymous"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-2xl font-bold">
                    {member.totalScore}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="flex flex-col gap-3 md:hidden">
        {members.map((member, index) => (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-bold">
                  {getRankDisplay(index)}
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={member.user.image ?? undefined}
                    alt={member.user.name ?? "User"}
                  />
                  <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.user.name ?? "Anonymous"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{member.totalScore}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
