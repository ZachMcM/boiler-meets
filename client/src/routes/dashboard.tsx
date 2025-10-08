import FindRoomButton from "@/components/FindRoomButton";
import { authClient, fetchUserSession } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUserData, isLoading: sessionPending } = useQuery({
    queryKey: ['session'],
    queryFn: fetchUserSession
  });

  const router = useRouter();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  useEffect(() => {
    if (currentUserData?.data?.user && !sessionPending) {
      const hasSeenWelcome = localStorage.getItem(`welcome_dismissed_${currentUserData.data.user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcomeDialog(true);
      }
    }
  }, [currentUserData, sessionPending]);

  if (!currentUserData?.data?.user && !sessionPending) {
    console.log("No user session found in dashboard, redirecting to login");
    router.navigate({ to: "/login" });
  }

  if (currentUserData?.data?.user && (!currentUserData?.data?.user.year || !currentUserData?.data?.user.major || !currentUserData?.data?.user.birthdate) && !sessionPending) {
    console.log("Detected user has not completed account setup, redirecting to register_final_setup");
    router.navigate({ to: "/register_final_setup" });
  }

  const handleSetupProfile = () => {
    if (currentUserData?.data?.user?.username) {
      router.navigate({ to: `/profile/${currentUserData.data.user.username}` });
    }
  };

  const handleDismiss = () => {
    if (currentUserData?.data?.user?.id) {
      localStorage.setItem(`welcome_dismissed_${currentUserData.data.user.id}`, 'true');
    }
    setShowWelcomeDialog(false);
  };

  const handleVisitProfile = () => {
    if (currentUserData?.data?.user?.username) {
      router.navigate({ to: `/profile/${currentUserData.data.user.username}` });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <FindRoomButton />
        <Button
          onClick={handleVisitProfile}
          variant="outline"
          className="hover:cursor-pointer"
        >
          <UserCircle className="w-4 h-4 mr-2" />
          My Profile
        </Button>
      </div>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome back, {currentUserData?.data?.user?.username || "User"}!</p>
      </div>

      <Dialog open={showWelcomeDialog}>
        <DialogContent 
          className="[&>button:first-of-type]:hidden"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex flex-col space-y-4">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Welcome to BoilerMeets!
            </DialogTitle>
            <Card className="max-w-3xl flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserCircle className="w-12 h-12 text-primary" />
                  <div>
                    <p className="font-semibold text-lg text-foreground">
                      Set Up Your Profile
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Make your profile stand out and help others get to know you!
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Add modules to your profile to share your interests, favorites, and personality with the community.
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      className = "hover:cursor-pointer"
                    >
                      Maybe Later
                    </Button>
                    <Button
                      onClick={handleSetupProfile}
                      className="bg-primary hover:bg-[#a19072] text-white hover:cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      Set Up Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}