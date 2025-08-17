import {
  pgTable,
  text,
  serial,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define a type for map items
const mapItemIcon = z.enum([
  "treasure_chest",
  "door",
  "key",
  "potion",
  "scroll",
  "sword",
  "shield",
  "wand",
  "skull",
  "book",
  "map_pin",
  "heart",
  "star",
  "cross",
  "question_mark",
  "exclamation_mark",
]);
export type MapItemIcon = z.infer<typeof mapItemIcon>;

const mapItem = z.object({
  id: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  name: z.string(),
  icon: mapItemIcon,
});
export type MapItem = z.infer<typeof mapItem>;

// Define and export CellType
export const cellType = z.enum([
  "empty",
  "wall",
  "door",
  "difficult",
  "water",
  "pit",
]);
export type CellType = z.infer<typeof cellType>;

// Define and export MapDataType
export const mapDataType = z.object({
  cells: z.record(z.string(), cellType).default({}),
  characters: z
    .record(z.string(), z.object({ name: z.string(), color: z.string() }))
    .default({}),
  items: z.record(z.string(), mapItem).default({}),
});
export type MapDataType = z.infer<typeof mapDataType>;

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  currentSession: integer("current_session").default(1),
  totalSessions: integer("total_sessions").default(0),
  activePlayers: integer("active_players").default(0),
  storyBranches: integer("story_branches").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  name: text("name").notNull(),
  race: text("race").notNull(),
  characterClass: text("character_class").notNull(),
  level: integer("level").default(1),
  currentHp: integer("current_hp").default(1),
  maxHp: integer("max_hp").default(1),
  currentXp: integer("current_xp").default(0),
  xpToNextLevel: integer("xp_to_next_level").default(300),
  armorClass: integer("armor_class").default(10),
  spellSlots: integer("spell_slots").default(0),
  maxSpellSlots: integer("max_spell_slots").default(0),
  abilities: jsonb("abilities").$type<Record<string, number>>().default({}),
  equipment: text("equipment").array().default([]),
  notes: text("notes"),
  portraitUrl: text("portrait_url"),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("in_progress"), // in_progress, completed, failed, optional
  priority: text("priority").default("normal"), // low, normal, high, urgent
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").default(100),
  objectives: text("objectives").array().default([]),
  completedObjectives: text("completed_objectives").array().default([]),
  reward: text("reward"),
  timeLimit: text("time_limit"),
  notes: text("notes"),
});

export const npcs = pgTable("npcs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  name: text("name").notNull(),
  role: text("role"), // merchant, ally, enemy, neutral, etc.
  location: text("location"),
  description: text("description"),
  relationships: jsonb("relationships")
    .$type<Record<string, string>>()
    .default({}),
  notes: text("notes"),
  portraitUrl: text("portrait_url"),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  name: text("name").notNull(),
  type: text("type"), // city, dungeon, wilderness, etc.
  description: text("description"),
  inhabitants: text("inhabitants").array().default([]),
  keyFeatures: text("key_features").array().default([]),
  notes: text("notes"),
  mapUrl: text("map_url"),
});

export const storyBranches = pgTable("story_branches", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  parentId: integer("parent_id"), // Nullable, for parent-child associations
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending, active, dormant, completed
  conditions: text("conditions").array().default([]),
  consequences: text("consequences").array().default([]),
  childBranchIds: jsonb("child_branch_ids").$type<number[]>().default([]), // Store IDs of child branches for visualization
  playerAlignment: text("player_alignment"), // all, majority, split
  assignedCharacters: text("assigned_characters").array().default([]), // character names assigned to this branch
  activatedAt: timestamp("activated_at"),
  notes: text("notes"),
});

export const sessionNotes = pgTable("session_notes", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  sessionNumber: integer("session_number").notNull(),
  title: text("title"),
  content: text("content"),
  keyEvents: text("key_events").array().default([]),
  playerDecisions: text("player_decisions").array().default([]),
  npcsIntroduced: text("npcs_introduced").array().default([]),
  questsUpdated: text("quests_updated").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  type: text("type").notNull(), // combat, level-up, quest_discovery, story_branch, etc.
  title: text("title").notNull(),
  description: text("description"),
  sessionNumber: integer("session_number"),
  characterId: integer("character_id"),
  relatedEntityType: text("related_entity_type"), // quest, npc, location, etc.
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maps = pgTable("maps", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  // mapData will store the grid, walls, interactive elements, and character positions
  // It will be a JSON object with a flexible structure.
  // The structure will be:
  // {
  //   cells: Record<string, CellType>;
  //   characters: Record<string, { name: string; color: string }>;
  //   items: Record<string, MapItem>; // custom items placed on the map
  // }
  mapData: jsonb("map_data")
    .$type<MapDataType>()
    .default({ cells: {}, characters: {}, items: {} }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
});

export const insertNpcSchema = createInsertSchema(npcs).omit({
  id: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertStoryBranchSchema = createInsertSchema(storyBranches).omit({
  id: true,
  activatedAt: true,
  childBranchIds: true, // childBranchIds will be managed by the system and updated separately
});

export const insertSessionNoteSchema = createInsertSchema(sessionNotes).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;

export type Npc = typeof npcs.$inferSelect;
export type InsertNpc = z.infer<typeof insertNpcSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type StoryBranch = typeof storyBranches.$inferSelect;
export type InsertStoryBranch = z.infer<typeof insertStoryBranchSchema>;

export type SessionNote = typeof sessionNotes.$inferSelect;
export type InsertSessionNote = z.infer<typeof insertSessionNoteSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Insert schemas
export const insertMapSchema = createInsertSchema(maps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Map = typeof maps.$inferSelect;
export type InsertMap = z.infer<typeof insertMapSchema>;
