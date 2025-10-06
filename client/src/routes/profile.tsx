import { ProfileModuleContainer, ProfileModuleEditor } from "@/components/ProfileModules";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import type { DraggableModule } from "@/components/ProfileModules";


export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUserData } = authClient.useSession();

  const testProfileModules: DraggableModule[] = [
    {
      id: 1,
      type: 'favoriteFood',
      title: 'My favorite food is...',
      gridX: 0,
      gridY: 0,
      gridWidth: 2,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Tacos', selectedOption: 'Tacos' }]
    },
    {
      id: 2,
      type: 'diningHall',
      title: 'The best dining hall is...',
      gridX: 0,
      gridY: 1,
      gridWidth: 2,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Earhart', selectedOption: 'Earhart' }]
    },
    {
      id: 3,
      type: 'residence',
      title: 'I live in...',
      gridX: 2,
      gridY: 1,
      gridWidth: 2,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Hillenbrand', selectedOption: 'Hillenbrand' }]
    },
    {
      id: 4,
      type: 'studySpot',
      title: 'My favorite study spot is...',
      gridX: 4,
      gridY: 1,
      gridWidth: 2,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'WALC', selectedOption: 'WALC' }]
    },
    {
      id: 5,
      type: 'loveLanguage',
      title: 'My love language is...',
      gridX: 0,
      gridY: 2,
      gridWidth: 3,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Quality Time', selectedOption: 'Quality Time' }]
    },
    {
      id: 6,
      type: 'musicGenre',
      title: 'I listen to...',
      gridX: 3,
      gridY: 2,
      gridWidth: 3,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Hip Hop', selectedOption: 'Hip Hop' }]
    },
    {
      id: 7,
      type: 'morningPerson',
      title: 'I am a...',
      gridX: 0,
      gridY: 3,
      gridWidth: 2,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Night Owl', selectedOption: 'Night Owl' }]
    },
    {
      id: 8,
      type: 'purdueSpirit',
      title: 'Boiler Up means...',
      gridX: 2,
      gridY: 3,
      gridWidth: 2,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Everything', selectedOption: 'Everything' }]
    },
    {
      id: 9,
      type: 'relationshipStatus',
      title: 'My relationship status is...',
      gridX: 4,
      gridY: 3,
      gridWidth: 2,
      gridHeight: 1,
      visible: true,
      data: [{ id: 1, content: 'Single', selectedOption: 'Single' }]
    },
  ];

  const editable = true;

  // Handler for when the profile layout is saved
  const handleProfileSave = (modules: any) => {
    console.log('Saving profile layout:', modules);
    // TODO: Send to your backend/database
  };

  return (
    <div className = "flex flex-1 justify-center w-full h-full bg-gradient-to-br from-background from-30% to-primary p-10 gap-3">
      <Card className = "w-full flex-1">
        <CardContent>
          <div className = "pb-4 border-b">
            <Label className = "text-6xl inline-block">John Doe</Label>
            <Label className = "text-5xl text-gray-700 inline-block ml-4">18</Label>
            <Label className = "text-3xl text-gray-500">Computer Science • Freshman</Label>
          </div>
          <textarea 
            readOnly = {true} 
            value = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." 
            placeholder = "Write a bio about yourself..." 
            className = "w-full mt-8 resize-none max-h-full overflow-hidden field-sizing-content"
          />
        </CardContent>
      </Card>
      <Card className = "flex-[2]">
        <CardContent className = "h-full p-4">
          {/* New draggable module editor */}
          <ProfileModuleEditor 
            initialModules={testProfileModules}
            onSave={handleProfileSave}
            initialMode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}