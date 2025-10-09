import { Card, CardContent } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import {
    testProfileDataIntegrity,
    testMessagingAndAPI,
    testEndCallFlow,
    testFeedback,
    testMatchSearch,
    testProfileOnCall,
    testMatchingOptions,
    testViewingProfiles,
    UnitTestModule,
    type UnitTestType
} from "@/components/UnitTest";

export const Route = createFileRoute("/unit_testing")({
  component: RouteComponent,
});

function RouteComponent() {

    const unitTests: UnitTestType[] = [
        {
            id: 1,
            name: "Profile Modification Tests",
            count: 9,
            func: testProfileDataIntegrity,
        },
        {
            id: 2,
            name: "Messaging & API Endpoints",
            count: 3,
            func: testMessagingAndAPI,
        },
        {
            id: 3,
            name: "End Call UI & Home Page Summaries",
            count: 4,
            func: testEndCallFlow,
        },
        {
            id: 4,
            name: "Feedback Functionality",
            count: 3,
            func: testFeedback,
        },
        {
            id: 5,
            name: "Match Search & Filtering",
            count: 3,
            func: testMatchSearch,
        },
        {
            id: 6,
            name: "Profile Info During Call",
            count: 3,
            func: testProfileOnCall,
        },
        {
            id: 7,
            name: "Matching Options",
            count: 3,
            func: testMatchingOptions,
        },
        {
            id: 8,
            name: "Viewing Other Profiles",
            count: 5,
            func: testViewingProfiles,
        },
    ];

    return (
        <div className="flex flex-1 justify-center items-center w-full h-full bg-gradient-to-br from-background from-30% to-primary">
            <Card>
                <CardContent>
                    {unitTests.map(test => (
                        <UnitTestModule key = {test.id} test = {test}></UnitTestModule>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
