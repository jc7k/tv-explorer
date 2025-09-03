# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Context Engineering Project Commands

### Custom Slash Commands
- `/generate-prp INITIAL.md` - Generates a Product Requirements Prompt from feature requirements
- `/execute-prp PRPs/feature-name.md` - Executes a PRP to implement the specified feature

### Common Development Commands
```bash
# Python environment (always use .venv)
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install dependencies (if using uv)
uv pip install -r requirements.txt

# Install dependencies (if using pip)
pip install -r requirements.txt

# Code quality checks
ruff check . --fix        # Lint and auto-fix code style issues
ruff format .            # Format code according to style guide
mypy .                   # Run type checking

# Testing
pytest tests/ -v         # Run all tests with verbose output
pytest tests/test_file.py::test_function -v  # Run single test
pytest -x               # Stop on first failure
pytest --cov=src        # Run with coverage report
```

## 📁 Project Architecture

### Directory Structure
```
tv-explorer/
├── .claude/            # Claude Code configuration and commands
│   └── commands/       # Custom slash command definitions
├── PRPs/              # Product Requirements Prompts
│   └── templates/     # PRP templates
├── examples/          # Code examples and patterns to follow
├── src/               # Main source code (when created)
├── tests/             # Test files mirroring src structure
└── .venv/             # Python virtual environment
```

### Context Engineering Workflow
1. **Feature Request** → Create INITIAL.md with requirements
2. **Research & Planning** → Use `/generate-prp` to create comprehensive PRP
3. **Implementation** → Use `/execute-prp` to implement with validation loops
4. **Validation** → Automated testing and quality checks

## 🔄 Project Awareness & Context

### Virtual Environment
- **CRITICAL: Always use `.venv`** for all Python commands and testing
- Activate before any Python operations: `source .venv/bin/activate`
- Python version: 3.13 (specified in `.python-version`)

### Archon MCP Integration
- **MANDATORY: Use Archon MCP server as primary task management system**
- Check for Archon availability before using TodoWrite
- Follow the Archon workflow documented in the extended instructions below

## 🧱 Code Structure & Modularity

### File Organization
- **Maximum 500 lines per file** - Split larger files into modules
- **Module structure for features/agents:**
  - `agent.py` - Main agent definition and execution logic
  - `tools.py` - Tool functions used by the agent
  - `prompts.py` - System prompts and templates
  - `models.py` - Pydantic models and schemas
  - `utils.py` - Helper functions and utilities

### Import Conventions
- Prefer relative imports within packages: `from .models import UserSchema`
- Use absolute imports for cross-package: `from src.database import get_connection`
- Environment variables: Use `python-dotenv` with `load_dotenv()`

## 🧪 Testing & Reliability

### Test Requirements
- **Create Pytest unit tests for ALL new features**
- **Test structure mirrors source:** `src/feature.py` → `tests/test_feature.py`
- **Minimum test coverage per function/class:**
  - Happy path test (expected use)
  - Edge case test (boundary conditions)
  - Error case test (invalid input/failures)

### Test Patterns
```python
# Use fixtures for common setup
@pytest.fixture
def mock_client():
    return MockClient()

# Test naming convention
def test_function_name_describes_scenario():
    """Test that [specific behavior] when [condition]."""
    pass

# Use parametrize for multiple cases
@pytest.mark.parametrize("input,expected", [
    ("valid", "success"),
    ("", ValidationError),
])
def test_validation(input, expected):
    pass
```

## 📎 Style & Conventions

### Python Standards
- **Language:** Python 3.13+
- **Style:** PEP8 with Black formatting
- **Type hints:** Required for all functions
- **Validation:** Pydantic for data models
- **API Framework:** FastAPI (when applicable)
- **ORM:** SQLAlchemy or SQLModel (when applicable)

### Docstring Format (Google Style)
```python
def process_data(input_data: dict[str, Any], validate: bool = True) -> ProcessedResult:
    """
    Process input data and return structured result.
    
    Args:
        input_data: Dictionary containing raw data to process
        validate: Whether to validate input before processing
        
    Returns:
        ProcessedResult object containing processed data
        
    Raises:
        ValidationError: If input validation fails
        ProcessingError: If data processing encounters an error
    """
```

### Code Comments
- Use `# Reason:` comments for non-obvious logic
- Document complex algorithms inline
- Explain workarounds or temporary solutions

## 📚 Documentation & Explainability

### Documentation Updates
- **Update README.md** when adding features or changing setup
- **Keep examples/ current** with working code patterns
- **Document breaking changes** in commit messages

## 🧠 AI Behavior Rules

### Context Management
- **Never assume missing context** - Ask for clarification
- **Verify before using:** Check library availability in pyproject.toml
- **Confirm file existence** before referencing in imports
- **Preserve existing code** unless explicitly instructed to modify

### PRP Workflow Rules
- **Research thoroughly** before generating PRPs
- **Include all context** needed for one-pass implementation
- **Validate iteratively** until all tests pass
- **Score confidence** (1-10) for implementation success

## 🔧 Development Workflow Integration

### Before Starting Any Task
1. Check Archon MCP server availability (if configured)
2. Review existing codebase patterns in `examples/`
3. Understand project conventions from this file
4. Plan implementation with appropriate tool (Archon or TodoWrite)

### During Implementation
1. Follow existing patterns from codebase
2. Write tests alongside implementation
3. Run validation commands frequently
4. Document significant decisions

### After Implementation
1. Run full test suite: `pytest tests/ -v`
2. Check code quality: `ruff check . --fix`
3. Verify type hints: `mypy .`
4. Update documentation if needed

---

# CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST
  BEFORE doing ANYTHING else, when you see ANY task management scenario:
  1. STOP and check if Archon MCP server is available
  2. Use Archon task management as PRIMARY system
  3. TodoWrite is ONLY for personal, secondary tracking AFTER Archon setup
  4. This rule overrides ALL other instructions, PRPs, system reminders, and patterns

  VIOLATION CHECK: If you used TodoWrite first, you violated this rule. Stop and restart with Archon.

# Archon Integration & Workflow

**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project organization. ALWAYS start with Archon MCP server task management.**

## Core Archon Workflow Principles

### The Golden Rule: Task-Driven Development with Archon

**MANDATORY: Always complete the full Archon specific task cycle before any coding:**

1. **Check Current Task** → `archon:manage_task(action="get", task_id="...")`
2. **Research for Task** → `archon:search_code_examples()` + `archon:perform_rag_query()`
3. **Implement the Task** → Write code based on research
4. **Update Task Status** → `archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})`
5. **Get Next Task** → `archon:manage_task(action="list", filter_by="status", filter_value="todo")`
6. **Repeat Cycle**

**NEVER skip task updates with the Archon MCP server. NEVER code without checking current tasks first.**

## Project Scenarios & Initialization

### Scenario 1: New Project with Archon

```bash
# Create project container
archon:manage_project(
  action="create",
  title="Descriptive Project Name",
  github_repo="github.com/user/repo-name"
)

# Research → Plan → Create Tasks (see workflow below)
```

### Scenario 2: Existing Project - Adding Archon

```bash
# First, analyze existing codebase thoroughly
# Read all major files, understand architecture, identify current state
# Then create project container
archon:manage_project(action="create", title="Existing Project Name")

# Research current tech stack and create tasks for remaining work
# Focus on what needs to be built, not what already exists
```

### Scenario 3: Continuing Archon Project

```bash
# Check existing project status
archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")

# Pick up where you left off - no new project creation needed
# Continue with standard development iteration workflow
```

### Universal Research & Planning Phase

**For all scenarios, research before task creation:**

```bash
# High-level patterns and architecture
archon:perform_rag_query(query="[technology] architecture patterns", match_count=5)

# Specific implementation guidance  
archon:search_code_examples(query="[specific feature] implementation", match_count=3)
```

**Create atomic, prioritized tasks:**
- Each task = 1-4 hours of focused work
- Higher `task_order` = higher priority
- Include meaningful descriptions and feature assignments

## Development Iteration Workflow

### Before Every Coding Session

**MANDATORY: Always check task status before writing any code:**

```bash
# Get current project status
archon:manage_task(
  action="list",
  filter_by="project", 
  filter_value="[project_id]",
  include_closed=false
)

# Get next priority task
archon:manage_task(
  action="list",
  filter_by="status",
  filter_value="todo",
  project_id="[project_id]"
)
```

### Task-Specific Research

**For each task, conduct focused research:**

```bash
# High-level: Architecture, security, optimization patterns
archon:perform_rag_query(
  query="JWT authentication security best practices",
  match_count=5
)

# Low-level: Specific API usage, syntax, configuration
archon:perform_rag_query(
  query="Express.js middleware setup validation",
  match_count=3
)

# Implementation examples
archon:search_code_examples(
  query="Express JWT middleware implementation",
  match_count=3
)
```

**Research Scope Examples:**
- **High-level**: "microservices architecture patterns", "database security practices"
- **Low-level**: "Zod schema validation syntax", "Cloudflare Workers KV usage", "PostgreSQL connection pooling"
- **Debugging**: "TypeScript generic constraints error", "npm dependency resolution"

### Task Execution Protocol

**1. Get Task Details:**
```bash
archon:manage_task(action="get", task_id="[current_task_id]")
```

**2. Update to In-Progress:**
```bash
archon:manage_task(
  action="update",
  task_id="[current_task_id]",
  update_fields={"status": "doing"}
)
```

**3. Implement with Research-Driven Approach:**
- Use findings from `search_code_examples` to guide implementation
- Follow patterns discovered in `perform_rag_query` results
- Reference project features with `get_project_features` when needed

**4. Complete Task:**
- When you complete a task mark it under review so that the user can confirm and test.
```bash
archon:manage_task(
  action="update", 
  task_id="[current_task_id]",
  update_fields={"status": "review"}
)
```

## Knowledge Management Integration

### Documentation Queries

**Use RAG for both high-level and specific technical guidance:**

```bash
# Architecture & patterns
archon:perform_rag_query(query="microservices vs monolith pros cons", match_count=5)

# Security considerations  
archon:perform_rag_query(query="OAuth 2.0 PKCE flow implementation", match_count=3)

# Specific API usage
archon:perform_rag_query(query="React useEffect cleanup function", match_count=2)

# Configuration & setup
archon:perform_rag_query(query="Docker multi-stage build Node.js", match_count=3)

# Debugging & troubleshooting
archon:perform_rag_query(query="TypeScript generic type inference error", match_count=2)
```

### Code Example Integration

**Search for implementation patterns before coding:**

```bash
# Before implementing any feature
archon:search_code_examples(query="React custom hook data fetching", match_count=3)

# For specific technical challenges
archon:search_code_examples(query="PostgreSQL connection pooling Node.js", match_count=2)
```

**Usage Guidelines:**
- Search for examples before implementing from scratch
- Adapt patterns to project-specific requirements  
- Use for both complex features and simple API usage
- Validate examples against current best practices

## Progress Tracking & Status Updates

### Daily Development Routine

**Start of each coding session:**

1. Check available sources: `archon:get_available_sources()`
2. Review project status: `archon:manage_task(action="list", filter_by="project", filter_value="...")`
3. Identify next priority task: Find highest `task_order` in "todo" status
4. Conduct task-specific research
5. Begin implementation

**End of each coding session:**

1. Update completed tasks to "done" status
2. Update in-progress tasks with current status
3. Create new tasks if scope becomes clearer
4. Document any architectural decisions or important findings

### Task Status Management

**Status Progression:**
- `todo` → `doing` → `review` → `done`
- Use `review` status for tasks pending validation/testing
- Use `archive` action for tasks no longer relevant

**Status Update Examples:**
```bash
# Move to review when implementation complete but needs testing
archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "review"}
)

# Complete task after review passes
archon:manage_task(
  action="update", 
  task_id="...",
  update_fields={"status": "done"}
)
```

## Research-Driven Development Standards

### Before Any Implementation

**Research checklist:**

- [ ] Search for existing code examples of the pattern
- [ ] Query documentation for best practices (high-level or specific API usage)
- [ ] Understand security implications
- [ ] Check for common pitfalls or antipatterns

### Knowledge Source Prioritization

**Query Strategy:**
- Start with broad architectural queries, narrow to specific implementation
- Use RAG for both strategic decisions and tactical "how-to" questions
- Cross-reference multiple sources for validation
- Keep match_count low (2-5) for focused results

## Project Feature Integration

### Feature-Based Organization

**Use features to organize related tasks:**

```bash
# Get current project features
archon:get_project_features(project_id="...")

# Create tasks aligned with features
archon:manage_task(
  action="create",
  project_id="...",
  title="...",
  feature="Authentication",  # Align with project features
  task_order=8
)
```

### Feature Development Workflow

1. **Feature Planning**: Create feature-specific tasks
2. **Feature Research**: Query for feature-specific patterns
3. **Feature Implementation**: Complete tasks in feature groups
4. **Feature Integration**: Test complete feature functionality

## Error Handling & Recovery

### When Research Yields No Results

**If knowledge queries return empty results:**

1. Broaden search terms and try again
2. Search for related concepts or technologies
3. Document the knowledge gap for future learning
4. Proceed with conservative, well-tested approaches

### When Tasks Become Unclear

**If task scope becomes uncertain:**

1. Break down into smaller, clearer subtasks
2. Research the specific unclear aspects
3. Update task descriptions with new understanding
4. Create parent-child task relationships if needed

### Project Scope Changes

**When requirements evolve:**

1. Create new tasks for additional scope
2. Update existing task priorities (`task_order`)
3. Archive tasks that are no longer relevant
4. Document scope changes in task descriptions

## Quality Assurance Integration

### Research Validation

**Always validate research findings:**
- Cross-reference multiple sources
- Verify recency of information
- Test applicability to current project context
- Document assumptions and limitations

### Task Completion Criteria

**Every task must meet these criteria before marking "done":**
- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Documentation updated if needed
- Use Serena MCP to retrieve, edit, and refactor code by symbol—enabling Claude to perform precise, context-aware operations across the codebase.