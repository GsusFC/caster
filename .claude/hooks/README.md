# Claude Code Hooks

Hooks that automate skill activation and provide helpful reminders during development.

## Essential Hooks

### 1. skill-activation-prompt.js (UserPromptSubmit)
**Purpose**: Automatically detects and suggests relevant skills based on your prompts and files.

**How it works**:
- Analyzes your prompt for keywords
- Checks which files are in context
- Matches against skill-rules.json
- Suggests top 2 most relevant skills

**Example**:
```
You: "Add a new API endpoint for scheduling casts"
↓
Hook detects: "scheduling", files in packages/core/
↓
Suggests: @farcaster-dev, @backend-patterns
```

### 2. post-tool-use-tracker.sh (PostToolUse)
**Purpose**: Tracks tool usage and provides contextual reminders.

**What it does**:
- Logs tool usage (optional)
- Reminds you to run type checks after code changes
- Reminds you to commit schema changes after Prisma
- Warns about restarting dev server after dependency changes

## Configuration

Hooks are configured in `.claude/settings.json` - see that file for details.

## Customization

### Adding New Triggers

Edit `skill-rules.json` to add new triggers:

```json
{
  "your-skill": {
    "triggers": ["keyword1", "keyword2"],
    "paths": ["path/pattern/**"],
    "description": "What this skill does"
  }
}
```

### Modifying Hooks

Both hooks are simple scripts you can customize:
- `skill-activation-prompt.js`: Node.js script
- `post-tool-use-tracker.sh`: Bash script

## Testing Hooks

To test if hooks are working:

1. Make sure they're executable: `chmod +x .claude/hooks/*.{js,sh}`
2. Create a `skill-rules.json` file
3. Type a prompt that matches a trigger
4. You should see skill suggestions!

## Troubleshooting

**Hooks not running?**
- Check `.claude/settings.json` is configured correctly
- Verify hooks are executable
- Check `skill-rules.json` exists and is valid JSON

**Skills not being suggested?**
- Check your triggers in `skill-rules.json`
- Make sure your prompt or file paths match patterns
- Try more specific keywords

**Too many suggestions?**
- Increase the score threshold in `skill-activation-prompt.js`
- Make triggers more specific
- Reduce number of paths per skill

## Best Practices

1. **Keep triggers specific**: Use domain-specific terms
2. **Test your patterns**: Make sure file paths match correctly
3. **Don't over-trigger**: Skills should activate when needed, not constantly
4. **Customize for your workflow**: These are starting points - adapt them!

## Advanced: Adding More Hooks

You can add more hooks for:
- **Stop hooks**: Run checks before stopping
- **Custom validation**: TypeScript checks, linting, etc.
- **Build automation**: Trigger builds, run tests, etc.

See the original showcase repo for more examples:
https://github.com/diet103/claude-code-infrastructure-showcase
