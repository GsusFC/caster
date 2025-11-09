#!/bin/bash

# Post Tool Use Tracker (PostToolUse Hook)
# 
# Tracks tool usage and provides helpful reminders
# Essential for maintaining awareness of what Claude Code is doing

# Read hook data from stdin
read -r HOOK_DATA

# Parse tool name from JSON (simple grep approach)
TOOL_NAME=$(echo "$HOOK_DATA" | grep -o '"toolName":"[^"]*"' | cut -d'"' -f4)

# Log tool usage (optional - comment out if too verbose)
# echo "🔧 Tool used: $TOOL_NAME"

# Provide contextual reminders based on tool
case "$TOOL_NAME" in
  "str_replace"|"create_file")
    # Remind about testing after code changes
    if [ -f "package.json" ]; then
      echo "💡 Tip: Run 'pnpm typecheck' to verify TypeScript changes"
    fi
    ;;
  
  "bash_tool")
    # Check for common issues
    COMMAND=$(echo "$HOOK_DATA" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)
    
    if echo "$COMMAND" | grep -q "prisma"; then
      echo "💾 Prisma command detected - remember to commit schema changes"
    fi
    
    if echo "$COMMAND" | grep -q "pnpm install"; then
      echo "📦 Dependencies changed - may need to restart dev server"
    fi
    ;;
esac

exit 0
