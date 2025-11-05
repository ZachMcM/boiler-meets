import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register_waiting")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUserData } = authClient.useSession();

  console.log(JSON.stringify(currentUserData))

  return (
    <div className="flex flex-1 justify-center items-center w-full h-full bg-gradient-to-br from-background from-30% to-primary">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className=" text-primary font-bold text-4xl">Boilermeets</h1>
          <p className="text-muted-foreground">
            Connect through conversations, not just photos
          </p>
        </div>
          <Button
            asChild
            variant={"outline"}
            size="lg"
            className="flex-row gap-2 items-center"
          >
            <Link to="/login" className="w-full flex items-center justify-center">
              <p className="font-bold">&lt; Back To Login</p>
            </Link>
          </Button>
        <Card className="w-lg">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex flex-col">
              <h1 className="text-center font-semibold text-xl">
                Email Sent!
              </h1>
              <h3 className="text-muted-foreground text-center text-xs">
                Please check your inbox and junk Mail for an email from us!
              </h3>
            </div>
            <div className="flex flex-col gap-4">
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}