---
name: Torvald Ghier
alias: Torvald
tags: Entity/Player-Character, Multiverse/D&D
cssclass: hcl, table, t-c, readable
statblock: true
STR: 8
DEX: 16
CON: 16
INT: 16
WIS: 14
CHA: 14
hp: 13
ac: 13
Speed: 25
Init: 3
alignment: lawful neutral
size: small
race: 
type: 
subtype: human
hit_die: 1d10
proficiency: heavy armor
---

%%
STRmod:: `= round((this.STR - 10)/2 - 0.1)`
DEXmod:: `= round((this.DEX - 10)/2 - 0.1)`
CONmod:: `= round((this.CON - 10)/2 - 0.1)`
INTmod:: `= round((this.INT - 10)/2 - 0.1)`
WISmod:: `= round((this.WIS - 10)/2 - 0.1)`
CHAmod:: `= round((this.CHA - 10)/2 - 0.1)`
Creator:: Alex
Universe:: 
Campaign:: 
Adventure_Diary:: 
%%
<i>**Creator: ` = this.Creator`**
Universe: ` = this.Universe`
Capaign: ` = this.Campaign`</i>

# ` = this.alias` 
> (Description:: I come from a humble social rank, but believe I am destined for so much more. Already the people of my home village regard me as their champion, and my destiny has called me to stand against the tyrants and monsters that threaten the common folk everywhere.)

||
----|:---:|
**Class** | Ranger
**Level** | 1st
**Race** | [[../../../../5eSRD/Races/Gnome#Rock Gnome\|Rock Gnome]]
**Alignment** | ` = this.alignment`
**Background** | Folk Hero


<div style="page-break-after: always;"></div>

# Stats
|      HP      |      AC      |      Speed      |   Initiative   |
|:------------:|:------------:|:---------------:|:--------------:|
| ` = this.hp` | ` = this.ac` | ` = this.speed` | ` = this.init` |

Hit Dice | Proficiency Bonus | Temp HP | 
:---:|:---:|:---:|
|` = this.hit_die`|` = this.proficiency`|

| Senses                    | \#                          |
| ------------------------- | --------------------------- |
| **Passive Perception**    | (PassivePerception:: 14)    |
| **Passive Investigation** | (PassiveInvestigation:: 13) |
| **Passive Insight**       | (PassiveInsight:: 12)       |
| **Darkvision**            | 60 ft                       |

## [[../5eSRD/Gameplay/Abilities#ABILITIES|Abilities]]
STR | DEX | CON | INT | WIS | CHA ||
:---:|:----:|:----:|:---:|:---:|:---:|---|
`= this.STR`|`= this.DEX`|`= this.CON`|`= this.INT`|`= this.WIS`|`= this.CHA`| **Stats** |
`= this.STRmod`|`= this.DEXmod`|`= this.CONmod`|`= this.INTmod`|`= this.WISmod`|`= this.CHAmod`| **Modifier** |
|  |  |  |  |  |  | **Saving Throw** |


<div style="page-break-after: always;"></div>

### [[../5eSRD/Gameplay/Abilities#Skills|Skills]]
Prof| Bonus | Skill | Ability |
:--:|:--:|:--|:--
-|+`= this.DEXmod`| Acrobatics | DEX |
+2 |+`= this.WISmod`| Animal Handling | WIS |
-|+`= this.INTmod`| Arcana | INT |
-|+`= this.STRmod`| Athletics | STR |
-|+`= this.CHAmod`| Deception | CHA |
-|+`= this.INTmod`| History | INT |
-|+`= this.WISmod`| Insight | WIS |
-|+`= this.CHAmod`| Intimidation | CHA |
-|+`= this.INTmod`| Investigation | INT |
-|+`= this.WISmod`| Medicine | WIS |
+2 |+`= this.WISmod`| Nature | WIS |
+2 |+`= this.WISmod`| Perception | WIS |
-|+`= this.CHAmod`| Performance | CHA |
-|+`= this.CHAmod`| Persuasion | CHA |
-|+`= this.INTmod`| Religion | INT |
-|+`= this.DEXmod`| Sleight of Hand | DEX |
-|+`= this.DEXmod`| Stealth | DEX |
+2 |+`= this.WISmod`| Survival | WIS |

<div style="page-break-after: always;"></div>

# Traits

## Proficiencies
**Armor:** Light armor, medium armor, shields  
**Weapons:** Simple weapons, martial weapons  
**Tools:** None  
**Saving Throws:** Strength, Dexterity  
**Skills:** Choose three from Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, and Survival:
- Nature 
- Perception
- Stealth


## ![[../../../../5eSRD/Classes/Ranger#Favored Enemy|Favored Enemy]]

### Favored Enemy: Constructs
**Constructs** are made, not born. Some are programmed by their creators to follow a simple set of instructions, while others are imbued with sentience and capable of independent thought. [[../../../../5eSRD/Treasure/Manual of Golems|Golems]] are the iconic constructs. Many creatures native to the outer plane of Mechanus, such as modrons, are constructs shaped from the raw material of the plane by the will of more powerful creatures.
## Languages


<div style="page-break-after: always;"></div>

# Actions

| ACTIONS | ATTACK | RANGE      | HIT            | DMG                | NOTES                                         |
| :------ | ------ | :--------: | :------------: | :----------------: | --------------------------------------------- |
| Dagger  | Melee  | 20(60)     | `dice: 1d20+5` | `dice: 1d4+3`1d4+3 | Simple, Finesse, Light, Thrown, Range (20/60) |
| Handaxe | Melee  | 20(60)     | `dice: 1d20+1` | `dice:1d6-1` 1d6-1 | Simple, Light, Thrown, Range (20/60)          |
| Unarmed | Melee  | 5ft. Reach | `dice:1d20+1`  | `dice: 0d0-1` 0d0  | lol                                           |

**Actions in Combat.** Attack, Cast a Spell, Dash, Disengage, Dodge, Grapple, Help, Hide, Improvise, Ready, Search, Shove, Use an Object

**Unarmed Strike.** You can punch, kick, head-butt, or use a similar forceful blow and deal bludgeoning damage equal to 1 + STR modifier

## BONUS ACTIONS
**Actions in Combat.** Two-Weapon Fighting

<div style="page-break-after: always;"></div>

## Spells
Level |Spell Slots | Prepared Spells |
:---:|:---:|:---:|
\# |||
\# |||
 
 

# Equipment
CP | SP | EP | GP | PP |
:---:|:---:|:---:|:---:|:---:|
|||||

- 

<div style="page-break-after: always;"></div>

# Personality
###### Personality Traits
I judge people by their actions, not their words. When I set my mind to something, I follow through no matter what gets in my way.
###### Ideals
Sincerity. There’s no good in pretending to be something I’m not. (Neutral)
###### Bonds
I have a family, but I have no idea where they are. One day, I hope to see them again. I protect those who cannot protect themselves.
###### Flaws
I have trouble trusting in my allies.