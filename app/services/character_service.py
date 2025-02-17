class CharacterService:
    """Service class for managing character-related operations"""

    def __init__(self):
        self._races = [
            "Human",
            "Elf",
            "Dwarf",
            "Halfling",
            "Orc",
            "Gnome"
        ]

        self._classes = [
            "Warrior",
            "Mage",
            "Rogue",
            "Cleric",
            "Ranger",
            "Paladin"
        ]

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
        return self._races

    def get_classes(self):
        """Return available character classes"""
        return self._classes

    def get_backgrounds(self):
        """Return available character backgrounds"""
        return self._backgrounds

    def validate_character(self, character_data):
        """Validate character data"""
        required_fields = ['name', 'race', 'class_type', 'background']

        # Check required fields
        for field in required_fields:
            if field not in character_data:
                return False, f"Missing required field: {field}"

        # Validate race
        if character_data['race'] not in self._races:
            return False, "Invalid race selected"

        # Validate class
        if character_data['class_type'] not in self._classes:
            return False, "Invalid class selected"

        # Validate background
        if character_data['background'] not in self._backgrounds:
            return False, "Invalid background selected"

        return True, "Character data valid"

    def calculate_starting_stats(self, class_type):
        """Calculate starting stats based on class"""
        base_stats = {
            'strength': 10,
            'dexterity': 10,
            'constitution': 10,
            'intelligence': 10,
            'wisdom': 10,
            'charisma': 10
        }

        # Class-specific stat modifications
        class_modifiers = {
            'Warrior': {'strength': 2, 'constitution': 2},
            'Mage': {'intelligence': 2, 'wisdom': 2},
            'Rogue': {'dexterity': 2, 'charisma': 2},
            'Cleric': {'wisdom': 2, 'charisma': 2},
            'Ranger': {'dexterity': 2, 'wisdom': 2},
            'Paladin': {'strength': 2, 'charisma': 2}
        }

        # Apply class modifiers
        if class_type in class_modifiers:
            for stat, modifier in class_modifiers[class_type].items():
                base_stats[stat] += modifier

        return base_stats

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
