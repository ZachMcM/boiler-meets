import FindRoomButton from "@/components/FindRoomButton";
import { authClient, fetchUserSession, signOut } from "@/lib/auth-client";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserCircle,
  Sparkles,
  Search,
  ChevronRight,
  UsersRound,
  MessageCircle,
  Users,
  Heart,
  HouseIcon,
  PhoneCall,
  Bell,
  XCircle
} from "lucide-react";
import { getMatches, getMatchMessages, removeMatch, searchUsers, getCallHistory, type CallHistory } from "@/endpoints";
import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { io } from "socket.io-client";
import Notification from "@/components/Notification";
import type { NotificationItem } from "@/components/Notification";
import { toast } from "sonner";
import type { Match, User } from "@/types/user";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    if (!context.currentUserData) {
      throw redirect({
        to: "/login",
      });
    }
    if (context.currentUserData.user.isBanned) {
      throw redirect({
        to: "/banned",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState<"all" | "friend" | "romantic">("all");
  const [globalSearch, setGlobalSearch] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

  const { data: currentUserData, isLoading: sessionPending } = useQuery({
    queryKey: ["session"],
    queryFn: fetchUserSession,
  });

  const { data: matches, isPending: matchesPending } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
  });

  const { data: searchResults, isPending: searchPending } = useQuery({
    queryKey: ["userSearch", searchQuery, searchPage, globalSearch],
    queryFn: async () => searchQuery ? await searchUsers(searchQuery, searchPage) : null,
    enabled: globalSearch && !!searchQuery,
  });

  // Get all call history for filtering and display
  const { data: callHistory, isPending: callHistoryPending } = useQuery({
    queryKey: ["callHistory", globalSearch],
    queryFn: () => getCallHistory(),
    enabled: globalSearch,
  });

  const [notificationReload, setNotificationReload] = useState([] as NotificationItem[]);

  const { callSession, clearCallSession } = useVideoCallContext();

  const matchUserIds =
    matches?.map((match) => match.user?.id).filter(Boolean) || [];

  const messagesQueries = useQuery({
    queryKey: ["recentMessages", matchUserIds],
    queryFn: async () => {
      if (!matches || matches.length === 0) return {};

      const messagePromises = matches.map(async (match) => {
        if (!match.user?.id) return null;
        try {
          const messages = await getMatchMessages(match.user.username);
          const mostRecent = messages.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];
          return { userId: match.user.id, message: mostRecent };
        } catch (error) {
          return { userId: match.user.id, message: null };
        }
      });

      const results = await Promise.all(messagePromises);
      return results.reduce(
        (acc, result) => {
          if (result) {
            acc[result.userId] = result.message;
          }
          return acc;
        },
        {} as Record<string, any>
      );
    },
    enabled: !!matches && matches.length > 0,
  });

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_SERVER_URL}/messaging`, {
      auth: { userId: currentUserData?.data?.user?.id },
      withCredentials: true,
    });

    socket.on("message-received", () => {
      // Invalidate queries when any message is received
      queryClient.invalidateQueries({ queryKey: ["recentMessages"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserData?.data?.user?.id, queryClient]);

  // Listen for user-banned event to immediately log out banned users
  useEffect(() => {
    if (!currentUserData?.data?.user?.id) return;

    const socket = io(import.meta.env.VITE_SERVER_URL, {
      auth: { userId: currentUserData.data.user.id },
      withCredentials: true,
    });

    socket.on("user-banned", (data: { userId: string }) => {
      if (data.userId === currentUserData?.data?.user?.id) {
        // Clear session and redirect to banned page
        queryClient.clear();
        router.navigate({ to: "/banned" });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserData?.data?.user?.id, router, queryClient]);

  useEffect(() => {
    if (currentUserData?.data?.user && !sessionPending) {
      const hasSeenWelcome = localStorage.getItem(
        `welcome_dismissed_${currentUserData.data.user.id}`
      );
      if (!hasSeenWelcome) {
        setShowWelcomeDialog(true);
      }
    }
  }, [currentUserData, sessionPending]);

  if (!currentUserData?.data?.user && !sessionPending) {
    console.log("No user session found in dashboard, redirecting to login");
    router.navigate({ to: "/login" });
  }

  if (
    currentUserData?.data?.user &&
    (!currentUserData?.data?.user.year ||
      !currentUserData?.data?.user.major ||
      !currentUserData?.data?.user.birthdate) &&
    !sessionPending
  ) {
    console.log(
      "Detected user has not completed account setup, redirecting to register_final_setup"
    );
    router.navigate({ to: "/register_final_setup" });
  }

  const handleSetupProfile = () => {
    if (currentUserData?.data?.user?.username) {
      localStorage.setItem(
        `welcome_dismissed_${currentUserData.data.user.id}`,
        "true"
      );
      router.navigate({ to: `/profile/${currentUserData.data.user.username}` });
    }
  };

  const handleDismiss = () => {
    if (currentUserData?.data?.user?.id) {
      localStorage.setItem(
        `welcome_dismissed_${currentUserData.data.user.id}`,
        "true"
      );
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

  // Get either filtered matches or global search results with call history
  const filteredResults = globalSearch 
    ? (searchResults?.users || []).filter(user => {
        // If a specific filter is active, only show users with that call type
        if (matchFilter !== "all") {
          return callHistory?.some(
            call => 
              (call.calledUserId === user.id || call.callerUserId === user.id) && 
              call.callType === matchFilter
          );
        }
        return true;
      })
    : matches
      ?.filter((match) => {
        // Filter by match type
        if (matchFilter !== "all" && match.matchType !== matchFilter) {
          return false;
        }

        // Filter by search query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return match.user?.name?.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const aMessage = messagesQueries.data?.[a.user?.id];
        const bMessage = messagesQueries.data?.[b.user?.id];

        if (aMessage?.createdAt && bMessage?.createdAt) {
          return (
            new Date(bMessage.createdAt).getTime() -
            new Date(aMessage.createdAt).getTime()
          );
        }

        if (aMessage?.createdAt) return -1;
        if (bMessage?.createdAt) return 1;

        return 0;
      });

  const destroyNotification = async (timestamp: number) => {
    if (!currentUserData?.data?.user.notifications) return;
    
    const currentNotifications = JSON.parse(currentUserData.data.user.notifications) as NotificationItem[];
    const updatedList = currentNotifications.filter(item => item.timestamp !== timestamp);
    
    await authClient.updateUser({
      notifications: JSON.stringify(updatedList)
    }, {
      onError: ({ error }) => {
        toast.error(error.message || "Notification Update Failed");
      },
      onSuccess: () => {
        setNotificationReload(updatedList); // Do not delete, somehow, useStates are the only way the page updates
      }
    });
  };

  useEffect(() => {
    if (currentUserData?.data?.user?.notifications) {
      try {
        setNotificationReload(JSON.parse(currentUserData.data.user.notifications) as NotificationItem[]);
      } catch (e) {
        console.error("Failed to parse notifications:", e);
      }
    }
  }, [currentUserData?.data?.user?.notifications])

  const deleteMatch = async (match: Match) => {
    console.log("MATCH DELETING", match);
    if (currentUserData?.data?.user.id) {
      await removeMatch(match.matchedUserId, currentUserData.data.user.id);
      queryClient.clear();
      queryClient.invalidateQueries({queryKey: ["session"]});
      queryClient.invalidateQueries({queryKey: ["matches"]});
      console.log(matches);
      
      try { //Self notifications
        if (!currentUserData?.data?.user.notifications) return;
        const currentNotifications = JSON.parse(currentUserData.data.user.notifications) as NotificationItem[];
        const newSelfNotification = {  
          timestamp: Date.now(),
          type: "unmatch",
          text: `You have unmatched with ${match.user.name}`,
          title: "Unmatch"
        } as NotificationItem;
        const updatedList = currentNotifications.concat([newSelfNotification]);
        
        await authClient.updateUser({
          notifications: JSON.stringify(updatedList)
        }, {
          onError: ({ error }) => {
            toast.error(error.message || "Notification Update Failed");
          },
          onSuccess: () => {
            setNotificationReload(updatedList); // Do not delete, somehow, useStates are the only way the page updates
          }
        });
      } catch {
        console.log("Could not update self notifications.");
      }
      try { // Other user notifications
        // TODO Figure out how to update another user's notifications, we cannot rely on the 'user'
      } catch {
        console.log("Could not update other user's notifications.");
      }
    }
  }

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
            <FindRoomButton
              matchType="friend"
              label="Find Friends"
              icon={<Users />}
            />
            <FindRoomButton
              matchType="romantic"
              label="Find Romance"
              icon={<Heart />}
            />
            <Button
              onClick={() =>
                handleVisitProfile(currentUserData?.data?.user?.username)
              }
              variant="outline"
              className="hover:cursor-pointer"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              My Profile
            </Button>
            <Button
              onClick={async () => {
                queryClient.clear();
                queryClient.invalidateQueries({queryKey: ["session"]}).then(
                  () => signOut().then(
                    () => {router.navigate({ to: "/login" })}
                  ));
              }
              }
              variant="outline"
              className="hover:cursor-pointer"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Matches & Notifications Section */}
        <div className="flex gap-2 mb-4">
        <Card className="mb-8 w-4/5">
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
                {matches?.length || 0}{" "}
                {matches?.length === 1 ? "match" : "matches"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <Button
              variant="secondary"
              size="default"
              onClick={() => {
                setGlobalSearch(!globalSearch);
                queryClient.invalidateQueries()
              }}
              className="hover:cursor-pointer text-lg my-2"
            >
              {!globalSearch ? (
                <>Search All Boilermeets Users</>
              ) : (
                <>Search Your Matches</>
              )}
            </Button>
            {((matches && matches.length > 0) || globalSearch) && (
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
            {((matches && matches.length > 0) || globalSearch) && (
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

            {/* Results List */}
            {((!globalSearch && matchesPending) || (globalSearch && searchPending)) ? (
              <div className="text-center py-8 text-muted-foreground">
                {globalSearch ? "Searching users..." : "Loading matches..."}
              </div>
            ) : filteredResults && filteredResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                {filteredResults.map((item) => {
                  const isMatch = 'matchId' in item;
                  const user = isMatch ? (item as Match).user : item;
                  const matchType = isMatch ? (item as Match).matchType : null;

                  return (
                    <Card
                      key={isMatch ? (item as Match).matchId : user.id}
                      className="hover:shadow-md transition-all hover:border-primary py-0"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isMatch && (
                                <Button
                                  onClick={() => deleteMatch(item as Match)}
                                  variant="destructive"
                                  size="icon"
                                  className="rounded-full"
                                >
                                  <XCircle />
                                </Button>
                              )}
                              <h3 className="font-semibold text-base truncate">
                                {user?.name || "Anonymous"}
                              </h3>
                              {(isMatch ? [matchType] : callHistory
                                ?.filter(call => (call.callType == matchFilter || matchFilter == "all") && (call.calledUserId === user.id || call.callerUserId === user.id)) //If the filters change, update this and many other lines
                                .map(call => call.callType))
                                ?.slice(0,1)         //Slice in order to get only the latest call
                                ?.map((type, idx) => (
                                  type === "friend" ? (
                                    <span key={`${type}-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      <Users className="w-3 h-3 mr-1" />
                                      {isMatch ? "Matched" : "Called"}
                                    </span>
                                  ) : (
                                    <span key={`${type}-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                      <Heart className="w-3 h-3 mr-1" />
                                      {isMatch ? "Matched" : "Called"}
                                    </span>
                                  )
                                ))
                              }
                              <p className="text-sm text-muted-foreground truncate">
                                {user?.major} • {user?.year}
                              </p>
                            </div>
                            {isMatch && (
                              <p className="text-sm text-muted-foreground truncate">
                                {messagesQueries.data?.[user?.id]?.content ||
                                  "Don't be shy! Send them a message."}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVisitProfile(user?.username);
                              }}
                              className="hover:cursor-pointer"
                            >
                              <UserCircle className="w-4 h-4 mr-1" />
                              Profile
                            </Button>
                            {isMatch && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMatchClick(user?.username || "");
                                }}
                                className="hover:cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
                      <FindRoomButton
                        matchType="friend"
                        label="Find Friends"
                        icon={<Users />}
                      />
                      <FindRoomButton
                        matchType="romantic"
                        label="Find Romance"
                        icon={<Heart />}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        <Card className="mb-8 w-1/5 truncate">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <Bell className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Notifications</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ maxHeight: '300px', overflowY: 'auto'}}>
              {notificationReload.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications</p>
              ) : (
                notificationReload.map((notification: NotificationItem) => (
                  <Notification 
                    key={`${notification.timestamp} ${notification.title} ${Math.random()}`}
                    // key={notification.timestamp}
                    destroyNotification={destroyNotification}
                    {...notification}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </div>

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
                        Make your profile stand out and help others get to know
                        you!
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      Add modules to your profile to share your interests,
                      favorites, and personality with the community.
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
                <CardContent>
                  {" "}
                  {/* Card for matches on top */}
                  {callSession &&
                    callSession
                      .filter((singleCallData) => {
                        return singleCallData.matched;
                      })
                      .map((singleCallData) => (
                        <Card
                          key={`${singleCallData.otherUser}-${crypto.randomUUID()}`}
                          className="hover:shadow-md transition-all hover:border-primary cursor-pointer py-0 mb-2"
                          onClick={() => {
                            handleMatchClick(
                              singleCallData.otherUser?.username || ""
                            );
                            clearCallSession();
                          }}
                        >
                          <CardContent className="p-4 rounded-xl">
                            <div className="flex items-center">
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="font-semibold text-base truncate hover:text-primary w-fit"
                                  onClick={() => {
                                    handleVisitProfile(
                                      singleCallData.otherUser?.username
                                    );
                                    clearCallSession();
                                  }}
                                >
                                  {singleCallData.otherUser?.name ||
                                    "Anonymous"}{" "}
                                  {"-- Matched!"}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {singleCallData.callLength >= 60000
                                    ? `The call was ${Math.floor(singleCallData.callLength / 60000)} minutes and ${Math.floor((singleCallData.callLength % 60000) / 1000)} seconds`
                                    : `The call was ${Math.floor(singleCallData.callLength / 1000)} seconds`}
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
                  {callSession &&
                    callSession
                      .filter((singleCallData) => {
                        return !singleCallData.matched;
                      })
                      .map((singleCallData) => (
                        <Card
                          key={`${singleCallData.otherUser}-${singleCallData.callLength}`}
                          className="transition-all py-0 mb-2"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate w-fit">
                                  {singleCallData.otherUser?.name ||
                                    "Anonymous"}{" "}
                                  {"-- No match"}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {`Call was ended by ${singleCallData.callEndedByUser ? "you" : singleCallData.otherUser?.name || "Anonymous"}`}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {singleCallData.callLength >= 60000
                                    ? `The call was ${Math.floor(singleCallData.callLength / 60000)} minutes and ${Math.floor((singleCallData.callLength % 60000) / 1000)} seconds`
                                    : `The call was ${Math.floor(singleCallData.callLength / 1000)} seconds`}
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
