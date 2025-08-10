import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCampaignSchema, 
  insertCharacterSchema, 
  insertQuestSchema, 
  insertNpcSchema, 
  insertLocationSchema, 
  insertStoryBranchSchema, 
  insertSessionNoteSchema, 
  insertActivitySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Invalid campaign data" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateCampaign(id, validatedData);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Invalid campaign data" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCampaign(id);
      if (!deleted) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Characters
  app.get("/api/campaigns/:campaignId/characters", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const characters = await storage.getCharacters(campaignId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.post("/api/campaigns/:campaignId/characters", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const validatedData = insertCharacterSchema.parse({
        ...req.body,
        campaignId,
      });
      const character = await storage.createCharacter(validatedData);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ message: "Invalid character data" });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(id, validatedData);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(400).json({ message: "Invalid character data" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCharacter(id);
      if (!deleted) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character" });
    }
  });

  // Quests
  app.get("/api/campaigns/:campaignId/quests", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const quests = await storage.getQuests(campaignId);
      res.json(quests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quests" });
    }
  });

  app.post("/api/campaigns/:campaignId/quests", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const validatedData = insertQuestSchema.parse({
        ...req.body,
        campaignId,
      });
      const quest = await storage.createQuest(validatedData);
      res.status(201).json(quest);
    } catch (error) {
      res.status(400).json({ message: "Invalid quest data" });
    }
  });

  app.put("/api/quests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertQuestSchema.partial().parse(req.body);
      const quest = await storage.updateQuest(id, validatedData);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      res.status(400).json({ message: "Invalid quest data" });
    }
  });

  app.delete("/api/quests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Quest not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quest" });
    }
  });

  // NPCs
  app.get("/api/campaigns/:campaignId/npcs", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const npcs = await storage.getNpcs(campaignId);
      res.json(npcs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch NPCs" });
    }
  });

  app.post("/api/campaigns/:campaignId/npcs", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const validatedData = insertNpcSchema.parse({
        ...req.body,
        campaignId,
      });
      const npc = await storage.createNpc(validatedData);
      res.status(201).json(npc);
    } catch (error) {
      res.status(400).json({ message: "Invalid NPC data" });
    }
  });

  app.put("/api/npcs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNpcSchema.partial().parse(req.body);
      const npc = await storage.updateNpc(id, validatedData);
      if (!npc) {
        return res.status(404).json({ message: "NPC not found" });
      }
      res.json(npc);
    } catch (error) {
      res.status(400).json({ message: "Invalid NPC data" });
    }
  });

  app.delete("/api/npcs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNpc(id);
      if (!deleted) {
        return res.status(404).json({ message: "NPC not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete NPC" });
    }
  });

  // Locations
  app.get("/api/campaigns/:campaignId/locations", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const locations = await storage.getLocations(campaignId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.post("/api/campaigns/:campaignId/locations", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const validatedData = insertLocationSchema.parse({
        ...req.body,
        campaignId,
      });
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  // Story Branches
  app.get("/api/campaigns/:campaignId/story-branches", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const storyBranches = await storage.getStoryBranches(campaignId);
      res.json(storyBranches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story branches" });
    }
  });

  app.post("/api/campaigns/:campaignId/story-branches", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const validatedData = insertStoryBranchSchema.parse({
        ...req.body,
        campaignId,
      });
      const storyBranch = await storage.createStoryBranch(validatedData);
      res.status(201).json(storyBranch);
    } catch (error) {
      res.status(400).json({ message: "Invalid story branch data" });
    }
  });

  app.put("/api/story-branches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStoryBranchSchema.partial().parse(req.body);
      const storyBranch = await storage.updateStoryBranch(id, validatedData);
      if (!storyBranch) {
        return res.status(404).json({ message: "Story branch not found" });
      }
      res.json(storyBranch);
    } catch (error) {
      res.status(400).json({ message: "Invalid story branch data" });
    }
  });

  // Session Notes
  app.get("/api/campaigns/:campaignId/session-notes", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const sessionNotes = await storage.getSessionNotes(campaignId);
      res.json(sessionNotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session notes" });
    }
  });

  app.post("/api/campaigns/:campaignId/session-notes", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const validatedData = insertSessionNoteSchema.parse({
        ...req.body,
        campaignId,
      });
      const sessionNote = await storage.createSessionNote(validatedData);
      res.status(201).json(sessionNote);
    } catch (error) {
      res.status(400).json({ message: "Invalid session note data" });
    }
  });

  app.put("/api/session-notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSessionNoteSchema.partial().parse(req.body);
      const sessionNote = await storage.updateSessionNote(id, validatedData);
      if (!sessionNote) {
        return res.status(404).json({ message: "Session note not found" });
      }
      res.json(sessionNote);
    } catch (error) {
      res.status(400).json({ message: "Invalid session note data" });
    }
  });

  // Activities
  app.get("/api/campaigns/:campaignId/activities", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(campaignId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/campaigns/:campaignId/activities", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        campaignId,
      });
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Search
  app.get("/api/campaigns/:campaignId/search", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = await storage.searchAll(campaignId, query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Dice roll endpoint
  app.post("/api/dice/roll", async (req, res) => {
    try {
      const { sides, count = 1, modifier = 0 } = req.body;
      
      if (!sides || sides < 2) {
        return res.status(400).json({ message: "Invalid dice sides" });
      }

      const rolls = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

      const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

      res.json({
        rolls,
        modifier,
        total,
        sides,
        count,
      });
    } catch (error) {
      res.status(500).json({ message: "Dice roll failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
