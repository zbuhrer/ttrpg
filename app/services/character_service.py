class CharacterService:
    """Service class for managing character-related operations"""

    def __init__(self, ai_service=None):
        self.ai_service = ai_service
        self._base_attributes = {
            'strength': {'base': 10, 'modifier': 0, 'description': 'Physical power and carrying capacity'},
            'dexterity': {'base': 10, 'modifier': 0, 'description': 'Agility, reflexes, and balance'},
            'constitution': {'base': 10, 'modifier': 0, 'description': 'Health, stamina, and vital force'},
            'intelligence': {'base': 10, 'modifier': 0, 'description': 'Mental acuity, information recall, analytical skill'},
            'wisdom': {'base': 10, 'modifier': 0, 'description': 'Awareness, intuition, and insight'},
            'charisma': {'base': 10, 'modifier': 0, 'description': 'Force of personality, persuasiveness'},
        }

        self._race_features = {
            'Human': {
                'attribute_bonuses': {'all': 1},
                'abilities': ['Versatile', 'Quick Learner'],
                'description': 'Adaptable and ambitious, humans are diverse and ambitious',
                'cultural_traits': ['Various Cultural Backgrounds', 'Flexible Skill Training']
            },
            'Elf': {
                'attribute_bonuses': {'dexterity': 2, 'intelligence': 1},
                'abilities': ['Keen Senses', 'Fey Ancestry', 'Trance'],
                'description': 'Graceful and long-lived, with deep magical traditions',
                'cultural_traits': ['Natural Affinity for Magic', 'Enhanced Perception']
            },
            'Dwarf': {
                'attribute_bonuses': {'constitution': 2, 'wisdom': 1},
                'abilities': ['Darkvision', 'Dwarven Resilience'],
                'description': 'Hardy and traditional, masters of stone and metal',
                'cultural_traits': ['Stonecunning', 'Smith\'s Tools Proficiency']
            },
            'Halfling': {
                'attribute_bonuses': {'dexterity': 2, 'charisma': 1},
                'abilities': ['Lucky', 'Brave', 'Nimble'],
                'description': 'Small but resourceful, naturally stealthy',
                'cultural_traits': ['Halfling Nimbleness', 'Naturally Stealthy']
            },
            'Orc': {
                'attribute_bonuses': {'strength': 2, 'constitution': 1},
                'abilities': ['Powerful Build', 'Aggressive'],
                'description': 'Strong and enduring, with a warrior culture',
                'cultural_traits': ['Menacing', 'Relentless Endurance']
            },
            'Gnome': {
                'attribute_bonuses': {'intelligence': 2, 'dexterity': 1},
                'abilities': ['Gnome Cunning', 'Artificer\'s Lore'],
                'description': 'Inventive and curious, with natural magical talent',
                'cultural_traits': ['Tinker', 'Speak with Small Beasts']
            }
        }

        self._class_features = {
            'Warrior': {
                'hit_dice': 'd10',
                'primary_attributes': ['strength', 'constitution'],
                'starting_skills': ['Combat Training', 'Weapon Mastery'],
                'special_abilities': {
                    'Combat Stance': 'Enhanced defensive capabilities in battle',
                    'Weapon Specialization': 'Bonus damage with chosen weapon type'
                },
                'progression_path': [
                    {'level': 1, 'feature': 'Fighting Style'},
                    {'level': 2, 'feature': 'Action Surge'},
                    {'level': 3, 'feature': 'Martial Archetype'}
                ]
            },
            'Mage': {
                'hit_dice': 'd6',
                'primary_attributes': ['intelligence', 'wisdom'],
                'starting_skills': ['Arcana', 'Spellcasting'],
                'special_abilities': {
                    'Arcane Recovery': 'Recover spell slots on short rest',
                    'Spell Mastery': 'Cast certain spells without spell slots'
                },
                'progression_path': [
                    {'level': 1, 'feature': 'Spellcasting'},
                    {'level': 2, 'feature': 'Arcane Tradition'},
                    {'level': 3, 'feature': 'Cantrip Formulas'}
                ]
            },
            'Rogue': {
                'hit_dice': 'd8',
                'primary_attributes': ['dexterity', 'charisma'],
                'starting_skills': ['Stealth', 'Thieves\' Tools'],
                'special_abilities': {
                    'Sneak Attack': 'Extra damage when attacking with advantage',
                    'Cunning Action': 'Bonus action to Dash, Disengage, or Hide'
                },
                'progression_path': [
                    {'level': 1, 'feature': 'Expertise'},
                    {'level': 2, 'feature': 'Cunning Action'},
                    {'level': 3, 'feature': 'Roguish Archetype'}
                ]
            },
            'Cleric': {
                'hit_dice': 'd8',
                'primary_attributes': ['wisdom', 'charisma'],
                'starting_skills': ['Religion', 'Divine Magic'],
                'special_abilities': {
                    'Channel Divinity': 'Channel divine energy for various effects',
                    'Divine Domain': 'Specialized divine powers and spells'
                },
                'progression_path': [
                    {'level': 1, 'feature': 'Divine Domain'},
                    {'level': 2, 'feature': 'Channel Divinity'},
                    {'level': 3, 'feature': 'Domain Feature'}
                ]
            },
            'Ranger': {
                'hit_dice': 'd10',
                'primary_attributes': ['dexterity', 'wisdom'],
                'starting_skills': ['Survival', 'Nature'],
                'special_abilities': {
                    'Favored Enemy': 'Bonus damage against certain creature types',
                    'Natural Explorer': 'Expertise in navigating certain terrains'
                },
                'progression_path': [
                    {'level': 1, 'feature': 'Favored Enemy'},
                    {'level': 2, 'feature': 'Fighting Style'},
                    {'level': 3, 'feature': 'Ranger Conclave'}
                ]
            },
            'Paladin': {
                'hit_dice': 'd10',
                'primary_attributes': ['strength', 'charisma'],
                'starting_skills': ['Religion', 'Athletics'],
                'special_abilities': {
                    'Divine Smite': 'Channel divine energy into weapon attacks',
                    'Lay on Hands': 'Pool of healing energy'
                },
                'progression_path': [
                    {'level': 1, 'feature': 'Divine Sense'},
                    {'level': 2, 'feature': 'Fighting Style'},
                    {'level': 3, 'feature': 'Sacred Oath'}
                ]
            }
        }

        self._backgrounds = [
            "Noble",
            "Soldier",
            "Scholar",
            "Criminal",
            "Merchant",
            "Artisan"
        ]

    def get_races(self):
        """Return available character races"""
        return list(self._race_features.keys())

    def get_classes(self):
        """Return available character classes"""
        return list(self._class_features.keys())

    def get_backgrounds(self):
        """Return available character backgrounds"""
        return self._backgrounds

    def get_race_details(self, race_name):
        """Get detailed information about a specific race"""
        if race_name in self._race_features:
            return self._race_features[race_name]
        return None

    def get_class_details(self, class_name):
        """Get detailed information about a specific class"""
        if class_name in self._class_features:
            return self._class_features[class_name]
        return None

    def validate_character(self, character_data):
        """Validate character data"""
        required_fields = ['name', 'race', 'class_type', 'background']

        # Check required fields
        for field in required_fields:
            if field not in character_data:
                return False, f"Missing required field: {field}"

        # Validate race
        if character_data['race'] not in self._race_features:
            return False, "Invalid race selected"

        # Validate class
        if character_data['class_type'] not in self._class_features:
            return False, "Invalid class selected"

        # Validate background
        if character_data['background'] not in self._backgrounds:
            return False, "Invalid background selected"

        return True, "Character data valid"

    def calculate_starting_stats(self, class_type):
        """Calculate starting stats based on class"""
        return {k: v['base'] for k, v in self._base_attributes.items()}

    def get_starting_equipment(self, class_type):
        """Get starting equipment based on class"""
        equipment = {
            'Warrior': ['Longsword', 'Shield', 'Chain Mail', 'Adventurer\'s Pack'],
            'Mage': ['Staff', 'Spellbook', 'Component Pouch', 'Scholar\'s Pack'],
            'Rogue': ['Shortsword', 'Leather Armor', 'Thieves\' Tools', 'Burglar\'s Pack'],
            'Cleric': ['Mace', 'Scale Mail', 'Holy Symbol', 'Priest\'s Pack'],
            'Ranger': ['Longbow', 'Leather Armor', 'Explorer\'s Pack', 'Quiver'],
            'Paladin': ['Longsword', 'Chain Mail', 'Holy Symbol', 'Priest\'s Pack']
        }

        return equipment.get(class_type, ['Basic Equipment Pack'])

    def generate_background_story(self, character_data):
        """Use AI service to generate a character background story"""
        if not self.ai_service:
            return "Generic background story"

        prompt = f"""
        Generate a compelling background story for:
        Name: {character_data['name']}
        Race: {character_data['race']}
        Class: {character_data['class_type']}
        Background: {character_data['background']}

        Include:
        - Early life experiences
        - Motivation for adventuring
        - A defining moment or event
        - Connection to their chosen class and background
        """

        return self.ai_service.generate_response(prompt)

    def calculate_derived_stats(self, base_stats, race, class_type):
        """Calculate derived statistics like HP, defense, etc."""
        derived_stats = {
            'max_health': 0,
            'defense': 10,
            'initiative': 0,
            'movement_speed': 30
        }

        # Apply racial modifiers
        race_features = self._race_features.get(race, {})
        race_bonuses = race_features.get('attribute_bonuses', {})

        # Apply class features
        class_features = self._class_features.get(class_type, {})
        hit_dice = class_features.get('hit_dice', 'd8')

        # Calculate max health
        constitution_mod = (base_stats['constitution'] - 10) // 2
        hit_dice_value = int(hit_dice.replace('d', ''))
        derived_stats['max_health'] = hit_dice_value + constitution_mod

        # Calculate other derived stats
        derived_stats['initiative'] = (base_stats['dexterity'] - 10) // 2
        derived_stats['defense'] += (base_stats['dexterity'] - 10) // 2

        return derived_stats

    def finalize_character(self, temp_character):
        """Finalize character creation, applying racial/class bonuses and calculating stats."""
        character = temp_character.copy()

        # Apply racial attribute bonuses
        race = character['race']
        race_features = self._race_features.get(race, {})
        attribute_bonuses = race_features.get('attribute_bonuses', {})

        for attr, bonus in attribute_bonuses.items():
            if attr == 'all':
                for attribute in character['attributes']:
                    character['attributes'][attribute] += bonus
            else:
                character['attributes'][attr] += bonus

        # Calculate starting stats
        character['stats'] = character['attributes']

        # Calculate derived stats (HP, defense, etc.)
        derived_stats = self.calculate_derived_stats(
            character['stats'], character['race'], character['class_type'])
        # Merge derived stats into character dict
        character.update(derived_stats)

        # Get starting equipment
        character['inventory'] = self.get_starting_equipment(
            character['class_type'])

        return character
