import { Router } from "express";
import { authMiddleware } from "../middleware";

export const unitTestsRoute = Router();

const testProfileStorage = new Map<string, any[]>();

unitTestsRoute.post("/unit_testing/modify_profile", authMiddleware, async (req, res) => {
    try {
        const userId = res.locals.userId;
        const profileModules = req.body;
    
        if (!Array.isArray(profileModules)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid request body: expected an array of modules" 
            });
        }

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid userId: cancelled test" 
            });
        }

        testProfileStorage.set(userId, profileModules);
    
        res.status(200).json({ 
            success: true, 
            message: "Profile saved successfully",
            moduleCount: profileModules.length
        });
    } catch (error) {
        console.error("Error in modify_profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
});

unitTestsRoute.get("/unit_testing/get_profile", authMiddleware, async (req, res) => {
    try {
        const userId = res.locals.userId;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid userId: cancelled test" 
            });
        }

        const profileModules = testProfileStorage.get(userId);
    
        if (!profileModules) {
            return res.status(200).json([]);
        }
    
        res.status(200).json(profileModules);
    } catch (error) {
        console.error("Error in get_profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
});