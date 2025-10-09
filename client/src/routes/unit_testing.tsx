import { Card, CardContent } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import {
    testProfileDataIntegrity,
    testMessagingAndAPI,
    testEndCallFlow,
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
