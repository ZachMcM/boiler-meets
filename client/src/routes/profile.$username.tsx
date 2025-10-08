import { ProfileModuleContainer, ProfileModuleEditor } from "@/components/ProfileModules";
import { ProfileView } from "@/components/profile/ProfileView";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import type { DraggableModule } from "@/components/ProfileModules";
import { useState, useEffect } from "react";
import { Save, Home, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import PurdueTrainHeader from '@/components/PurdueTrainAnimation';
import { getMatches, getProfileReactions, addProfileReaction } from "@/endpoints";
import type { Reaction, User } from "@/types";

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

  // Check if matched
  const isMatched = matches?.some(
    (match) => match.user?.username === username
  ) || false;

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

  // Handler for adding reactions
  const handleReaction = async (targetId: string, emoji: string) => {
    if (!profileUserData?.id || !isMatched) return;

    try {
      await addProfileReaction(
        profileUserData.id,
        targetId,
        targetId.split("-")[0], // Extract type from targetId (e.g., "bio-user123" -> "bio")
        emoji
      );
      // Refetch reactions to update the UI
      await refetchReactions();
      toast.success("Reaction added!");
    } catch (error) {
      console.error("Failed to add reaction:", error);
      toast.error("Failed to add reaction");
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

  // Convert profile data to User format for ProfileView component
  const userForProfileView: User = {
    id: profileUserData.id,
    name: profileUserData.name,
    avatar: profileUserData.image,
    bio: profileUserData.bio || '',
    major: profileUserData.major || 'Undeclared',
    year: (profileUserData.year as any) || 'Freshman',
    interests: profileModules
      .filter(m => m.visible)
      .map(m => m.title)
      .slice(0, 5), // Show first 5 modules as interests
    isOnline: false,
  };

  // If viewing another user's profile and they are matched, show ProfileView component
  if (permission === "view" && isMatched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background from-30% to-primary flex flex-col">
        <div className="pl-10 pt-4 flex gap-3">
          <Button
            onClick={handleGoHome}
            className="w-auto flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white hover:cursor-pointer"
            size="lg"
          >
            <Home size={18} />
            Dashboard
          </Button>
          <Button
            onClick={handleMessage}
            className="w-auto flex items-center gap-2 bg-primary hover:bg-[#a19072] text-white hover:cursor-pointer"
            size="lg"
          >
            <MessageCircle size={18} />
            Message {profileUserData.name}
          </Button>
        </div>
        <div className="flex-1">
          <ProfileView
            user={userForProfileView}
            reactions={reactions}
            onReaction={handleReaction}
          />
        </div>
        <PurdueTrainHeader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background from-30% to-primary flex flex-col">
      <div className="pl-10 pt-4 flex gap-3">
        <Button
          onClick={handleGoHome}
          className="w-auto flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white hover:cursor-pointer"
          size="lg"
        >
          <Home size={18} />
          Dashboard
        </Button>
        {permission == "view" && !isMatched && (
          <div className = "ml-4 text-3xl">Welcome to {profileUserData.name}'s profile!</div>
        )}
      </div>
      <div className="flex flex-1 justify-center w-full pr-10 pl-10 pt-4 gap-3">
        <Card className="w-full flex-1">
          <CardContent>
            <div className="pb-4 border-b">
              <Label className="text-6xl inline-block">
                {profileUserData.name || "Anonymous User"}
              </Label>
              {userAge && (
                <Label className="text-5xl text-gray-700 inline-block ml-4">
                  {userAge}
                </Label>
              )}
              <Label className="text-3xl text-gray-500">
                {profileUserData.major || "Undeclared"} • {profileUserData.year || "Freshman"}
              </Label>
            </div>
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
            {permission === "edit" && hasChanged && !isLoading && (
              <Button 
                onClick={handleBioSave}
                className="mt-4 hover:bg-[#a19072] text-white hover:cursor-pointer"
              >
                <Save size={14} />
                Save Bio
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="flex-[2] flex flex-col">
          <CardContent className="h-full p-4">
            <ProfileModuleEditor 
              initialModules={profileModules}
              onSave={handleProfileSave}
              permission={permission}
            />
          </CardContent>
        </Card>
      </div>
      <PurdueTrainHeader />
    </div>
  );
}