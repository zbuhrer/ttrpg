import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import logger from "./logger";
import {
  insertCampaignSchema,
  insertCharacterSchema,
  insertQuestSchema,
  insertNpcSchema,
  insertLocationSchema,
  insertStoryBranchSchema,
  insertSessionNoteSchema,
  insertActivitySchema,
  insertMapSchema,
} from "../shared/schema";

function handleError(
  res: any,
  error: any,
  operation: string,
  defaultMessage: string = "Operation failed",
) {
  logger.error(
    "routes",
    `${operation} failed`,
    error instanceof Error ? error : new Error(String(error)),
    {
      operation,
      errorDetails:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    },
  );

  const status = error.status || error.statusCode || 500;
  const message = error.message || defaultMessage;
  res.status(status).json({ message });
}

export async function registerRoutes(app: Express): Promise<Server> {
  logger.info("routes", "Registering API routes...");

  // Campaigns
  app.get("/api/campaigns", async (_req, res) => {
    try {
      logger.debug("routes", "Fetching all campaigns");
      const campaigns = await storage.getCampaigns();
      logger.debug("routes", "Campaigns fetched successfully", {
        count: campaigns.length,
      });
      res.json(campaigns);
    } catch (error) {
      handleError(
        res,
        error,
        "GET /api/campaigns",
        "Failed to fetch campaigns",
      );
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Fetching campaign ${id}`);

      if (isNaN(id)) {
        logger.warn("routes", "Invalid campaign ID provided", {
          providedId: req.params.id,
        });
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        logger.warn("routes", `Campaign ${id} not found`);
        return res.status(404).json({ message: "Campaign not found" });
      }

      logger.debug("routes", `Campaign ${id} fetched successfully`, {
        campaignName: campaign.name,
      });
      res.json(campaign);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.id}`,
        "Failed to fetch campaign",
      );
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      logger.debug("routes", "Creating new campaign", { body: req.body });
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      logger.info("routes", "Campaign created successfully", {
        id: campaign.id,
        name: campaign.name,
      });
      res.status(201).json(campaign);
    } catch (error: any) {
      logger.debug("routes", "Request body", { body: req.body });
      logger.error(
        "routes",
        "Error creating campaign",
        new Error(error instanceof Error ? error.message : String(error)),
      );
      handleError(
        res,
        error,
        "POST /api/campaigns",
        "Failed to create campaign",
      );
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Updating campaign ${id}`, { body: req.body });

      if (isNaN(id)) {
        logger.warn("routes", "Invalid campaign ID for update", {
          providedId: req.params.id,
        });
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateCampaign(id, validatedData);

      if (!campaign) {
        logger.warn("routes", `Campaign ${id} not found for update`);
        return res.status(404).json({ message: "Campaign not found" });
      }

      logger.info("routes", `Campaign ${id} updated successfully`, {
        updatedFields: Object.keys(validatedData),
      });
      res.json(campaign);
    } catch (error) {
      handleError(
        res,
        error,
        `PUT /api/campaigns/${req.params.id}`,
        "Failed to update campaign",
      );
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Deleting campaign ${id}`);

      if (isNaN(id)) {
        logger.warn("routes", "Invalid campaign ID for deletion", {
          providedId: req.params.id,
        });
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const deleted = await storage.deleteCampaign(id);
      if (!deleted) {
        logger.warn("routes", `Campaign ${id} not found for deletion`);
        return res.status(404).json({ message: "Campaign not found" });
      }

      logger.info("routes", `Campaign ${id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      handleError(
        res,
        error,
        `DELETE /api/campaigns/${req.params.id}`,
        "Failed to delete campaign",
      );
    }
  });

  // Characters
  app.get("/api/campaigns/:campaignId/characters", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Fetching characters for campaign ${campaignId}`);

      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const characters = await storage.getCharacters(campaignId);
      logger.debug("routes", `Characters fetched for campaign ${campaignId}`, {
        count: characters.length,
      });
      res.json(characters);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/characters`,
        "Failed to fetch characters",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/characters", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Creating character for campaign ${campaignId}`, {
        body: req.body,
      });

      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const validatedData = insertCharacterSchema.parse({
        ...req.body,
        campaignId,
      });
      const character = await storage.createCharacter(validatedData);
      logger.info("routes", "Character created successfully", {
        id: character.id,
        name: character.name,
        campaignId,
      });
      res.status(201).json(character);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/characters`,
        "Failed to create character",
      );
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Updating character ${id}`, { body: req.body });

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const validatedData = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(id, validatedData);

      if (!character) {
        logger.warn("routes", `Character ${id} not found for update`);
        return res.status(404).json({ message: "Character not found" });
      }

      logger.info("routes", `Character ${id} updated successfully`);
      res.json(character);
    } catch (error) {
      handleError(
        res,
        error,
        `PUT /api/characters/${req.params.id}`,
        "Failed to update character",
      );
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Deleting character ${id}`);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const deleted = await storage.deleteCharacter(id);
      if (!deleted) {
        logger.warn("routes", `Character ${id} not found for deletion`);
        return res.status(404).json({ message: "Character not found" });
      }

      logger.info("routes", `Character ${id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      handleError(
        res,
        error,
        `DELETE /api/characters/${req.params.id}`,
        "Failed to delete character",
      );
    }
  });

  // Quests
  app.get("/api/campaigns/:campaignId/quests", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Fetching quests for campaign ${campaignId}`);
      const quests = await storage.getQuests(campaignId);
      logger.debug("routes", `Quests fetched for campaign ${campaignId}`, {
        count: quests.length,
      });
      res.json(quests);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/quests`,
        "Failed to fetch quests",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/quests", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Creating quest for campaign ${campaignId}`, {
        body: req.body,
      });
      const validatedData = insertQuestSchema.parse({
        ...req.body,
        campaignId,
      });
      const quest = await storage.createQuest(validatedData);
      logger.info("routes", "Quest created successfully", {
        id: quest.id,
        title: quest.title,
        campaignId,
      });
      res.status(201).json(quest);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/quests`,
        "Failed to create quest",
      );
    }
  });

  app.put("/api/quests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Updating quest ${id}`, { body: req.body });
      const validatedData = insertQuestSchema.partial().parse(req.body);
      const quest = await storage.updateQuest(id, validatedData);
      if (!quest) {
        logger.warn("routes", `Quest ${id} not found for update`);
        return res.status(404).json({ message: "Quest not found" });
      }
      logger.info("routes", `Quest ${id} updated successfully`);
      res.json(quest);
    } catch (error) {
      handleError(
        res,
        error,
        `PUT /api/quests/${req.params.id}`,
        "Failed to update quest",
      );
    }
  });

  app.delete("/api/quests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Deleting quest ${id}`);
      const deleted = await storage.deleteQuest(id);
      if (!deleted) {
        logger.warn("routes", `Quest ${id} not found for deletion`);
        return res.status(404).json({ message: "Quest not found" });
      }
      logger.info("routes", `Quest ${id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      handleError(
        res,
        error,
        `DELETE /api/quests/${req.params.id}`,
        "Failed to delete quest",
      );
    }
  });

  // NPCs
  app.get("/api/campaigns/:campaignId/npcs", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Fetching NPCs for campaign ${campaignId}`);
      const npcs = await storage.getNpcs(campaignId);
      logger.debug("routes", `NPCs fetched for campaign ${campaignId}`, {
        count: npcs.length,
      });
      res.json(npcs);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/npcs`,
        "Failed to fetch NPCs",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/npcs", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Creating NPC for campaign ${campaignId}`, {
        body: req.body,
      });
      const validatedData = insertNpcSchema.parse({
        ...req.body,
        campaignId,
      });
      const npc = await storage.createNpc(validatedData);
      logger.info("routes", "NPC created successfully", {
        id: npc.id,
        name: npc.name,
        campaignId,
      });
      res.status(201).json(npc);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/npcs`,
        "Failed to create NPC",
      );
    }
  });

  app.put("/api/npcs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Updating NPC ${id}`, { body: req.body });
      const validatedData = insertNpcSchema.partial().parse(req.body);
      const npc = await storage.updateNpc(id, validatedData);
      if (!npc) {
        logger.warn("routes", `NPC ${id} not found for update`);
        return res.status(404).json({ message: "NPC not found" });
      }
      logger.info("routes", `NPC ${id} updated successfully`);
      res.json(npc);
    } catch (error) {
      handleError(
        res,
        error,
        `PUT /api/npcs/${req.params.id}`,
        "Failed to update NPC",
      );
    }
  });

  app.delete("/api/npcs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Deleting NPC ${id}`);
      const deleted = await storage.deleteNpc(id);
      if (!deleted) {
        logger.warn("routes", `NPC ${id} not found for deletion`);
        return res.status(404).json({ message: "NPC not found" });
      }
      logger.info("routes", `NPC ${id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      handleError(
        res,
        error,
        `DELETE /api/npcs/${req.params.id}`,
        "Failed to delete NPC",
      );
    }
  });

  // Locations
  app.get("/api/campaigns/:campaignId/locations", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Fetching locations for campaign ${campaignId}`);
      const locations = await storage.getLocations(campaignId);
      logger.debug("routes", `Locations fetched for campaign ${campaignId}`, {
        count: locations.length,
      });
      res.json(locations);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/locations`,
        "Failed to fetch locations",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/locations", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Creating location for campaign ${campaignId}`, {
        body: req.body,
      });
      const validatedData = insertLocationSchema.parse({
        ...req.body,
        campaignId,
      });
      const location = await storage.createLocation(validatedData);
      logger.info("routes", "Location created successfully", {
        id: location.id,
        name: location.name,
        campaignId,
      });
      res.status(201).json(location);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/locations`,
        "Failed to create location",
      );
    }
  });

  // Maps
  app.get("/api/campaigns/:campaignId/maps", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Fetching maps for campaign ${campaignId}`);

      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const maps = await storage.getMaps(campaignId);
      logger.debug("routes", `Maps fetched for campaign ${campaignId}`, {
        count: maps.length,
      });
      res.json(maps);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/maps`,
        "Failed to fetch maps",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/maps", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Creating map for campaign ${campaignId}`, {
        body: req.body,
      });

      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const validatedData = insertMapSchema.parse({
        ...req.body,
        campaignId,
      });
      const map = await storage.createMap(validatedData);
      logger.info("routes", "Map created successfully", {
        id: map.id,
        name: map.name,
        campaignId,
      });
      res.status(201).json(map);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/maps`,
        "Failed to create map",
      );
    }
  });

  app.get("/api/maps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Fetching map ${id}`);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid map ID" });
      }

      const map = await storage.getMap(id);

      if (!map) {
        logger.warn("routes", `Map ${id} not found`);
        return res.status(404).json({ message: "Map not found" });
      }

      logger.debug("routes", `Map ${id} fetched successfully`);
      res.json(map);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/maps/${req.params.id}`,
        "Failed to fetch map",
      );
    }
  });

  app.put("/api/maps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Updating map ${id}`, { body: req.body });

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid map ID" });
      }

      const validatedData = insertMapSchema.partial().parse(req.body);
      const map = await storage.updateMap(id, validatedData);

      if (!map) {
        logger.warn("routes", `Map ${id} not found for update`);
        return res.status(404).json({ message: "Map not found" });
      }

      logger.info("routes", `Map ${id} updated successfully`);
      res.json(map);
    } catch (error) {
      handleError(
        res,
        error,
        `PUT /api/maps/${req.params.id}`,
        "Failed to update map",
      );
    }
  });

  app.delete("/api/maps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Deleting map ${id}`);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid map ID" });
      }

      const deleted = await storage.deleteMap(id);
      if (!deleted) {
        logger.warn("routes", `Map ${id} not found for deletion`);
        return res.status(404).json({ message: "Map not found" });
      }

      logger.info("routes", `Map ${id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      handleError(
        res,
        error,
        `DELETE /api/maps/${req.params.id}`,
        "Failed to delete map",
      );
    }
  });

  // Story Branches
  app.get("/api/campaigns/:campaignId/story-branches", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug(
        "routes",
        `Fetching story branches for campaign ${campaignId}`,
      );
      const storyBranches = await storage.getStoryBranches(campaignId);
      logger.debug(
        "routes",
        `Story branches fetched for campaign ${campaignId}`,
        { count: storyBranches.length },
      );
      res.json(storyBranches);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/story-branches`,
        "Failed to fetch story branches",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/story-branches", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug(
        "routes",
        `Creating story branch for campaign ${campaignId}`,
        { body: req.body },
      );
      const validatedData = insertStoryBranchSchema.parse({
        ...req.body,
        campaignId,
      });
      const storyBranch = await storage.createStoryBranch(validatedData);
      logger.info("routes", "Story branch created successfully", {
        id: storyBranch.id,
        title: storyBranch.title,
        campaignId,
      });
      res.status(201).json(storyBranch);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/story-branches`,
        "Failed to create story branch",
      );
    }
  });

  app.put("/api/story-branches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Updating story branch ${id}`, { body: req.body });
      const validatedData = insertStoryBranchSchema.partial().parse(req.body);
      const storyBranch = await storage.updateStoryBranch(id, validatedData);
      if (!storyBranch) {
        logger.warn("routes", `Story branch ${id} not found for update`);
        return res.status(404).json({ message: "Story branch not found" });
      }
      logger.info("routes", `Story branch ${id} updated successfully`);
      res.json(storyBranch);
    } catch (error) {
      handleError(
        res,
        error,
        `PUT /api/story-branches/${req.params.id}`,
        "Failed to update story branch",
      );
    }
  });

  // Session Notes
  app.get("/api/campaigns/:campaignId/session-notes", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug(
        "routes",
        `Fetching session notes for campaign ${campaignId}`,
      );
      const sessionNotes = await storage.getSessionNotes(campaignId);
      logger.debug(
        "routes",
        `Session notes fetched for campaign ${campaignId}`,
        { count: sessionNotes.length },
      );
      res.json(sessionNotes);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/session-notes`,
        "Failed to fetch session notes",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/session-notes", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug(
        "routes",
        `Creating session note for campaign ${campaignId}`,
        { body: req.body },
      );
      const validatedData = insertSessionNoteSchema.parse({
        ...req.body,
        campaignId,
      });
      const sessionNote = await storage.createSessionNote(validatedData);
      logger.info("routes", "Session note created successfully", {
        id: sessionNote.id,
        sessionNumber: sessionNote.sessionNumber,
        campaignId,
      });
      res.status(201).json(sessionNote);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/session-notes`,
        "Failed to create session note",
      );
    }
  });

  app.put("/api/session-notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug("routes", `Updating session note ${id}`, { body: req.body });
      const validatedData = insertSessionNoteSchema.partial().parse(req.body);
      const sessionNote = await storage.updateSessionNote(id, validatedData);
      if (!sessionNote) {
        logger.warn("routes", `Session note ${id} not found for update`);
        return res.status(404).json({ message: "Session note not found" });
      }
      logger.info("routes", `Session note ${id} updated successfully`);
      res.json(sessionNote);
    } catch (error) {
      handleError(
        res,
        error,
        `PUT /api/session-notes/${req.params.id}`,
        "Failed to update session note",
      );
    }
  });

  // Activities
  app.get("/api/campaigns/:campaignId/activities", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      logger.debug("routes", `Fetching activities for campaign ${campaignId}`, {
        limit,
      });
      const activities = await storage.getActivities(campaignId, limit);
      logger.debug("routes", `Activities fetched for campaign ${campaignId}`, {
        count: activities.length,
      });
      res.json(activities);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/activities`,
        "Failed to fetch activities",
      );
    }
  });

  app.post("/api/campaigns/:campaignId/activities", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      logger.debug("routes", `Creating activity for campaign ${campaignId}`, {
        body: req.body,
      });
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        campaignId,
      });
      const activity = await storage.createActivity(validatedData);
      logger.info("routes", "Activity created successfully", {
        id: activity.id,
        type: activity.type,
        campaignId,
      });
      res.status(201).json(activity);
    } catch (error) {
      handleError(
        res,
        error,
        `POST /api/campaigns/${req.params.campaignId}/activities`,
        "Failed to create activity",
      );
    }
  });

  // Search
  app.get("/api/campaigns/:campaignId/search", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const query = req.query.q as string;
      logger.debug("routes", `Searching campaign ${campaignId}`, { query });

      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = await storage.searchAll(campaignId, query);
      const totalResults =
        results.characters.length +
        results.quests.length +
        results.npcs.length +
        results.locations.length +
        results.sessionNotes.length;

      logger.debug("routes", `Search completed for campaign ${campaignId}`, {
        query,
        resultsCount: totalResults,
      });
      res.json(results);
    } catch (error) {
      handleError(
        res,
        error,
        `GET /api/campaigns/${req.params.campaignId}/search`,
        "Search failed",
      );
    }
  });

  // Dice roll endpoint
  app.post("/api/dice/roll", async (req, res) => {
    try {
      const { sides, count = 1, modifier = 0 } = req.body;
      logger.debug("routes", "Rolling dice", { sides, count, modifier });

      if (!sides || sides < 2) {
        logger.warn("routes", "Invalid dice roll parameters", {
          sides,
          count,
          modifier,
        });
        return res.status(400).json({ message: "Invalid dice sides" });
      }

      const rolls = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

      const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
      const result = { rolls, modifier, total, sides, count };

      logger.debug("routes", "Dice rolled successfully", result);
      res.json(result);
    } catch (error) {
      handleError(res, error, "POST /api/dice/roll", "Dice roll failed");
    }
  });

  logger.info("routes", "All API routes registered successfully");

  const httpServer = createServer(app);
  return httpServer;
}
