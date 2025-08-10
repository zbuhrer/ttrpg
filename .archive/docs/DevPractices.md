# Aetherquill Development Practices Guide

This guide provides best practices and conventions for developing the Aetherquill application, focusing on UI implementation using Streamlit and related technologies. It complements the [Aetherquill Style Guide](Styleguide.md), which defines the visual and UX aspects of the application.

## 1. Streamlit Session State Management

### 1.1 Initialization

*   **Best Practice:** Initialize all `st.session_state` variables at the top of your script (or within a dedicated initialization function) *before* any UI elements are created or used. This prevents `KeyError` and `AttributeError` exceptions.

*   **Example:**

    ```python
    import streamlit as st

    if "character" not in st.session_state:
        st.session_state.character = None  # Or a default character object
    if "current_scene" not in st.session_state:
        st.session_state.current_scene = "You awaken in a mysterious forest..."
    # ... other session state variables
    ```

*   **Explanation:** This pattern ensures that all necessary state variables exist when the script is first run, preventing errors during initial rendering.

### 1.2 Naming Conventions

*   **Guideline:** Use consistent and descriptive names for `st.session_state` keys. This improves code readability and maintainability.

*   **Recommended Pattern:** `[component_name]_[variable_type]_[description]`

*   **Examples:**

    *   `character_name_input`: The user's input for the character's name.
    *   `scene_description_text`: The current scene description.
    *   `show_character_creation_flag`: A boolean flag indicating whether the character creation UI is visible.
    *   `action_text_input`: the most recent user action

*   **Rationale:** Clear naming conventions make it easier to understand the purpose of each state variable and how it's used in the application.

### 1.3 Updating Session State

*   **Best Practice:** When updating `st.session_state` in response to user interactions, use the appropriate Streamlit methods (e.g., callbacks, form submission).

*   **Example (using a form):**

    ```python
    import streamlit as st

    with st.form("my_form"):
        name = st.text_input("Enter your name:")
        submitted = st.form_submit_button("Submit")

        if submitted:
            st.session_state.user_name = name
            st.success(f"Hello, {st.session_state.user_name}!")
    ```

*   **Explanation:** Using forms and callbacks ensures that state updates are handled correctly and trigger re-renders when necessary.

### 1.4 `st.session_state.rerun()` Usage

*   **Guideline:** Use `st.session_state.rerun()` sparingly.  Rerunning the entire script can be inefficient.  Prefer updating state variables directly, which will often trigger the necessary re-renders.

*   **When to Use:** Use `st.session_state.rerun()` when changes to session state *fundamentally* alter the UI structure in a way that Streamlit cannot automatically handle.  For instance, switching between completely different page layouts.

*   **Example (rare case):**

    ```python
    import streamlit as st

    if "page_state" not in st.session_state:
        st.session_state.page_state = "page1"

    if st.button("Go to Page 2"):
        st.session_state.page_state = "page2"
        st.rerun()  # Rerun required because the entire page content changes
    ```

## 2. UI Component Selection

### 2.1 Text Input vs. Text Area

*   **Guideline:** Use `st.text_input` for short, single-line inputs (e.g., names, titles, search queries). Use `st.text_area` for longer, multi-line inputs (e.g., descriptions, stories, code snippets).

*   **Rationale:** This provides a better user experience for different types of input.

### 2.2 Selectbox vs. Radio

*   **Guideline:** Use `st.selectbox` when you have a long list of options to choose from. Use `st.radio` when you have a small number of mutually exclusive options (typically 2-5).

*   **Rationale:** `st.radio` is more visually prominent and easier to use when the number of options is limited. `st.selectbox` is more compact and suitable for longer lists.

### 2.3 Slider vs. Number Input

*   **Guideline:** Use `st.slider` when you want to allow users to select a value within a continuous range. Use `st.number_input` when you want to allow users to enter a specific numeric value, or when the range is very large or unbounded.

*   **Rationale:** `st.slider` provides a visual representation of the range and makes it easy to select approximate values. `st.number_input` allows for precise value entry.

## 3. Layout and Structure

### 3.1 Using `st.columns`

*   **Best Practice:** Use `st.columns` to create responsive layouts that adapt to different screen sizes.

*   **Example:**

    ```python
    import streamlit as st

    col1, col2 = st.columns(2)

    with col1:
        st.header("Column 1")
        st.write("Content for column 1")

    with col2:
        st.header("Column 2")
        st.write("Content for column 2")
    ```

*   **Explanation:** `st.columns` allows you to divide the horizontal space of your app into multiple columns, making it easier to organize UI elements and create visually appealing layouts.

### 3.2 Consistent Page Structure

*   **Guideline:** Establish a consistent page structure across your application. This makes it easier for users to navigate and understand the UI.

*   **Recommended Pattern:**

    1.  **Title:** Use `st.title` or `st.header` to display the page title.
    2.  **Introduction:** Provide a brief description of the page's purpose.
    3.  **Main Content:** Organize the main content using `st.columns`, `st.expander`, and other layout elements.
    4.  **Status/Feedback:** Display status messages, error messages, and other feedback using `st.success`, `st.info`, `st.warning`, and `st.error`.

## 4. Code Formatting and Style

### 4.1 Consistent Indentation

*   **Guideline:** Use consistent indentation (typically 4 spaces) throughout your code.  Adhere to [PEP 8 - Style Guide for Python Code](https://peps.python.org/pep-0008/).

*   **Rationale:** Consistent indentation improves code readability and makes it easier to identify code blocks.

### 4.2 Descriptive Comments

*   **Guideline:** Add comments to explain complex logic or non-obvious code.  Use [Docstrings](https://peps.python.org/pep-0257/) for documenting functions, classes and modules.

*   **Rationale:** Comments help other developers (and your future self) understand the code.

### 4.3 Reusable Functions

*   **Best Practice:** Encapsulate UI logic into reusable functions or components. This reduces code duplication and makes it easier to maintain the application.  Consider using [Design Patterns](https://refactoring.guru/design-patterns/catalog) where appropriate to structure complex code.

*   **Example:**

    ```python
    import streamlit as st

    def display_character_info(character):
        st.write(f"Name: {character['name']}")
        st.write(f"Race: {character['race']}")
        # ... other character information

    # Usage:
    if st.session_state.character:
        display_character_info(st.session_state.character)
    ```

## 5. Accessibility Considerations

### 5.1 Alt Text for Images

*   **Requirement:** Provide descriptive alt text for all images. This is essential for screen reader support.

*   **Example:**

    ```python
    import streamlit as st

    st.image("logo.png", alt="Aetherquill Logo: A quill with aether ink forming arcane runes")
    ```

### 5.2 Color Contrast

*   **Guideline:** Ensure sufficient color contrast between text and background colors to make the UI readable for users with visual impairments. Refer to the [Aetherquill Style Guide](Styleguide.md) for approved color combinations.

*   **Tools:** Use online color contrast checkers to verify that your color combinations meet accessibility standards (WCAG).

## 6. Example: Character Creation UI Pattern

```python
import streamlit as st

def character_creation_step_1():
    # UI elements for step 1
    pass

def character_creation_step_2():
    # UI elements for step 2
    pass

if "character_creation_step" not in st.session_state:
    st.session_state.character_creation_step = 1

if st.session_state.character_creation_step == 1:
    character_creation_step_1()
elif st.session_state.character_creation_step == 2:
    character_creation_step_2()

## 7. Cyclomatic Complexity

### 7.1 Definition

Cyclomatic complexity is a software metric that measures the number of linearly independent paths through a program's source code. In simpler terms, it's a measure of how complex a function or method is. Higher numbers indicate greater complexity.

### 7.2 Threshold

*   **Guideline:** Aim for a cyclomatic complexity of **10 or less** for individual functions or methods.

*   **Explanation:** Functions exceeding a cyclomatic complexity of 10 should be carefully reviewed and considered for refactoring. While higher complexity may be acceptable in rare cases (e.g., highly optimized algorithms), it should be an exception, not the rule.

### 7.3 Identification

*   **Tools:** Use code analysis tools (e.g., pylint with the `mccabe` plugin for Python) to automatically calculate cyclomatic complexity. Configure your linter to report violations of the threshold.

*   **Example (pylint):**

    1.  Install the `mccabe` plugin: `pip install mccabe`
    2.  Configure pylint to use the plugin (e.g., in your `.pylintrc` file):

        ```
        [FORMAT]
        max-complexity=10
        ```

### 7.4 Mitigation

*   **Refactoring Techniques:** If a function exceeds the complexity threshold, consider the following refactoring techniques:

    *   **Extract Sub-functions:** Break the function into smaller, more focused sub-functions. This is the most common and effective approach.
    *   **Simplify Conditional Logic:** Reduce the number of `if`, `elif`, and `else` statements. Consider using data structures (e.g., dictionaries) to replace complex conditional logic.
    *   **Use Design Patterns:** Apply appropriate design patterns (e.g., Strategy pattern) to encapsulate complex behavior.
    *   **Remove Redundant Code:** Identify and eliminate any unnecessary or duplicated code.
    *   **Decompose Large Expressions:** Break down complex expressions into smaller, more manageable parts.

*   **Example (Extract Sub-function):**

    ```python
    def process_data(data):
        # Complex logic here...
        if condition1:
            # ...
        elif condition2:
            # ...
        else:
            # ...

    # Refactored:
    def process_data(data):
        result1 = _process_condition1(data)
        result2 = _process_condition2(data)
        result3 = _process_default(data)
        return result1 + result2 + result3

    def _process_condition1(data):
        # Logic for condition1

    def _process_condition2(data):
        # Logic for condition2

    def _process_default(data):
        # Default logic
    ```

    **Before (High Complexity):**

    ```python
    def calculate_damage(attack_type, weapon, target_armor, base_damage):
        if attack_type == "melee":
            if weapon == "sword":
                damage = base_damage * 1.2
            elif weapon == "axe":
                damage = base_damage * 1.5
            else:
                damage = base_damage
        elif attack_type == "ranged":
            if weapon == "bow":
                damage = base_damage * 0.8
            elif weapon == "crossbow":
                damage = base_damage * 1.1
            else:
                damage = base_damage * 0.5
        else:
            damage = base_damage * 0.75

        damage -= target_armor
        return max(0, damage) # Ensure damage is not negative
    ```

    **After (Refactored - Lower Complexity):**

    ```python
    def calculate_damage(attack_type: str, weapon: str, target_armor: int, base_damage: int) -> int:
        """Calculates damage based on attack type, weapon, and target armor."""

        attack_modifiers = {
            "melee": {"sword": 1.2, "axe": 1.5},
            "ranged": {"bow": 0.8, "crossbow": 1.1},
        }

        modifier = attack_modifiers.get(attack_type, {}).get(weapon, 1.0) # Default modifier is 1.0

        damage = base_damage * modifier - target_armor
        return max(0, int(damage))
    ```

    **Explanation:** The refactored code uses a dictionary to store attack modifiers, reducing nested `if` statements and improving readability. Type hints are also included to improve code clarity. This significantly reduces the cyclomatic complexity.

### 7.5 Exceptions

*   **Guideline:** Exceptions to the complexity threshold should be rare and well-justified. If you believe a function *must* exceed the threshold, document the reason clearly in a comment.

*   **Example:**

    ```python
    def highly_optimized_algorithm(data):
        # This function implements a highly optimized algorithm
        # where minimizing code size is critical for performance.
        # The cyclomatic complexity exceeds the recommended
        # threshold, but refactoring would significantly
        # degrade performance.

        # ... complex algorithm code ...
        pass
    ```

## 8. Testing

### 8.1 Unit Testing

*   **Guideline:** Write unit tests for all critical functions and components.  Use a testing framework like `pytest`.

*   **Example:**

    ```python
    # Function to be tested (in combat_module.py):
    def calculate_damage(attack: int, defense: int) -> int:
        damage = attack - defense
        return max(0, damage)

    # Test (in test_combat_module.py):
    import pytest
    from combat_module import calculate_damage

    def test_calculate_damage_basic():
        assert calculate_damage(10, 5) == 5

    def test_calculate_damage_zero():
        assert calculate_damage(5, 5) == 0

    def test_calculate_damage_negative():
        assert calculate_damage(5, 10) == 0

    ```

    **Explanation:** This example demonstrates how to write simple unit tests for a function using `pytest`.  The tests cover basic scenarios and edge cases. Run the tests using `pytest`.

### 8.2 UI Testing

*   **Guideline:** While comprehensive UI testing can be complex with Streamlit, focus on testing the core interactions and state changes. Consider using tools like `streamlit-test` or manual testing.

## 9. Modular Design, Type Hinting, and Docstrings

### 9.1 Modular Design

*   **Guideline:** Break down the application into smaller, independent modules (functions and classes) with well-defined interfaces. This enhances reusability and testability.

    **Example:**

    ```python
    # Instead of a single large script:

    # character_module.py
    class Character:
        def __init__(self, name: str, health: int):
            self.name = name
            self.health = health

        def take_damage(self, damage: int):
            self.health -= damage
            self.health = max(0, self.health)

    # ui_module.py
    import streamlit as st
    from character_module import Character

    def display_character(character: Character):
        st.write(f"Name: {character.name}, Health: {character.health}")

    # main.py
    from character_module import Character
    from ui_module import display_character

    player = Character("Aella", 100)
    display_character(player)
    ```

### 9.2 Type Hinting

*   **Guideline:** Use type hints extensively to improve code clarity and enable static analysis tools to catch errors early. See [PEP 484 - Type Hints](https://peps.python.org/pep-0484/).

    **Example:**

    ```python
    def calculate_experience(level: int, monster_difficulty: str) -> int:
        """Calculates the experience gained from defeating a monster."""
        if monster_difficulty == "easy":
            return level * 10
        elif monster_difficulty == "hard":
            return level * 30
        else:
            return level * 20
    ```

### 9.3 Docstrings

*   **Guideline:** Write comprehensive docstrings for all functions, classes, and modules. Explain the purpose, parameters, return values, and potential side effects. See [PEP 257 - Docstring Conventions](https://peps.python.org/pep-0257/).

    **Example:**

    ```python
    def generate_random_name(race: str, gender: str) -> str:
        """Generates a random name based on race and gender.

        Args:
            race: The race of the character (e.g., "elf", "human").
            gender: The gender of the character ("male" or "female").

        Returns:
            A randomly generated name as a string.

        Raises:
            ValueError: If the race or gender is invalid.
        """
        # ... name generation logic ...
        return "Generated Name"
    ```

## 10. Tools and Automation

### 10.1 Linters and Code Formatters

*   **Guideline:** Enforce a consistent code style using a linter (e.g., `pylint`, `flake8`) and a code formatter (e.g., `black`). This reduces stylistic debates and improves code readability.

    *   **Linter Example (pylint):**  `pip install pylint; pylint your_module.py`
    *   **Formatter Example (black):** `pip install black; black your_module.py`

### 10.2 Version Control

*   **Guideline:** Utilize Git for version control, with clear commit messages and a well-defined branching strategy (e.g., Gitflow).

    *   **Resource:**  [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

### 10.3 Dependency Management

*   **Guideline:** Use a requirements file (`requirements.txt` or `Pipfile`) to manage dependencies. This ensures that the application can be easily installed and run in different environments.

    *   **Example (`requirements.txt`):**

        ```
        streamlit
        pytest
        requests
        ```

### 10.4 Configuration Management

*   **Guideline:** Separate configuration settings from the code using environment variables or a configuration file.

    *   **Example (using environment variables):**

        ```python
        import os

        database_url = os.environ.get("DATABASE_URL")
        debug_mode = os.environ.get("DEBUG_MODE", "False") == "True"
        ```

### 10.5 Continuous Integration

*   **Guideline:** Set up a CI/CD pipeline (e.g., using GitHub Actions, GitLab CI) to automatically run tests, lint code, and deploy the application on every commit.

    *   **Resource:** [GitHub Actions Documentation](https://docs.github.com/en/actions)
