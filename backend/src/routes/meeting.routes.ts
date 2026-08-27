import { Router, Request, Response } from "express";
import { MeetingService } from "../meeting/meeting.service.js";

export function createMeetingRouter(meetingService: MeetingService): Router {
  const router = Router();

  router.post("/", (req: Request, res: Response) => {
    try {
      const { name, hostName } = req.body;
      const meeting = meetingService.createMeeting({ name, hostName });
      return res.status(201).json(meeting);
    } catch (err) {
      console.error("[api] Create meeting error:", err);
      return res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  router.get("/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const meeting = meetingService.getMeeting(id);
      if (!meeting) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      return res.json(meeting);
    } catch (err) {
      console.error("[api] Fetch meeting error:", err);
      return res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  return router;
}
