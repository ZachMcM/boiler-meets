import { ProfileModuleContainer, ProfileModuleEditor } from "@/components/ProfileModules";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import type { DraggableModule } from "@/components/ProfileModules";
import { useState, useEffect } from "react";
import { Save, Home, MessageCircle, Users, Heart, ShieldX, Edit3, Check } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import PurdueTrainHeader from '@/components/PurdueTrainAnimation';
import { getMatches, getProfileReactions, addProfileReaction } from "@/endpoints";
import type { Reaction } from "@/types/user";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/profile/$username")({
  component: () => {
    const { username } = Route.useParams();
    return RouteComponent(username);
  }
});

// Helper function to fetch user by username
async function getUserByUsername(username: string) {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/user/username/${username}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

// Helper function to save profile data
async function saveProfileData(modules: DraggableModule[]) {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/user/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ profile: { modules } }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save profile");
  }

  return response.json();
}

function RouteComponent(username: string) {
  const { data: currentUserData } = authClient.useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch the profile user's data
  const { data: profileUserData, isLoading: isLoadingProfile, error } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });

  let permission = "view";

  if (currentUserData?.user.username && currentUserData.user.username == username) {
    permission = "edit";
  }

  // Fetch matches to determine if current user is matched with profile owner
  const { data: matches } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
    enabled: permission === "view" && !!currentUserData?.user?.id,
  });

  // Check if matched and get match type
  const currentMatch = matches?.find(
    (match) => match.user?.username === username
  );
  const isMatched = !!currentMatch;
  const matchType = currentMatch?.matchType;

  // Fetch reactions for this profile (only if viewing another user's profile)
  const { data: reactionsData = [], refetch: refetchReactions } = useQuery({
    queryKey: ["profile-reactions", profileUserData?.id],
    queryFn: () => getProfileReactions(profileUserData?.id),
    enabled: !!profileUserData?.id && permission === "view",
  });

  // Convert reactions data to the format expected by ProfileView component
  const reactions: Reaction[] = reactionsData.map((r: any) => ({
    id: r.id.toString(),
    emoji: r.emoji,
    userId: r.userId,
    userName: r.userName,
    targetId: r.targetId,
    targetType: r.targetType as any,
    timestamp: new Date(r.createdAt),
  }));

  // State for bio text
  const [bioText, setBioText] = useState("");
  const [savedBioText, setSavedBioText] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // preferences state
  const PREFERENCE_OPTIONS = ["Friends", "Romance", "Networking", "Study Buddies"];
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [savedPreferences, setSavedPreferences] = useState<string[]>([]);
  const [preferencesChanged, setPreferencesChanged] = useState(false);

  // State for dialogs
  const [blockDialog, setBlockDialog] = useState(false);
  const [nicknameDialog, setNicknameDialog] = useState(false);
  const [nickname, setNickname] = useState("");

  // Update bio when profile data loads
  useEffect(() => {
    if (profileUserData?.bio) {
      setBioText(profileUserData.bio);
      setSavedBioText(profileUserData.bio);
    } else {
      // Handle empty bio case
      setBioText("");
      setSavedBioText("");
    }

    // load user preferences if they exist
    if (profileUserData?.preferences) {
      try {
        const prefs = typeof profileUserData.preferences === 'string'
          ? JSON.parse(profileUserData.preferences)
          : profileUserData.preferences;
        setSelectedPreferences(Array.isArray(prefs) ? prefs : []);
        setSavedPreferences(Array.isArray(prefs) ? prefs : []);
      } catch {
        setSelectedPreferences([]);
        setSavedPreferences([]);
      }
    } else {
      setSelectedPreferences([]);
      setSavedPreferences([]);
    }
  }, [profileUserData]);

  // Parse profile modules from the database
  const getProfileModules = (): DraggableModule[] => {
    if (profileUserData?.profile) {
      // If profile is already an object (parsed by backend)
      if (typeof profileUserData.profile === 'object' && profileUserData.profile.modules) {
        return profileUserData.profile.modules;
      }
      // If profile is still a string (fallback)
      if (typeof profileUserData.profile === 'string') {
        try {
          const parsed = JSON.parse(profileUserData.profile);
          return parsed.modules || [];
        } catch (e) {
          console.error('Failed to parse profile:', e);
        }
      }
    }
    return [];
  };

  const profileModules = getProfileModules();

  // Calculate age from birthdate
  const calculateAge = (birthdate: Date | string | undefined) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Handler for when the profile layout is saved
  const handleProfileSave = async (modules: DraggableModule[]) => {
    if (permission !== "edit") return;
    
    try {
      await saveProfileData(modules);
      
      // Invalidate and refetch the profile data
      await queryClient.invalidateQueries({ queryKey: ["user-profile", username] });
      
      toast.success("Profile layout saved!");
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error("Failed to save profile layout");
    }
  };

  // Handler for bio text change
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setBioText(newValue);
    setHasChanged(newValue !== savedBioText);
  };

  // Handler for saving bio
  async function handleBioSave(): Promise<void> {
    console.log("Saving bio");
    try {
      await authClient.updateUser(
        {
          bio: bioText,
        },
        {
          onError: ({ error }) => {
            toast.error("Error: Could not save bio!");
            setIsLoading(false);
            setBioText(savedBioText);
            setHasChanged(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["session"] });
            await queryClient.invalidateQueries({ queryKey: ["user-profile", username] });
            await queryClient.refetchQueries({ queryKey: ['session'] });
            toast.success("Bio saved successfully!");
            setIsLoading(false);
            setSavedBioText(bioText);
            setHasChanged(false);
          },
        }
      );
    }
    catch {
      toast.error("Error: Could not save bio!");
    }
  };

  // Handler for navigating home
  const handleGoHome = () => {
    router.navigate({ to: "/dashboard" });
  };

  // Handler for navigating to messages
  const handleMessage = () => {
    router.navigate({ to: `/messages/${username}` });
  };

  const handleReaction = async (targetId: string, emoji: string) => {
    if (!profileUserData?.id || !isMatched) return;

    try {
      await addProfileReaction(
        profileUserData.id,
        targetId,
        targetId.split("-")[0],
        emoji
      );
      await refetchReactions();
    } catch (error) {
      console.error("Failed to add reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  const handleBioReaction = async (emoji: string) => {
    await handleReaction(`bio-${profileUserData.id}`, emoji);
  };

  // Handler for blocking user
  const handleBlockUser = async () => {
    // TODO: Implement block user API call
    toast.success(`Blocked ${profileUserData.name}`);
    setBlockDialog(false);
    router.navigate({ to: "/dashboard" });
  };

  // Handler for saving nickname
  const handleSaveNickname = async () => {
    // TODO: Implement save nickname API call
    toast.success(`Nickname saved: ${nickname}`);
    setNicknameDialog(false);
  };

  // toggle preference selection
  const handlePreferenceToggle = (preference: string) => {
    if (permission !== "edit") return;

    const newPreferences = selectedPreferences.includes(preference)
      ? selectedPreferences.filter((p) => p !== preference)
      : [...selectedPreferences, preference];

    setSelectedPreferences(newPreferences);
    setPreferencesChanged(
      JSON.stringify(newPreferences.sort()) !== JSON.stringify(savedPreferences.sort())
    );
  };

  // save user preferences to database
  const handlePreferencesSave = async () => {
    if (permission !== "edit") return;

    try {
      await authClient.updateUser(
        {
          preferences: JSON.stringify(selectedPreferences),
        },
        {
          onError: ({ error }) => {
            toast.error("Error: Could not save preferences!");
            setSelectedPreferences(savedPreferences);
            setPreferencesChanged(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user-profile", username] });
            toast.success("Preferences saved successfully!");
            setIsLoading(false);
            setSavedPreferences(selectedPreferences);
            setPreferencesChanged(false);
          },
        }
      );
    } catch {
      toast.error("Error: Could not save preferences!");
    }
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="flex flex-1 justify-center items-center w-full h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Error or user not found
  if (error || !profileUserData) {
    return (
      <div className="flex flex-1 justify-center items-center w-full h-full">
        <p>User not found</p>
      </div>
    );
  }

  const userAge = calculateAge(profileUserData.birthdate);

  const bioReactions = reactions.filter(r => r.targetId === `bio-${profileUserData?.id}`);

  const bioReactionGroups = bioReactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background from-30% to-primary flex flex-col">
      <div className="pl-10 pt-4 pr-10 flex gap-3 items-center">
        <Button
          onClick={handleGoHome}
          className="w-auto flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white hover:cursor-pointer"
          size="lg"
        >
          <Home size={18} />
          Dashboard
        </Button>
        {permission === "view" && isMatched && (
          <>
            <Button
              onClick={handleMessage}
              className="w-auto flex items-center gap-2 bg-primary hover:bg-[#a19072] text-white hover:cursor-pointer"
              size="lg"
            >
              <MessageCircle size={18} />
              Message {profileUserData.name}
            </Button>
            {matchType && (
              matchType === "friend" ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Users className="w-4 h-4 mr-1.5" />
                  Friend Match
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                  <Heart className="w-4 h-4 mr-1.5" />
                  Romantic Match
                </span>
              )
            )}
          </>
        )}
        {permission === "view" && !isMatched && (
          <div className="ml-4 text-3xl">Welcome to {profileUserData.name}'s profile!</div>
        )}
        
        {/* Action buttons on the right */}
        <div className="ml-auto flex gap-2">
          {permission === "view" && isMatched && (
            <Button
              onClick={() => setNicknameDialog(true)}
              variant="outline"
              className="hover:cursor-pointer flex items-center gap-2"
              size="lg"
            >
              <Edit3 size={18} />
              Nickname
            </Button>
          )}
          {permission === "view" && (
            <Button
              onClick={() => setBlockDialog(true)}
              variant="outline"
              className="hover:cursor-pointer hover:bg-red-400 flex items-center gap-2"
              size="lg"
            >
              <ShieldX size={18} />
              Block User
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 justify-center w-full pr-10 pl-10 pt-4 gap-3">
        <Card className="w-full flex-1">
          <CardContent>
            <div className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <div>
                  <Label className="text-6xl inline-block">
                    {profileUserData.name || "Anonymous User"}
                  </Label>
                  {userAge && (
                    <Label className="text-5xl text-gray-700 inline-block ml-4">
                      {userAge}
                    </Label>
                  )}
                  <div>
                    <Label className="text-3xl text-gray-500">
                      {profileUserData.major || "Undeclared"} • {profileUserData.year || "Freshman"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="pb-4 border-b mt-4">
              <Label className="text-xl font-semibold mb-3 block">
                Looking for
              </Label>
              {permission === "edit" ? (
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map((pref) => (
                    <button
                      key={pref}
                      onClick={() => handlePreferenceToggle(pref)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedPreferences.includes(pref)
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {selectedPreferences.includes(pref) && (
                        <Check className="inline w-4 h-4 mr-1" />
                      )}
                      {pref}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedPreferences.length > 0 ? (
                    selectedPreferences.map((pref) => (
                      <span
                        key={pref}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white"
                      >
                        {pref}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No preferences set</span>
                  )}
                </div>
              )}
              {permission === "edit" && preferencesChanged && !isLoading && (
                <Button
                  onClick={handlePreferencesSave}
                  className="mt-3 hover:bg-[#a19072] text-white hover:cursor-pointer"
                >
                  <Save size={14} />
                  Save Preferences
                </Button>
              )}
            </div>
            {(permission !== "view" || bioText !== "") && (
              <textarea 
                readOnly={permission === "view" || isLoading} 
                disabled={permission === "view" || isLoading}
                wrap="soft"
                value={bioText}
                onChange={handleBioChange}
                placeholder="Write a bio about yourself..." 
                className="w-full mt-8 resize-none max-h-full overflow-hidden field-sizing-content p-2"
                style={{ overflowWrap: 'anywhere' }}
              />
            )}
            {permission === "edit" && hasChanged && !isLoading && (
              <Button
                onClick={handleBioSave}
                className="mt-4 hover:bg-[#a19072] text-white hover:cursor-pointer"
              >
                <Save size={14} />
                Save Bio
              </Button>
            )}
            {permission === "view" && isMatched && (
              <div className="mt-4 border-t pt-3 bg-slate-50 -mx-6 px-6 py-3">
                <div className="flex items-center gap-2">
                  {['❤️', '👍', '😂', '🔥', '👀', '🎉'].map(emoji => {
                    const count = bioReactionGroups[emoji]?.length || 0;
                    const users = bioReactionGroups[emoji]?.map(r => r.userName).join(', ') || '';

                    return (
                      <button
                        key={emoji}
                        onClick={() => handleBioReaction(emoji)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          count > 0
                            ? 'bg-white border-2 border-slate-300'
                            : 'bg-white border border-slate-200 opacity-50'
                        } hover:border-slate-400 hover:cursor-pointer`}
                        title={users || 'React'}
                      >
                        <span className="text-lg">{emoji}</span>
                        {count > 0 && <span className="ml-1 text-sm font-medium text-slate-700">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="flex-[2] flex flex-col">
          <CardContent className="h-full p-4">
            <ProfileModuleEditor
              initialModules={profileModules}
              onSave={handleProfileSave}
              permission={permission as "view" | "edit" | undefined}
              reactions={reactions}
              onReaction={handleReaction}
              canReact={isMatched && permission === "view"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Block User Dialog */}
      <Dialog open={blockDialog} onOpenChange={setBlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block {profileUserData.name}?</DialogTitle>
            <DialogDescription>
              This will unmatch you from {profileUserData.name} and prevent them from contacting you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between gap-3 mt-4">
            <Button
              onClick={() => setBlockDialog(false)}
              variant="outline"
              className="hover:cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlockUser}
              variant="destructive"
              className="hover:cursor-pointer flex items-center gap-2"
            >
              <ShieldX size={16} />
              Block User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nickname Dialog */}
      <Dialog open={nicknameDialog} onOpenChange={setNicknameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Nickname for {profileUserData.name}</DialogTitle>
            <DialogDescription>
              Give {profileUserData.name} a personal nickname that only you can see.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Enter nickname..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={50}
            />
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setNicknameDialog(false);
                  setNickname("");
                }}
                variant="outline"
                className="hover:cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNickname}
                disabled={!nickname.trim()}
                className="hover:cursor-pointer"
              >
                Save Nickname
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PurdueTrainHeader />
    </div>
  );
}