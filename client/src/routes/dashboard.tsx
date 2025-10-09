import FindRoomButton from "@/components/FindRoomButton";
import { fetchUserSession } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Sparkles, Search, User, ChevronRight, UsersRound, MessageCircle, Users, Heart, HouseIcon, PhoneCall } from "lucide-react";
import { getMatches } from "@/endpoints";
import { useVideoCallContext } from "@/contexts/VideoCallContext";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUserData, isLoading: sessionPending } = useQuery({
    queryKey: ['session'],
    queryFn: fetchUserSession
  });

  const { data: matches, isPending: matchesPending } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
  });

  const router = useRouter();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState<"all" | "friend" | "romantic">("all");

  const {callSession, clearCallSession} = useVideoCallContext();

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

  const handleVisitProfile = (username: string | null | undefined) => {
    if (username) {
      router.navigate({ to: `/profile/${username}` });
    }
  };

  const handleMatchClick = (username: string) => {
    if (username) {
      router.navigate({ to: `/messages/${username}` });
    }
  };

  // Filter matches based on search query and match type
  const filteredMatches = matches?.filter((match) => {
    // Filter by match type
    if (matchFilter !== "all" && match.matchType !== matchFilter) {
      return false;
    }

    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      match.user?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {currentUserData?.data?.user?.username || "User"}!
            </p>
          </div>
          <div className="flex gap-3">
            <FindRoomButton matchType="friend" label="Find Friends" icon={<Users />} />
            <FindRoomButton matchType="romantic" label="Find Romance" icon={<Heart />} />
            <Button
              onClick={() => handleVisitProfile(currentUserData?.data?.user?.username)}
              variant="outline"
              className="hover:cursor-pointer"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              My Profile
            </Button>
          </div>
        </div>

        {/* Matches Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UsersRound className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">My Matches</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect and chat with people you've matched with
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {matches?.length || 0} {matches?.length === 1 ? "match" : "matches"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            {matches && matches.length > 0 && (
              <div className="flex gap-2 mb-4">
                <Button
                  variant={matchFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMatchFilter("all")}
                  className="hover:cursor-pointer"
                >
                  All
                </Button>
                <Button
                  variant={matchFilter === "friend" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMatchFilter("friend")}
                  className="hover:cursor-pointer"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Friends
                </Button>
                <Button
                  variant={matchFilter === "romantic" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMatchFilter("romantic")}
                  className="hover:cursor-pointer"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Romantic
                </Button>
              </div>
            )}

            {/* Search Bar */}
            {matches && matches.length > 0 && (
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Looking for someone?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Matches List */}
            {matchesPending ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading matches...
              </div>
            ) : filteredMatches && filteredMatches.length > 0 ? (
              <div className="flex flex-col gap-2">
                {filteredMatches.map((match) => (
                  <Card
                    key={match.matchId}
                    className="hover:shadow-md transition-all hover:border-primary py-0"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base truncate">
                              {match.user?.name || "Anonymous"}
                            </h3>
                            {match.matchType === "friend" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Users className="w-3 h-3 mr-1" />
                                Friend
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                <Heart className="w-3 h-3 mr-1" />
                                Romantic
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {match.user?.major} • {match.user?.year}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVisitProfile(match.user?.username);
                            }}
                            className="hover:cursor-pointer"
                          >
                            <UserCircle className="w-4 h-4 mr-1" />
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMatchClick(match.user?.username || "");
                            }}
                            className="hover:cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <UsersRound className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? "No matches found" : "No matches yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Don't worry, you'll find them someday!"
                      : "Start a video chat and get your first match!"}
                  </p>
                  {!searchQuery && (
                    <div className="flex gap-2 justify-center">
                      <FindRoomButton matchType="friend" label="Find Friends" icon={<Users />} />
                      <FindRoomButton matchType="romantic" label="Find Romance" icon={<Heart />} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Welcome Dialog */}
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
                        className="hover:cursor-pointer"
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

        {/* Post-Call Dialog */}
        <Dialog open={callSession !== null}>
          <DialogContent 
            className="[&>button:first-of-type]:hidden"
            onInteractOutside={(e) => {
              clearCallSession();
            }}
          >
            <div className="flex flex-col space-y-4">
              <DialogTitle className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-green-500" />
                Video Call Summary!
              </DialogTitle>
                <Card className="max-w-3xl flex flex-1">
                    <CardContent> {/* Card for matches on top */}
                      {callSession && callSession.filter((singleCallData => {return singleCallData.matched})).map((singleCallData) => (
                        <Card 
                          key={`${singleCallData.otherUser}-${crypto.randomUUID()}`} 
                          className="hover:shadow-md transition-all hover:border-primary cursor-pointer py-0 mb-2"
                          onClick={() => { handleMatchClick(singleCallData.otherUser?.username || ""); clearCallSession(); }}
                        >
                          <CardContent className="p-4 bg-pink-100 rounded-xl">
                            <div className="flex items-center">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate hover:text-primary w-fit" onClick={() => { handleVisitProfile(singleCallData.otherUser?.username); clearCallSession(); }}>
                                  {singleCallData.otherUser?.name || "Anonymous"} {"-- Matched!"}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {singleCallData.callLength >= 60000 ? (
                                    `The call was ${Math.floor(singleCallData.callLength / 60000)} minutes and ${Math.floor((singleCallData.callLength % 60000) / 1000)} seconds`
                                  ) : (
                                    `The call was ${Math.floor(singleCallData.callLength / 1000)} seconds`
                                  )}
                                  {/* TODO fix call extensions bug */}
                                  {/* {` with ${singleCallData.numberCallExtensions} call extensions`} */}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  Don't be shy, send them a message!
                                </p>
                              </div>                              
                              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {/* Card for non-matches on bottom */}
                      {callSession && callSession.filter((singleCallData => {return !singleCallData.matched})).map((singleCallData) => (
                        <Card 
                          key={`${singleCallData.otherUser}-${singleCallData.callLength}`} 
                          className="transition-all py-0 mb-2"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate w-fit">
                                  {singleCallData.otherUser?.name || "Anonymous"} {"-- No match"}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {`Call was ended by ${singleCallData.callEndedByUser ? "you" : (singleCallData.otherUser?.name || "Anonymous")}`}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {singleCallData.callLength >= 60000 ? (
                                    `The call was ${Math.floor(singleCallData.callLength / 60000)} minutes and ${Math.floor((singleCallData.callLength % 60000) / 1000)} seconds`
                                  ) : (
                                    `The call was ${Math.floor(singleCallData.callLength / 1000)} seconds`
                                  )}
                                  {/* {` with ${singleCallData.numberCallExtensions} call extensions`} */}
                                </p>
                              </div>                              
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          onClick={clearCallSession}
                          className="rounded-full hover:bg-[#a19072]"
                        >
                          <HouseIcon />
                          Back To Dashboard
                        </Button>
                      </div>
                    </CardContent>
                </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}