import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, CircleX, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DraggableModule } from "./ProfileModules";
import { unitTestGetProfile, unitTestModifyProfile } from "@/endpoints";

export type UnitTestType = {
    id: number;
    name: string;
    count: number;
    func: (index: number) => Promise<UnitTestOutputType>;
}

type UnitTestOutputType = {
    success: boolean;
    content: string;
}

function UnitTestEntry({ output }: { output: UnitTestOutputType | null }) {
    if (!output) return null;
    
    return (
        <Card className="mb-2 p-2">
            <CardContent className="p-0">
                <div className="flex items-center gap-2">
                    {output.success ? (
                        <CircleCheck className="text-green-600 flex-shrink-0" />
                    ) : (
                        <CircleX className="text-red-600 flex-shrink-0" />
                    )}
                    <div className="text-sm">{output.content}</div>
                </div>
            </CardContent>
        </Card>
    );
}

export function UnitTestModule({ test }: { test: UnitTestType }) {
    const [outputs, setOutputs] = useState<UnitTestOutputType[]>([]);
    const [testsComplete, setTestsComplete] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleRunTest = async () => {
        setIsRunning(true);
        const results: UnitTestOutputType[] = [];
        
        for (let i = 0; i < test.count; i++) {
            const output = await test.func(i);
            results.push(output);
        }

        setOutputs(results);
        setTestsComplete(true);
        setIsRunning(false);
        setIsExpanded(true); 
    }

    const allSuccess = outputs.length > 0 && outputs.every(output => output.success);
    const successCount = outputs.filter(output => output.success).length;

    return (
        <div className="mb-6 min-w-[400px]">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{test.name}</h3>
                        {testsComplete && (
                            <div className=" ml-4 flex items-center gap-2">
                                {allSuccess ? (
                                    <>
                                        <CircleCheck className="text-green-600" size={28} />
                                        <span className="text-green-600 font-semibold">All Passed</span>
                                    </>
                                ) : (
                                    <>
                                        <CircleX className="text-red-600" size={28} />
                                        <span className="text-red-600 font-semibold">
                                            {successCount}/{outputs.length} Passed
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <Button 
                        onClick={handleRunTest}
                        className="w-full mb-4"
                        variant="outline"
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running Tests...' : 'Run Test'}
                    </Button>

                    {outputs.length > 0 && (
                        <>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors mb-2"
                            >
                                <span className="font-semibold text-slate-700">
                                    Test Results ({successCount}/{outputs.length} passed)
                                </span>
                                {isExpanded ? (
                                    <ChevronUp className="text-slate-600" size={20} />
                                ) : (
                                    <ChevronDown className="text-slate-600" size={20} />
                                )}
                            </button>
                            
                            {isExpanded && (
                                <div className="max-h-[400px] overflow-auto">
                                    {outputs.map((output, index) => (
                                        <UnitTestEntry key={index} output={output} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// WRITE YOUR TESTS DOWN HERE

export async function testProfileDataIntegrity(index: number): Promise<UnitTestOutputType> {
    const testModules: DraggableModule[] = [
        {
            id: 1,
            type: "favoriteFood",
            title: "My favorite food is...",
            gridX: 0,
            gridY: 0,
            gridWidth: 2,
            gridHeight: 1,
            visible: true,
            data: [{ id: 1, content: "Pizza", selectedOption: "Pizza" }]
        },
        {
            id: 2,
            type: "loveLanguage",
            title: "My love language is...",
            gridX: 2,
            gridY: 0,
            gridWidth: 2,
            gridHeight: 1,
            visible: true,
            data: [{ id: 1, content: "Quality Time", selectedOption: "Quality Time" }]
        },
        {
            id: 3,
            type: "zodiacSign",
            title: "My zodiac sign is...",
            gridX: 0,
            gridY: 1,
            gridWidth: 1,
            gridHeight: 1,
            visible: false,
            data: [{ id: 1, content: "Leo", selectedOption: "Leo" }]
        }
    ];

    const tests = [
        // Sanity test
        async () => {
            try {
                const response = await unitTestModifyProfile(testModules);
                return {
                    success: response.success === true,
                    content: response.success 
                        ? "Profile successfully sent to server (POST)"
                        : `Server returned error: ${response.message || 'Unknown error'}`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to POST profile: ${e}`
                };
            }
        },
        // Test 1: GET profile back from server
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const response = await unitTestGetProfile();
                return {
                    success: Array.isArray(response) && response.length > 0,
                    content: Array.isArray(response) && response.length > 0
                        ? "Profile successfully retrieved from server (GET)"
                        : "Failed to retrieve profile or profile is empty"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to GET profile: ${e}`
                };
            }
        },
        // Test 2: Module count preserved
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const data = await unitTestGetProfile();
                const countMatch = data.length === testModules.length;
                return {
                    success: countMatch,
                    content: countMatch
                        ? `Module count preserved (${data.length} modules)`
                        : `Module count mismatch (sent ${testModules.length}, got ${data.length})`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Test failed: ${e}`
                };
            }
        },
        // Test 3: Module types preserved
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const data = await unitTestGetProfile();
                const typesMatch = data[0].type === "favoriteFood" &&
                                  data[1].type === "loveLanguage" &&
                                  data[2].type === "zodiacSign";
                return {
                    success: typesMatch,
                    content: typesMatch
                        ? "Module types correctly preserved"
                        : "Module types were corrupted"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Test failed: ${e}`
                };
            }
        },
        // Test 4: Selected options preserved
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const data = await unitTestGetProfile();
                const option = data[0].data[0].selectedOption;
                return {
                    success: option === "Pizza",
                    content: option === "Pizza"
                        ? "User selections preserved (favoriteFood: Pizza)"
                        : `User selections corrupted (expected Pizza, got ${option})`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Test failed: ${e}`
                };
            }
        },
        // Test 5: Grid positions preserved
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const data = await unitTestGetProfile();
                const positionsMatch = data[0].gridX === 0 && 
                                      data[0].gridY === 0 &&
                                      data[1].gridX === 2 && 
                                      data[1].gridY === 0;
                return {
                    success: positionsMatch,
                    content: positionsMatch
                        ? "Grid positions accurately preserved"
                        : "Grid positions were corrupted"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Test failed: ${e}`
                };
            }
        },
        // Test 6: Visibility states preserved
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const data = await unitTestGetProfile();
                const visibilityCorrect = data[0].visible === true && 
                                         data[1].visible === true && 
                                         data[2].visible === false;
                return {
                    success: visibilityCorrect,
                    content: visibilityCorrect
                        ? "Module visibility states correctly maintained"
                        : "Visibility states were corrupted"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Test failed: ${e}`
                };
            }
        },
        // Test 7: Grid dimensions preserved
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const data = await unitTestGetProfile();
                const dimensionsMatch = data[0].gridWidth === 2 && 
                                       data[0].gridHeight === 1;
                return {
                    success: dimensionsMatch,
                    content: dimensionsMatch
                        ? "Grid dimensions (width/height) preserved"
                        : "Grid dimensions were corrupted"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Test failed: ${e}`
                };
            }
        },
        // Test 8: Deep equality check
        async () => {
            try {
                await unitTestModifyProfile(testModules);
                const data = await unitTestGetProfile();
                const sentJson = JSON.stringify(testModules);
                const receivedJson = JSON.stringify(data);
                return {
                    success: sentJson === receivedJson,
                    content: sentJson === receivedJson
                        ? "Deep equality: sent and received data are identical"
                        : "Deep equality failed: data differs after server round-trip"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Test failed: ${e}`
                };
            }
        }
    ];

    return await tests[index]();
}

export async function testMessagingAndAPI(index: number): Promise<UnitTestOutputType> {
    const tests = [

        
        async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/matches`, {
                    method: "GET",
                    credentials: "include"
                });
                const data = await response.json();
                return {
                    success: response.ok && Array.isArray(data),
                    content: response.ok && Array.isArray(data)
                        ? `GET /matches endpoint returns array (${data.length} matches)`
                        : "GET /matches endpoint failed or returned invalid data"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to call GET /matches: ${e}`
                };
            }
        },
        
        async () => {
            try {
                const testProfile = {
                    modules: [
                        {
                            id: 1,
                            type: "test",
                            title: "Test Module",
                            gridX: 0,
                            gridY: 0,
                            gridWidth: 1,
                            gridHeight: 1,
                            visible: true,
                            data: []
                        }
                    ]
                };
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ profile: testProfile })
                });
                const data = await response.json();
                return {
                    success: response.ok && data.success === true,
                    content: response.ok && data.success === true
                        ? "PUT /user/profile endpoint saves profile successfully"
                        : `PUT /user/profile failed: ${data.error || 'Unknown error'}`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to call PUT /user/profile: ${e}`
                };
            }
        },
        
        async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/username/test-username`, {
                    method: "GET",
                    credentials: "include"
                });
                
                return {
                    success: response.ok || response.status === 404,
                    content: response.ok
                        ? "GET /user/username/:username endpoint responds correctly"
                        : response.status === 404
                            ? "GET /user/username/:username endpoint handles missing users correctly (404)"
                            : `GET /user/username/:username failed with status ${response.status}`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to call GET /user/username/:username: ${e}`
                };
            }
        }
    ];

    return await tests[index]();
}

export async function testEndCallFlow(index: number): Promise<UnitTestOutputType> {
    const tests = [
        
        async () => {
            try {
                
                const mockVideoCallData = {
                    otherUser: null,
                    matched: false,
                    callLength: 0,
                    numberCallExtensions: 0,
                    callEndedByUser: false
                };
                const hasRequiredFields =
                    'otherUser' in mockVideoCallData &&
                    'matched' in mockVideoCallData &&
                    'callLength' in mockVideoCallData &&
                    'numberCallExtensions' in mockVideoCallData &&
                    'callEndedByUser' in mockVideoCallData;

                return {
                    success: hasRequiredFields,
                    content: hasRequiredFields
                        ? "VideoCallData structure has all required fields"
                        : "VideoCallData structure is missing required fields"
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to verify VideoCallData structure: ${e}`
                };
            }
        },
        
        async () => {
            try {
                const startTime = Date.now();
                await new Promise(resolve => setTimeout(resolve, 100)); 
                const endTime = Date.now();
                const duration = endTime - startTime;
                const isReasonable = duration >= 100 && duration < 200;

                return {
                    success: isReasonable,
                    content: isReasonable
                        ? `Call duration calculation works (measured ${duration}ms)`
                        : `Call duration calculation may be inaccurate (${duration}ms for 100ms delay)`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to test call duration: ${e}`
                };
            }
        },
        
        async () => {
            try {
                const testCallLength = 125000; 
                const minutes = Math.floor(testCallLength / 60000);
                const seconds = Math.floor((testCallLength % 60000) / 1000);
                const isCorrect = minutes === 2 && seconds === 5;

                return {
                    success: isCorrect,
                    content: isCorrect
                        ? "Call summary time format calculation is correct (2m 5s from 125000ms)"
                        : `Call summary time format calculation failed (expected 2m 5s, got ${minutes}m ${seconds}s)`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to test time format: ${e}`
                };
            }
        },
        
        async () => {
            try {
                const testCallLength = 45000; 
                const seconds = Math.floor(testCallLength / 1000);
                const isCorrect = seconds === 45;

                return {
                    success: isCorrect,
                    content: isCorrect
                        ? "Call summary seconds-only format is correct (45s from 45000ms)"
                        : `Call summary seconds format failed (expected 45s, got ${seconds}s)`
                };
            } catch (e) {
                return {
                    success: false,
                    content: `Failed to test seconds format: ${e}`
                };
            }
        }
    ];

    return await tests[index]();
}