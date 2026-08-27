import { createClient } from "@deepgram/sdk";
import dotenv from "dotenv";
dotenv.config();
async function test() {
    console.log("Checking Deepgram API Key...");
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        console.error("No DEEPGRAM_API_KEY found in .env");
        process.exit(1);
    }
    const deepgram = createClient(apiKey);
    try {
        // Attempt to list projects to verify the key is valid
        const { result, error } = await deepgram.manage.getProjects();
        if (error) {
            console.error("Deepgram API Error:", error);
        }
        else {
            console.log("✅ Deepgram API is working!");
            console.log("Projects access:", result?.projects?.map((p) => p.name));
        }
    }
    catch (err) {
        console.error("Failed to connect to Deepgram:", err);
    }
}
test();
