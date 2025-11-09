# Claude Code Infrastructure

This directory contains the infrastructure that makes Claude Code incredibly productive through auto-activating skills, specialized agents, and context preservation.

## 🎯 What This Does

### Auto-Activating Skills
Skills automatically suggest themselves based on:
- Keywords in your prompts ("neynar" → activates farcaster-dev)
- Files you're working on (packages/database/ → activates database-dev)
- No need to remember which skill to use!

### Specialized Agents
Pre-configured agents for complex tasks:
- Architecture reviews
- Refactoring planning
- Code quality checks

### Context Preservation
Dev docs system that survives context resets:
- Project plans that persist
- Key decisions documented
- Task lists that stay current

## 📁 Structure

```
.claude/
├── skills/              # Development skills (auto-activate)
│   ├── farcaster-dev/   # Farcaster & Neynar patterns
│   ├── skill-rules.json # Activation configuration
│   └── ...
├── hooks/               # Automation hooks
│   ├── skill-activation-prompt.js  # Auto-suggest skills
│   ├── post-tool-use-tracker.sh    # Tool usage tracking
│   └── README.md
├── agents/              # Specialized assistants
│   ├── code-architecture-reviewer.md
│   ├── refactor-planner.md
│   └── ...
├── commands/            # Slash commands
│   └── dev-docs.md      # Generate dev documentation
└── settings.json        # Claude Code configuration
```

## 🚀 Quick Start

### 1. Verify Setup

```bash
# Check hooks are executable
ls -l .claude/hooks/*.{js,sh}

# Should show +x permissions
# If not: chmod +x .claude/hooks/*.{js,sh}
```

### 2. Test Skills Auto-Activation

Type a message mentioning "neynar" or "cast" - you should see:
```
🎯 Relevant skills detected:
📚 farcaster-dev
   Farcaster & Neynar development patterns
   💡 Load with: @farcaster-dev
```

### 3. Load a Skill Manually

```
@farcaster-dev
```

Claude will load the skill and be ready to help with Farcaster development!

### 4. Use an Agent

```
Act as code architecture reviewer and check my latest changes
```

Claude will review your code following the agent's guidelines.

### 5. Generate Dev Docs

```
/dev-docs authentication
```

Creates plan, context, and task files for the topic.

## 📚 Available Skills

### farcaster-dev
**Activates when**: Working with Neynar, Farcaster, scheduling, publishing
**Covers**: Neynar SDK, cast publishing, signers, scheduling patterns

### database-dev  
**Activates when**: Working with Prisma, database, migrations, repositories
**Covers**: Prisma patterns, repository design, migrations, type safety

### monorepo-patterns
**Activates when**: Working with packages, workspaces, dependencies
**Covers**: Package structure, Turborepo, cross-package imports

### nextjs-dev
**Activates when**: Working in apps/web
**Covers**: Next.js 14, App Router, API routes, Server Actions

## 🤖 Available Agents

### code-architecture-reviewer
Review code for architectural consistency:
- Dependency flow validation
- Type safety checks
- Pattern compliance
- Code organization

**Use**: `Act as code architecture reviewer`

### refactor-planner
Create safe refactoring plans:
- Step-by-step approach
- Risk assessment
- Rollback strategy
- Verification checkpoints

**Use**: `Plan refactoring for [feature]`

## ⚙️ Configuration

### Adding New Skill Triggers

Edit `.claude/skills/skill-rules.json`:

```json
{
  "your-skill": {
    "triggers": ["keyword1", "keyword2"],
    "paths": ["packages/your-package/**"],
    "description": "What this skill does"
  }
}
```

### Customizing Hooks

Hooks are simple scripts you can modify:
- `skill-activation-prompt.js`: Node.js
- `post-tool-use-tracker.sh`: Bash

## 📖 Detailed Guides

- [Hooks Guide](.claude/hooks/README.md)
- [Skills Catalog](.claude/skills/)
- [Agents Guide](.claude/agents/)
- [Commands Reference](.claude/commands/)

## 💡 Best Practices

### For Skills
1. Keep SKILL.md files under 500 lines
2. Use resources/ for deep dives
3. Update triggers when adding features
4. Test activation patterns

### For Agents
1. Use for complex, multi-step tasks
2. Provide clear instructions
3. Include examples
4. Document output format

### For Dev Docs
1. Update before context resets
2. Be specific with file paths
3. Document WHY not just WHAT
4. Keep task lists current

## 🔧 Troubleshooting

### Skills Not Activating?
1. Check `skill-rules.json` is valid JSON
2. Verify hooks are executable
3. Check triggers match your prompts
4. Review `.claude/settings.json`

### Hooks Not Running?
1. Verify they're executable: `chmod +x .claude/hooks/*.{js,sh}`
2. Check no syntax errors in scripts
3. Ensure `settings.json` configured correctly

### Can't Find Documentation?
1. Check `dev/active/farcaster-scheduler/`
2. Use `/dev-docs [topic]` to create new docs
3. Review `ARCHITECTURE.md` in repo root

## 🎓 Learning Resources

### External References
- [Original Showcase Repo](https://github.com/diet103/claude-code-infrastructure-showcase)
- [Claude Code Docs](https://docs.claude.com/claude-code)

### Internal Documentation
- [Project Architecture](../ARCHITECTURE.md)
- [Development Guide](../CONTRIBUTING.md)
- [Deployment Guide](../DEPLOYMENT.md)

## 🆘 Getting Help

1. Read the relevant README in this directory
2. Check examples in skills/agents
3. Review dev docs in `dev/active/`
4. Ask Claude to explain a pattern

## 🔄 Maintenance

### Regular Tasks
- Update skill triggers when adding features
- Refresh dev docs before major work
- Review agent effectiveness
- Clean up unused resources

### After Major Changes
- Update relevant skills
- Regenerate dev docs
- Test skill activation
- Update this README

## 🎉 What Makes This Special

Unlike traditional documentation:
- ✅ Skills activate automatically
- ✅ Agents streamline complex tasks
- ✅ Context persists across sessions
- ✅ Patterns enforced consistently
- ✅ Knowledge compounds over time

This infrastructure transforms Claude Code from a powerful tool into an expert development partner that understands your project deeply!

---

**Questions?** Check the detailed guides in subdirectories or ask Claude for help!
