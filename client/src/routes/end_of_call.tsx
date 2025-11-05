import FindRoomButton from "@/components/FindRoomButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Heart, Users } from "lucide-react";

export const Route = createFileRoute("/end_of_call")({
  component: RouteComponent,
});

const maxCallHistoryLength = 5;

function RouteComponent() {
  const router = useRouter();
  const {callSession} = useVideoCallContext();
  console.log("last call session", callSession?.at(-1));

  return (
    <div className="flex flex-1 justify-center items-center w-full h-full bg-gradient-to-br from-background from-30% to-primary">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className=" font-bold text-4xl">
            {(callSession && callSession.at(-1) !== undefined) && (callSession.at(-1)?.unmatched ? (
                "You Have Unmatched"
            ) : (
                `Call Ended!`
            ))}
          </h1>
          <p className="text-muted-foreground">
            {(callSession && callSession.at(-1) !== undefined) && (callSession.at(-1)?.callEndedByUser ? (
                "You ended the call"
            ) : (
                `${callSession?.at(-1)?.otherUser?.name || "Other user"} ended the call`
            ))}
          </p>
        </div>
        <Card className="w-lg">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex flex-col">
              <h3 className="text-center font-semibold text-lg">
              {callSession && callSession.length < maxCallHistoryLength ? (
                "Call again or head back to the Dashboard"
              ) : (
                "That's a lot of calls... Return to the dashboard first"
              )}
              </h3>
            </div>
            <div className="flex items-center gap-2 justify-center">
              {callSession && callSession.length < maxCallHistoryLength && (
                <div className="flex flex-row items-center gap-2">
                <FindRoomButton matchType="friend" label="Find Friends" icon={<Users />} />
                <FindRoomButton matchType="romantic" label="Find Romance" icon={<Heart />} />
                </div>
              )}
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  router.navigate({ to: "/dashboard" });
                }}
                className="flex-row gap-2 items-center"
              >
                Back to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
