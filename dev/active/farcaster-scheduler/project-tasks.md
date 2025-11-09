# Farcaster Scheduler - Task List

## Legend
- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked

## Phase 1: MVP - Basic Scheduling

### Infrastructure ✅
- [x] Set up monorepo structure
- [x] Configure Turborepo
- [x] Set up pnpm workspaces
- [x] Create package structure
- [x] Configure TypeScript
- [x] Set up Prisma
- [x] Create database schema
- [x] Set up Claude Code infrastructure

### Backend Core
- [x] Create Scheduler class
- [x] Create Publisher class
- [x] Implement repository pattern
- [ ] Add input validation
- [ ] Add error handling middleware
- [ ] Write unit tests for core logic

### Farcaster Integration
- [x] Set up Neynar client
- [x] Implement publishCast function
- [x] Implement createSigner function
- [ ] Implement lookupSigner function
- [ ] Add retry logic with backoff
- [ ] Handle rate limiting
- [ ] Mock Neynar for testing

### Database
- [x] Design schema
- [x] Create User repository
- [x] Create ScheduledCast repository
- [ ] Add database indexes
- [ ] Create initial migration
- [ ] Seed test data
- [ ] Write repository tests

### Worker
- [x] Set up cron job structure
- [x] Implement publish loop
- [ ] Add error logging
- [ ] Add metrics logging
- [ ] Test locally
- [ ] Deploy to Render

### Authentication
- [ ] Set up NextAuth.js
- [ ] Implement SIWF flow
- [ ] Create auth provider
- [ ] Store user + signer in DB
- [ ] Protect API routes
- [ ] Handle auth errors

### Web App - Basic UI
- [ ] Create landing page
- [ ] Create dashboard layout
- [ ] Create cast composer component
- [ ] Add date/time picker
- [ ] Create cast list view
- [ ] Add loading states
- [ ] Add error states

### API Routes
- [ ] POST /api/casts/schedule
- [ ] GET /api/casts
- [ ] GET /api/casts/[id]
- [ ] PATCH /api/casts/[id]
- [ ] DELETE /api/casts/[id]
- [ ] GET /api/user/stats

### Testing Phase 1
- [ ] Test auth flow end-to-end
- [ ] Test scheduling flow
- [ ] Test publishing flow
- [ ] Test error scenarios
- [ ] Test with real Farcaster account
- [ ] Fix critical bugs

### Deployment Phase 1
- [ ] Set up Netlify
- [ ] Configure environment variables
- [ ] Deploy web app
- [ ] Set up Render database
- [ ] Deploy worker
- [ ] Test production deployment

## Phase 2: Enhanced UX

### Calendar View
- [ ] Design calendar component
- [ ] Implement month view
- [ ] Add day/week views
- [ ] Show casts on calendar
- [ ] Implement drag & drop
- [ ] Handle timezone display

### Cast Management
- [ ] Bulk select casts
- [ ] Bulk delete
- [ ] Bulk reschedule
- [ ] Duplicate cast
- [ ] Edit scheduled cast
- [ ] Cancel scheduled cast

### Media Support
- [ ] Design upload UI
- [ ] Implement image picker
- [ ] Set up storage (Pinata/S3)
- [ ] Upload images
- [ ] Show image previews
- [ ] Handle upload errors
- [ ] Test with Neynar embeds

### UI Polish
- [ ] Add animations
- [ ] Improve loading states
- [ ] Add success notifications
- [ ] Add error notifications
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Accessibility audit

### Preview Features
- [ ] Cast preview component
- [ ] Show how cast will appear
- [ ] Character counter
- [ ] Link previews
- [ ] Emoji picker
- [ ] Mention autocomplete

## Phase 3: Advanced Features

### Thread Support
- [ ] Design thread UI
- [ ] Create thread model in DB
- [ ] Thread composer component
- [ ] Reorder thread casts
- [ ] Schedule entire thread
- [ ] Publish thread in order
- [ ] Handle thread failures

### Analytics
- [ ] Integrate Neynar analytics API
- [ ] Show cast engagement (likes, recasts, replies)
- [ ] Show historical performance
- [ ] Calculate best posting times
- [ ] Create analytics dashboard
- [ ] Export analytics data

### Multiple Accounts
- [ ] Store multiple signers per user
- [ ] Account switcher UI
- [ ] Per-account scheduling
- [ ] Unified view of all accounts
- [ ] Manage signer status

### Channel Support
- [ ] Add channel selector
- [ ] List available channels
- [ ] Schedule to specific channel
- [ ] Show channel-specific analytics

### Advanced Scheduling
- [ ] Recurring casts
- [ ] Queue mode (post next available slot)
- [ ] Optimal time suggestions
- [ ] Time slot templates
- [ ] Batch upload CSV

## Phase 4: Polish & Launch

### Performance
- [ ] Optimize database queries
- [ ] Add caching where appropriate
- [ ] Lazy load components
- [ ] Optimize images
- [ ] Bundle size optimization
- [ ] Lighthouse audit

### Documentation
- [ ] User guide
- [ ] FAQ
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] Video tutorials

### Landing & Marketing
- [ ] Design landing page
- [ ] Write copy
- [ ] Add testimonials
- [ ] Create demo video
- [ ] Set up pricing page
- [ ] Add blog

### User Onboarding
- [ ] Welcome flow
- [ ] Tutorial overlay
- [ ] Sample casts
- [ ] Quick start guide
- [ ] Help tooltips

### Monitoring & Alerts
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics (PostHog)
- [ ] Configure alerts
- [ ] Create status page
- [ ] Set up uptime monitoring

### Beta Testing
- [ ] Recruit beta testers
- [ ] Set up feedback form
- [ ] Monitor beta usage
- [ ] Fix reported bugs
- [ ] Iterate on feedback

### Launch Preparation
- [ ] Final QA pass
- [ ] Security audit
- [ ] Performance testing
- [ ] Backup strategy
- [ ] Rollback plan
- [ ] Launch checklist

### Launch!
- [ ] Deploy to production
- [ ] Announce on Farcaster
- [ ] Announce on Twitter
- [ ] Submit to directories
- [ ] Monitor closely
- [ ] Celebrate! 🎉

## Ongoing Maintenance

### Regular Tasks
- [ ] Monitor error rates
- [ ] Check queue depth
- [ ] Update dependencies
- [ ] Review user feedback
- [ ] Optimize performance
- [ ] Fix bugs
- [ ] Ship improvements

### Future Considerations
- [ ] Mobile app (React Native?)
- [ ] Browser extension
- [ ] Slack integration
- [ ] Zapier integration
- [ ] AI-powered features
- [ ] Advanced analytics

## Notes
- Review and update this list weekly
- Mark blockers immediately
- Celebrate completed phases
- Adjust scope as needed
- Keep MVP scope tight!
