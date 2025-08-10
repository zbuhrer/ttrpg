import { 
  Campaign, InsertCampaign,
  Character, InsertCharacter,
  Quest, InsertQuest,
  Npc, InsertNpc,
  Location, InsertLocation,
  StoryBranch, InsertStoryBranch,
  SessionNote, InsertSessionNote,
  Activity, InsertActivity,
  campaigns, characters, quests, npcs, locations, storyBranches, sessionNotes, activities
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Characters
  getCharacters(campaignId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;

  // Quests
  getQuests(campaignId: number): Promise<Quest[]>;
  getQuest(id: number): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: number, quest: Partial<InsertQuest>): Promise<Quest | undefined>;
  deleteQuest(id: number): Promise<boolean>;

  // NPCs
  getNpcs(campaignId: number): Promise<Npc[]>;
  getNpc(id: number): Promise<Npc | undefined>;
  createNpc(npc: InsertNpc): Promise<Npc>;
  updateNpc(id: number, npc: Partial<InsertNpc>): Promise<Npc | undefined>;
  deleteNpc(id: number): Promise<boolean>;

  // Locations
  getLocations(campaignId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Story Branches
  getStoryBranches(campaignId: number): Promise<StoryBranch[]>;
  getStoryBranch(id: number): Promise<StoryBranch | undefined>;
  createStoryBranch(storyBranch: InsertStoryBranch): Promise<StoryBranch>;
  updateStoryBranch(id: number, storyBranch: Partial<InsertStoryBranch>): Promise<StoryBranch | undefined>;
  deleteStoryBranch(id: number): Promise<boolean>;

  // Session Notes
  getSessionNotes(campaignId: number): Promise<SessionNote[]>;
  getSessionNote(id: number): Promise<SessionNote | undefined>;
  createSessionNote(sessionNote: InsertSessionNote): Promise<SessionNote>;
  updateSessionNote(id: number, sessionNote: Partial<InsertSessionNote>): Promise<SessionNote | undefined>;
  deleteSessionNote(id: number): Promise<boolean>;

  // Activities
  getActivities(campaignId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Search
  searchAll(campaignId: number, query: string): Promise<{
    characters: Character[];
    quests: Quest[];
    npcs: Npc[];
    locations: Location[];
    sessionNotes: SessionNote[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns)
      .set({ ...campaign, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Characters
  async getCharacters(campaignId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.campaignId, campaignId));
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values(character).returning();
    return newCharacter;
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const [updated] = await db.update(characters)
      .set(character)
      .where(eq(characters.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Quests
  async getQuests(campaignId: number): Promise<Quest[]> {
    return await db.select().from(quests).where(eq(quests.campaignId, campaignId));
  }

  async getQuest(id: number): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest || undefined;
  }

  async createQuest(quest: InsertQuest): Promise<Quest> {
    const [newQuest] = await db.insert(quests).values(quest).returning();
    return newQuest;
  }

  async updateQuest(id: number, quest: Partial<InsertQuest>): Promise<Quest | undefined> {
    const [updated] = await db.update(quests)
      .set(quest)
      .where(eq(quests.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteQuest(id: number): Promise<boolean> {
    const result = await db.delete(quests).where(eq(quests.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // NPCs
  async getNpcs(campaignId: number): Promise<Npc[]> {
    return await db.select().from(npcs).where(eq(npcs.campaignId, campaignId));
  }

  async getNpc(id: number): Promise<Npc | undefined> {
    const [npc] = await db.select().from(npcs).where(eq(npcs.id, id));
    return npc || undefined;
  }

  async createNpc(npc: InsertNpc): Promise<Npc> {
    const [newNpc] = await db.insert(npcs).values(npc).returning();
    return newNpc;
  }

  async updateNpc(id: number, npc: Partial<InsertNpc>): Promise<Npc | undefined> {
    const [updated] = await db.update(npcs)
      .set(npc)
      .where(eq(npcs.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteNpc(id: number): Promise<boolean> {
    const result = await db.delete(npcs).where(eq(npcs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Locations
  async getLocations(campaignId: number): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.campaignId, campaignId));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const [updated] = await db.update(locations)
      .set(location)
      .where(eq(locations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Story Branches
  async getStoryBranches(campaignId: number): Promise<StoryBranch[]> {
    return await db.select().from(storyBranches).where(eq(storyBranches.campaignId, campaignId));
  }

  async getStoryBranch(id: number): Promise<StoryBranch | undefined> {
    const [storyBranch] = await db.select().from(storyBranches).where(eq(storyBranches.id, id));
    return storyBranch || undefined;
  }

  async createStoryBranch(storyBranch: InsertStoryBranch): Promise<StoryBranch> {
    const values = { 
      ...storyBranch, 
      activatedAt: storyBranch.status === 'active' ? new Date() : null 
    };
    const [newStoryBranch] = await db.insert(storyBranches).values(values).returning();
    return newStoryBranch;
  }

  async updateStoryBranch(id: number, storyBranch: Partial<InsertStoryBranch>): Promise<StoryBranch | undefined> {
    const existing = await this.getStoryBranch(id);
    if (!existing) return undefined;
    
    const values = { 
      ...storyBranch,
      activatedAt: storyBranch.status === 'active' && existing.status !== 'active' 
        ? new Date() 
        : existing.activatedAt
    };
    
    const [updated] = await db.update(storyBranches)
      .set(values)
      .where(eq(storyBranches.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStoryBranch(id: number): Promise<boolean> {
    const result = await db.delete(storyBranches).where(eq(storyBranches.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Session Notes
  async getSessionNotes(campaignId: number): Promise<SessionNote[]> {
    return await db.select().from(sessionNotes)
      .where(eq(sessionNotes.campaignId, campaignId))
      .orderBy(desc(sessionNotes.sessionNumber));
  }

  async getSessionNote(id: number): Promise<SessionNote | undefined> {
    const [sessionNote] = await db.select().from(sessionNotes).where(eq(sessionNotes.id, id));
    return sessionNote || undefined;
  }

  async createSessionNote(sessionNote: InsertSessionNote): Promise<SessionNote> {
    const [newSessionNote] = await db.insert(sessionNotes).values(sessionNote).returning();
    return newSessionNote;
  }

  async updateSessionNote(id: number, sessionNote: Partial<InsertSessionNote>): Promise<SessionNote | undefined> {
    const [updated] = await db.update(sessionNotes)
      .set(sessionNote)
      .where(eq(sessionNotes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSessionNote(id: number): Promise<boolean> {
    const result = await db.delete(sessionNotes).where(eq(sessionNotes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Activities
  async getActivities(campaignId: number, limit = 50): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.campaignId, campaignId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Search
  async searchAll(campaignId: number, query: string): Promise<{
    characters: Character[];
    quests: Quest[];
    npcs: Npc[];
    locations: Location[];
    sessionNotes: SessionNote[];
  }> {
    const searchPattern = `%${query}%`;
    
    const searchedCharacters = await db.select().from(characters)
      .where(and(
        eq(characters.campaignId, campaignId),
        or(
          ilike(characters.name, searchPattern),
          ilike(characters.race, searchPattern),
          ilike(characters.characterClass, searchPattern),
          ilike(characters.notes, searchPattern)
        )
      ));

    const searchedQuests = await db.select().from(quests)
      .where(and(
        eq(quests.campaignId, campaignId),
        or(
          ilike(quests.title, searchPattern),
          ilike(quests.description, searchPattern),
          ilike(quests.notes, searchPattern)
        )
      ));

    const searchedNpcs = await db.select().from(npcs)
      .where(and(
        eq(npcs.campaignId, campaignId),
        or(
          ilike(npcs.name, searchPattern),
          ilike(npcs.role, searchPattern),
          ilike(npcs.location, searchPattern),
          ilike(npcs.description, searchPattern)
        )
      ));

    const searchedLocations = await db.select().from(locations)
      .where(and(
        eq(locations.campaignId, campaignId),
        or(
          ilike(locations.name, searchPattern),
          ilike(locations.type, searchPattern),
          ilike(locations.description, searchPattern)
        )
      ));

    const searchedSessionNotes = await db.select().from(sessionNotes)
      .where(and(
        eq(sessionNotes.campaignId, campaignId),
        or(
          ilike(sessionNotes.title, searchPattern),
          ilike(sessionNotes.content, searchPattern)
        )
      ));

    return { 
      characters: searchedCharacters, 
      quests: searchedQuests, 
      npcs: searchedNpcs, 
      locations: searchedLocations, 
      sessionNotes: searchedSessionNotes 
    };
  }
}

export const storage = new DatabaseStorage();
