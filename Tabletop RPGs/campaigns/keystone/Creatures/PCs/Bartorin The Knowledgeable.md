---
alias: Bartorin, The Knowledgeable
tags: Entity/Player-Character, Multiverse/D&D
cssclass: hcl, table, t-c, readable
statblock: true
STR: 12
DEX: 15
CON: 13
INT: 10
WIS: 16
CHA: 10
HP: 21
AC: 18
Speed: 30
Init: 2
alignment: lawful neutral
size: medium
type: 
subtype: human
hit_die: 1d8
proficiency: heavy armor
---

%%
STRmod:: `= round((this.STR - 10)/2 - 0.1)`
DEXmod:: `= round((this.DEX - 10)/2 - 0.1)`
CONmod:: `= round((this.CON - 10)/2 - 0.1)`
INTmod:: `= round((this.INT - 10)/2 - 0.1)`
WISmod:: `= round((this.WIS - 10)/2 - 0.1)`
CHAmod:: `= round((this.CHA - 10)/2 - 0.1)`
Creator:: Zach
Universe:: 
Campaign:: 
Adventure_Diary:: 
%%
<i>**Player: ` = this.Creator`**</i>


# Bartorin, The Knowledgeable
> *(Description:: I’ve read every book in the world’s greatest libraries—or I like to boast that I have. There’s nothing I like more than mysterious or lost information, especially regarding the planes or extra-dimensional travel. I obsess often over the abilities of those that can cast spells or have innate abilities to access elements and aspects of other planes. That is why I have found myself a best friend (and study subject) in a Water Genasi named Tempest.)*

||
----|:---:|
**Class** | [[../../../../5eSRD/Classes/Cleric#Class Features\|Cleric]]
**Level** | 3
**Race** | [[../../../../5eSRD/Races/Half-Elf\|Half-Elf]]
**[[../../../../5eSRD/Characterizations/Alignment\|Alignment]]** | Neutral Good 
**[[../../../../5eSRD/Characterizations/Backgrounds\|Backgrounds]]** | Sage/Researcher
# Stats
HP | AC | Speed | Initiative |
:---:|:---:|:---:|:---:|
|`= this.HP`|(AC:: 18)|(Speed:: 30)|(Init:: +2)

Hit Dice | Proficiency Bonus | Temp HP | 
:---:|:---:|:---:|
|(Hitdie:: 1d8)|heavy armor| 

Senses | \# |
---|---|
**Passive Perception**|(PassivePerception:: 15)
**Passive Investigation**|(PassiveInvestigation:: 12)
**Passive Insight**|(PassiveInsight:: 13)
**Darkvision**|60 ft

## [[../../../../5eSRD/Gameplay/Abilities|Abilities]]
STR | DEX | CON | INT | WIS | CHA ||
:---:|:----:|:----:|:---:|:---:|:---:|---|
`= this.STR`|`= this.DEX`|`= this.CON`|`= this.INT`|`= this.WIS`|`= this.CHA`| **Stats** |
`= this.STRmod`|`= this.DEXmod`|`= this.CONmod`|`= this.INTmod`|`= this.WISmod`|`= this.CHAmod`| **Modifier** |
|  |  |  |  |  |  | **Saving Throw** |

### [[../../../../5eSRD/Gameplay/Abilities#Skills|Skills]]
Prof| Bonus | Skill | Ability |
:--:|:--:|:--|:--
-|+`= this.DEXmod`| Acrobatics | DEX |
-|+`= this.WISmod`| Animal Handling | WIS |
P|+`= this.INTmod`| Arcana | INT |
-|+`= this.STRmod`| Athletics | STR |
P|+`= this.CHAmod`| Deception | CHA |
P|+`= this.INTmod`| History | INT |
-|+`= this.WISmod`| Insight | WIS |
-|+`= this.CHAmod`| Intimidation | CHA |
P|+`= this.INTmod`| Investigation | INT |
-|+`= this.WISmod`| Medicine | WIS |
-|+`= this.WISmod`| Nature | WIS |
P|+`= this.WISmod`| Perception | WIS |
-|+`= this.CHAmod`| Performance | CHA |
-|+`= this.CHAmod`| Persuasion | CHA |
P|+`= this.INTmod`| Religion | INT |
-|+`= this.DEXmod`| Sleight of Hand | DEX |
-|+`= this.DEXmod`| Stealth | DEX |
-|+`= this.WISmod`| Survival | WIS |

# Traits

**Darkvision.** You can see in darkness in shades of grey, up to 60ft. 
**Fey Ancestry.** You have advantage on saving throws against being charmed, and magic can’t put you to sleep.
**Skill Versitility.** You gain proficiency in two skills of your choice: *Perception, Deception.*
## Proficiencies
**Weapons.** Simple weapons.
**Armor.** Light, Medium, and Heavy Armor, and Shields. 
**Tools.** None.

## Languages
- Abyssal
- Celestial
- Common
- Elvish
- Infernal

# Actions

**Combat Actions.** Attack, Cast a Spell, Dash, Disengage, Dodge, Grapple, Help, Hide, Improvise, Ready, Search, Shove, Use an Object

**Unarmed Strike.** You can punch, kick, head-butt, or use a similar forceful blow and deal bludgeoning damage equal to 1 + STR modifier (` = this.STRmod`). `dice: d20`+3 to hit. Range/Area: 5ft reach. Instead of using a weapon to make a melee weapon attack, you can use an unarmed strike: a punch, kick, head-butt, or similar forceful blow (none of which count as weapons). On a hit, an unarmed strike deals bludgeoning damage equal to 1 + your Strength modifier. You are proficient with your unarmed strikes.

![[../../../../5eSRD/Classes/Cleric#Channel Divinity|Channel Divinity]]

**[[../../../../5eSRD/Spells/Spiritual Weapon|Spiritual Weapon]].** Cleric 2, range 60ft. `dice: 1d20`+5 to hit, `dice: 1d8+3` 1d8+` = this.WISmod` damage. 

**Two-Weapon Fighting.** When you take the Attack action and attack with a light melee weapon that you're holding in one hand, you can use a bonus action to attack with a different light melee weapon that you're holding in the other hand. You don't add your ability modifier to the damage of the bonus attack, unless that modifier is negative. If either weapon has the thrown property, you can throw the weapon, instead of making a melee attack with it.

## Spells

![[../../../../5eSRD/Classes/Cleric#Preparing and Casting Spells|Cleric]]

|     WIS mod      |
|:----------------:|
| ` = this.WISmod` |

| Level | Spell Slots | Prepared Spells |
|:-----:|:-----------:|:---------------:|
|  0th  |      3      |        3        |
|  1st  |      4      |        4        |
|  2nd  |      2      | 5                |

![[../../../../5eSRD/Spells/00 Spell Lists (Wikilinked)#Cleric Spells#Cantrips (0 Level)]]
![[../../../../5eSRD/Spells/00 Spell Lists (Wikilinked)#Cleric Spells#1st Level]]

# Equipment
| CP  | SP  | EP  | GP  | PP  |
| --- | --- | --- | --- | --- |
|     |     |     |     |     |

- 

# Description
> *"Short, even for a human, with dark brown hair and a thin goatee. I have pale pink skin, often wind-chapped or sunburnt from my time traveling in the desert with my Genasi companion. 
> 
> The red symbol on my white tunic advertises my alliances and training in the Domain of Life, belying trust and peace. The same symbology is painted on the scuffed face of the round shield which will either be strapped to my back or on my left forearm."*

###### Personality Traits

###### Ideals

###### Bonds

###### Flaws

---
# Statblock

```statblock
name: Bart the Knower
```