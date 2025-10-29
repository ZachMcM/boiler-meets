import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/banned")({
  beforeLoad: async ({ context }) => {
    if (!context.currentUserData?.user.isBanned) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-secondary flex justify-center items-center">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="default">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>You have ban banned!</EmptyTitle>
          <EmptyDescription>
            You have been banned for violating Boilermeets rules.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
