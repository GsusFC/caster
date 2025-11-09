# Farcaster Scheduler - Project Plan

## Project Overview

A Buffer-like scheduling application for Farcaster that allows users to:
- Schedule casts (posts) for future publication
- Manage multiple scheduled casts
- View analytics and engagement metrics
- Support threads and media uploads

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Deployment**: Netlify

### Backend
- **Worker**: Node.js cron job
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Render.com

### Integrations
- **Farcaster**: Neynar SDK
- **Authentication**: Sign In With Farcaster (SIWF)

### Monorepo
- **Manager**: pnpm workspaces
- **Build tool**: Turborepo
- **Architecture**: Modular packages

## Architecture

```
apps/
├── web/        → User-facing Next.js dashboard
└── worker/     → Background cron job for publishing

packages/
├── core/       → Business logic (scheduler + publisher)
├── database/   → Prisma + repositories
├── farcaster/  → Neynar integration
├── types/      → Shared TypeScript types
└── config/     → Shared configurations
```

## Development Phases

### Phase 1: MVP (Weeks 1-2) ✅ SETUP COMPLETE
**Goal**: Basic scheduling and publishing

Features:
- [x] Monorepo setup
- [x] Database schema
- [x] Prisma repositories
- [x] Core scheduling logic
- [x] Neynar integration
- [x] Worker cron job
- [ ] Sign In With Farcaster
- [ ] Basic web UI
- [ ] API routes for scheduling
- [ ] Publishing flow

Success Criteria:
- User can auth with Farcaster
- User can schedule a cast
- Worker publishes cast at scheduled time
- Cast appears on Farcaster

### Phase 2: Enhanced UX (Weeks 3-4)
**Goal**: Improved user experience

Features:
- [ ] Calendar view
- [ ] Drag & drop rescheduling
- [ ] Cast preview
- [ ] Bulk actions
- [ ] Image uploads
- [ ] Error notifications
- [ ] Success confirmations

Success Criteria:
- Users can manage multiple casts easily
- Visual calendar shows all scheduled casts
- Image uploads work smoothly

### Phase 3: Advanced Features (Weeks 5-8)
**Goal**: Power user features

Features:
- [ ] Thread creation
- [ ] Thread scheduling
- [ ] Analytics dashboard
- [ ] Engagement metrics
- [ ] Best time recommendations
- [ ] Multiple accounts
- [ ] Channel publishing

Success Criteria:
- Users can create and schedule threads
- Analytics show meaningful insights
- Users can manage multiple Farcaster accounts

### Phase 4: Polish & Launch (Weeks 9-10)
**Goal**: Production-ready

Tasks:
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation
- [ ] User onboarding flow
- [ ] Landing page
- [ ] Pricing/limits
- [ ] Beta testing
- [ ] Launch!

## Key Technical Decisions

### 1. Monorepo Architecture
**Decision**: Use modular monorepo with separate packages
**Rationale**: 
- Easy to share code
- Clear separation of concerns
- Scalable for future features
- Better type safety

### 2. Netlify + Render
**Decision**: Deploy web to Netlify, worker to Render
**Rationale**:
- Cost effective ($14/month)
- Good developer experience
- Reliable infrastructure
- Easy deployment

### 3. Neynar SDK
**Decision**: Use Neynar instead of self-hosted hub
**Rationale**:
- Faster development
- Better reliability
- Includes auth helpers
- Can switch later if needed

### 4. Repository Pattern
**Decision**: Use repository pattern for data access
**Rationale**:
- Cleaner code
- Easier to test
- Can swap implementations
- Business logic stays pure

### 5. Turborepo
**Decision**: Use Turborepo for monorepo builds
**Rationale**:
- Intelligent caching
- Parallel builds
- Faster development
- Industry standard

## Success Metrics

### MVP Success
- ✅ 10 beta users
- ✅ 100 casts scheduled
- ✅ 95% publish success rate
- ✅ <5 second avg schedule time

### Post-Launch Success
- 📈 100 active users in month 1
- 📈 1000 casts scheduled
- 📈 Positive user feedback
- 📈 <1% error rate

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Neynar API changes | Medium | High | Version pin, monitor changelog |
| Rate limits hit | Low | Medium | Implement queuing, backoff |
| Database scaling | Low | High | Use connection pooling, indexes |
| Context resets | High | Low | Dev docs system, good commits |

## Resource Requirements

### Development Time
- Phase 1: 40-60 hours (MVP)
- Phase 2: 30-40 hours (UX)
- Phase 3: 50-70 hours (Advanced)
- Phase 4: 20-30 hours (Polish)
- **Total**: ~140-200 hours

### Monthly Costs
- Render worker: $7
- Render database: $7
- Netlify: $0 (free tier)
- Neynar: $0 (free tier)
- **Total**: $14/month

## Next Steps

### Immediate (This Week)
1. [x] Complete monorepo setup
2. [x] Configure Claude Code infrastructure
3. [ ] Implement SIWF authentication
4. [ ] Create basic dashboard UI
5. [ ] Test scheduling flow

### Short Term (Next 2 Weeks)
1. [ ] Complete Phase 1 MVP
2. [ ] Deploy to staging
3. [ ] Invite beta testers
4. [ ] Gather feedback
5. [ ] Iterate on UX

### Medium Term (Next Month)
1. [ ] Complete Phase 2 features
2. [ ] Production deployment
3. [ ] Public beta launch
4. [ ] Marketing push
5. [ ] Monitor metrics

## Open Questions

1. **Pricing model**: Free tier size? Premium features?
2. **User limits**: How many casts per user?
3. **Media storage**: Where to host images?
4. **Analytics depth**: Which metrics matter most?
5. **Mobile app**: Future consideration?

## References

- [Architecture Docs](../../../ARCHITECTURE.md)
- [Neynar Docs](https://docs.neynar.com)
- [Farcaster Protocol](https://docs.farcaster.xyz)
- [Project README](../../../README.md)
