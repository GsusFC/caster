# /dev-docs Command

Generate or update development documentation for preserving project context.

## Purpose

Create structured documentation that survives Claude's context resets, helping maintain project continuity across sessions.

## Usage

```
/dev-docs [topic-name]
```

Examples:
- `/dev-docs authentication` - Document auth system
- `/dev-docs database-schema` - Document database design
- `/dev-docs api-patterns` - Document API conventions

## What It Creates

For each topic, creates three files in `dev/active/farcaster-scheduler/`:

### 1. [topic]-plan.md
Strategic overview and approach
- Goals
- Architecture decisions
- Implementation strategy
- Success criteria

### 2. [topic]-context.md
Key decisions and reference info
- Important files
- Code patterns
- Gotchas and edge cases
- Configuration details

### 3. [topic]-tasks.md
Concrete checklist of work
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Example Output

```bash
/dev-docs authentication
```

Creates:
```
dev/active/farcaster-scheduler/
├── authentication-plan.md      # SIWF strategy, flow design
├── authentication-context.md   # Signer management, session handling
└── authentication-tasks.md     # Implementation checklist
```

## When to Use

### Before Starting Work
- Document approach before coding
- Capture architecture decisions
- Create implementation checklist

### Before Context Reset
- Update existing docs with learnings
- Document any gotchas discovered
- Update task completion status

### After Major Changes
- Document what changed and why
- Update affected patterns
- Revise task lists

## Best Practices

### Keep It Current
- Update docs as you work
- Mark tasks complete
- Note unexpected challenges

### Be Specific
- Include actual file paths
- Show code examples
- Document exact errors and solutions

### Think Future You
- Write for someone with no context
- Explain WHY not just WHAT
- Include common pitfalls

## Command Implementation

When user types `/dev-docs [topic]`:

1. **Analyze**: Understand what aspect of project to document
2. **Research**: Review relevant code and existing docs
3. **Structure**: Organize into plan/context/tasks
4. **Generate**: Create the three markdown files
5. **Confirm**: Show user what was created

## Response Format

```markdown
📝 Generated dev docs for: [topic]

Created:
- ✅ [topic]-plan.md (strategic overview)
- ✅ [topic]-context.md (key decisions)
- ✅ [topic]-tasks.md (implementation checklist)

Location: dev/active/farcaster-scheduler/

💡 Tip: Update these before context resets to preserve knowledge!
```

## Template Structures

### Plan Template
```markdown
# [Topic] - Plan

## Goal
What we're trying to achieve

## Current State
Where we are now

## Proposed Approach
How we'll get there

## Architecture Decisions
Key technical choices

## Success Criteria
How we know it worked
```

### Context Template
```markdown
# [Topic] - Context

## Key Files
- path/to/file.ts - What it does

## Important Patterns
Code patterns used

## Configuration
Environment variables, settings

## Edge Cases
Gotchas and special handling

## References
Links to docs, examples
```

### Tasks Template
```markdown
# [Topic] - Tasks

## Preparation
- [ ] Task 1
- [ ] Task 2

## Implementation
- [ ] Task 3
- [ ] Task 4

## Testing
- [ ] Task 5
- [ ] Task 6

## Deployment
- [ ] Task 7
- [ ] Task 8
```

## Integration with Other Tools

Works well with:
- `/dev-docs-update` - Quick update before context reset
- `@code-architecture-reviewer` - Document architecture decisions
- `@refactor-planner` - Document refactoring approach

## Real Example

```
User: "We need to implement analytics tracking"
Claude: "Let me create dev docs for this"

/dev-docs analytics

Creates:
- analytics-plan.md: Strategy for Neynar analytics API integration
- analytics-context.md: API endpoints, data models, caching strategy  
- analytics-tasks.md: Checklist from API setup to dashboard display
```

## Maintenance

Update dev docs:
- ✅ After completing major features
- ✅ Before context resets
- ✅ When discovering new patterns
- ✅ After fixing tricky bugs
- ✅ When making architecture changes

This ensures project knowledge persists across all development sessions!
