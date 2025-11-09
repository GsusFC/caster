# Contributing to Farcaster Scheduler

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL database

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/GsusFC/caster.git
cd caster

# Run setup script
./tools/scripts/setup.sh

# Update .env with your credentials
# Run database migrations
pnpm db:migrate

# Start development
pnpm dev
```

## Development Workflow

### Working on a Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** in the appropriate package
   - UI changes → `apps/web`
   - Business logic → `packages/core`
   - Database schema → `packages/database`
   - API integration → `packages/farcaster`

3. **Test your changes**
   ```bash
   pnpm typecheck  # Type checking
   pnpm lint       # Linting
   pnpm test       # Tests (when available)
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add thread scheduling support"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Use meaningful variable names

### Adding a New Package

```bash
# Create package directory
mkdir -p packages/new-package/src

# Create package.json
# See existing packages for reference

# Add to pnpm-workspace.yaml (already included with packages/*)

# Update dependencies in consuming packages
```

### Database Changes

```bash
# 1. Update schema
edit packages/database/prisma/schema.prisma

# 2. Create migration
pnpm db:migrate

# 3. Generate Prisma client
pnpm db:generate

# 4. Update repositories if needed
edit packages/database/src/repositories/
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter=@farcaster-scheduler/core test

# Watch mode
pnpm --filter=@farcaster-scheduler/core test:watch
```

## Monorepo Commands

### Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm dev:web
pnpm dev:worker

# Build everything
pnpm build

# Clean everything
pnpm clean
```

### Package Management

```bash
# Add dependency to root
pnpm add -D package-name

# Add dependency to specific package
pnpm --filter=web add package-name
pnpm --filter=@farcaster-scheduler/core add package-name

# Update all dependencies
pnpm update -r
```

### Database

```bash
# Create migration
pnpm db:migrate

# Push schema without migration (dev only)
pnpm db:push

# Open Prisma Studio
pnpm db:studio

# Generate Prisma client
pnpm db:generate
```

## Architecture Decisions

### When to Create a New Package

Create a new package when:
- The code has a clear, single responsibility
- It will be used by multiple apps
- You want to version it independently
- It represents a distinct domain

### When to Keep Code in an App

Keep code in an app when:
- It's UI-specific
- It's not reusable
- It's tightly coupled to the app's routing/structure

### Package Dependencies

Follow this dependency flow:
```
apps → core → database, farcaster → types
```

Don't create circular dependencies!

## Pull Request Guidelines

### PR Title Format

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: improve code structure`
- `test: add tests`
- `chore: update dependencies`

### PR Description

Include:
- What changes were made
- Why they were made
- How to test them
- Screenshots (for UI changes)
- Breaking changes (if any)

### Review Process

1. All tests must pass
2. No TypeScript errors
3. Code review by maintainer
4. Approval required before merge

## Release Process

We use [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish (if applicable)
pnpm changeset publish
```

## Getting Help

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
- Read package READMEs for specific guidance
- Open an issue for bugs or questions
- Join our Discord/Telegram for discussions

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the Golden Rule

Thank you for contributing! 🎉
