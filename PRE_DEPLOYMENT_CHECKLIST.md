# Pre-Deployment Checklist

## Local Environment (Before Pushing)

### Setup Verification
- [ ] `.env.local` has `MONGODB_URL` set correctly
- [ ] Database is accessible: `ping mongodb connection`
- [ ] All dependencies installed: `npm install` (no errors)
- [ ] No build errors: `npm run build` ✅

### Code Review
- [ ] All API routes call `await connectDB()` first
- [ ] All models imported from `@/src/models/`
- [ ] No direct `mongoose.model()` calls (using cache pattern)
- [ ] Error handling implemented in all routes

### Local Testing
- [ ] Start dev server: `npm run dev` ✅
- [ ] Test API endpoint twice (connection caching)
- [ ] Check console logs:
  - [ ] First call: "Creating new MongoDB connection..."
  - [ ] Second call: "Using cached MongoDB connection"
- [ ] Verify no "Schema hasn't been registered" errors
- [ ] Test error scenarios (invalid ID, missing data, etc.)

### Run Verification
```bash
# In browser or API client, call your verification endpoint
curl http://localhost:3000/api/[your-health-check-endpoint]
# Expected: { ok: true, status: "healthy", ... }
```

### Environment Variables Review
- [ ] `MONGODB_URL` is production-ready
- [ ] No sensitive data in code (all in .env)
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` updated (without passwords)

---

## Pre-Push Code Review

### Files Changed
- [ ] Reviewed `src/config/dbConfig.ts` changes
- [ ] Reviewed model file changes (User, Product)
- [ ] Reviewed API route changes
- [ ] Understand the connection caching pattern

### Best Practices Check
- [ ] All routes call `await connectDB()` first
- [ ] Read-only queries use `.lean()`
- [ ] Parallel queries use `Promise.all()`
- [ ] Error handling covers database errors
- [ ] Proper HTTP status codes (200, 400, 404, 500)

### Code Quality
- [ ] No `console.log` spam in production code
- [ ] Proper error messages (user-friendly)
- [ ] No hardcoded values or secrets
- [ ] TypeScript types are correct
- [ ] No unused imports

---

## Git Workflow

### Before Commit
- [ ] Test locally one more time
- [ ] Run TypeScript check: `tsc --noEmit`
- [ ] Run linter if available: `npm run lint`

### Commit
```bash
git add .
git commit -m "fix: mongoose vercel deployment issues

- Implement global connection caching for serverless
- Fix model registration preventing re-compilation errors
- Validate connection state before executing queries
- Optimize all models for production
- Add comprehensive documentation and examples"
```

### Before Push
- [ ] Review commit: `git show`
- [ ] Verify branch: `git status`
- [ ] Pull latest: `git pull origin main`

### Push
```bash
git push origin main
# or create PR for review first
git push origin feature/mongoose-fixes
```

---

## Vercel Deployment

### Automatic (Recommended)
- [ ] Vercel auto-deploys on push
- [ ] Monitor deployment progress in dashboard
- [ ] Check build logs for errors
- [ ] Wait for "Deployed Successfully" ✅

### Manual Deployment (If Needed)
```bash
vercel deploy --prod
```

---

## Post-Deployment (Production)

### Immediate (First 5 Minutes)
- [ ] Vercel deployment completed ✅
- [ ] No deployment errors in logs
- [ ] Production URL accessible
- [ ] Check Vercel logs for MongoDB messages:
  - [ ] "Creating new MongoDB connection..." (first invocation)
  - [ ] "Using cached MongoDB connection" (subsequent invocations)

### API Testing (Next 15 Minutes)
- [ ] Test basic endpoint: `GET /api/marketplace/products/[id]`
- [ ] Should return product data ✅
- [ ] Call same endpoint again - should be faster
- [ ] Test with invalid ID - should return 404
- [ ] Check response times improving

### Health Check (30 Minutes)
- [ ] Set up health endpoint if not already done
- [ ] Test: `GET /api/health` or `/api/[your-health-endpoint]`
- [ ] Expected response: `{ ok: true, status: "healthy" }`
- [ ] All models should be registered (count: 11)

### Monitoring (Next 24 Hours)
- [ ] Monitor Vercel dashboard for errors
- [ ] Check error rate is 0% or near 0%
- [ ] Monitor response times (should be < 500ms)
- [ ] Watch for any "Schema hasn't been registered" errors
- [ ] Monitor database connections (shouldn't exceed 20-30)

---

## If Issues Occur

### "Schema hasn't been registered" Error
1. [ ] Check all models use: `mongoose.models.X || mongoose.model(X)`
2. [ ] Clear `.next` build folder and rebuild
3. [ ] Redeploy to Vercel

### "Product Not Found" on First Load
1. [ ] Verify `await connectDB()` is called first
2. [ ] Check MongoDB Atlas whitelist includes Vercel IPs
3. [ ] Verify MONGODB_URL in Vercel environment variables
4. [ ] Redeploy

### Connection Timeouts
1. [ ] Check MongoDB Atlas connection limits
2. [ ] Review connection pool settings in dbConfig.ts
3. [ ] Check Vercel function timeout (increase if needed)
4. [ ] Contact MongoDB support if persists

### Database Errors in Logs
1. [ ] Run `verifyMongooseSetup()` locally
2. [ ] Compare with production (use logs)
3. [ ] Check error message in `MONGOOSE_VERCEL_FIXES.md` → Troubleshooting
4. [ ] Review example route implementation

---

## Rollback Plan (If Critical Issues)

If production is down:

```bash
# 1. Identify last working commit
git log --oneline -10

# 2. Revert to stable version
git revert HEAD
git push origin main

# 3. Vercel will redeploy automatically
# Wait for "Deployed Successfully" in Vercel dashboard

# 4. After emergency stabilization
# Debug locally and investigate root cause
# Create targeted fix
# Test thoroughly
# Deploy again
```

---

## Success Criteria

✅ All of the following should be true:

1. **Functionality**
   - [ ] Products load on first page load
   - [ ] No "Schema hasn't been registered" errors
   - [ ] API endpoints respond in < 500ms
   - [ ] Database queries work correctly

2. **Connection Caching**
   - [ ] Logs show "Using cached MongoDB connection" on repeat calls
   - [ ] No multiple "Creating new MongoDB connection..." logs per request
   - [ ] Connection pool size stable (5-20 connections)

3. **Error Handling**
   - [ ] Invalid requests return appropriate error codes
   - [ ] Database errors logged but don't crash app
   - [ ] Users see friendly error messages

4. **Stability**
   - [ ] Zero downtime after deployment
   - [ ] No memory leaks (monitor over 24 hours)
   - [ ] Response times consistent
   - [ ] No error spikes

---

## Performance Benchmarks

### Expected Performance
| Metric | Before | After | Target |
|--------|--------|-------|--------|
| First Request | ~2000ms | ~1500ms | < 2000ms |
| Cached Request | ~1500ms | ~200ms | < 500ms |
| Model Load Time | Errors | OK | ✅ |
| Connection Pool | Issues | Stable | 5-20 connections |

---

## Documentation References

- **Quick Start**: `MONGOOSE_QUICK_REFERENCE.md`
- **Full Guide**: `MONGOOSE_VERCEL_FIXES.md`
- **Implementation Example**: `src/app/api/example-product-route/route.ts`
- **Verification Utility**: `src/utils/mongooseVerify.ts`

---

## Team Communication

### Before Deployment
- [ ] Notify team about deployment
- [ ] Share this checklist
- [ ] Provide rollback procedure

### After Deployment
- [ ] Share success metrics
- [ ] Link to documentation
- [ ] Schedule team review (optional)

---

## Long-term Maintenance

### Weekly
- [ ] Monitor Vercel logs for issues
- [ ] Check error rate
- [ ] Review response times

### Monthly
- [ ] Run full verification: `verifyMongooseSetup()`
- [ ] Review database connections
- [ ] Update documentation if needed

### Quarterly
- [ ] Audit all API routes follow pattern
- [ ] Update MongoDB connection string if changed
- [ ] Review Mongoose best practices

---

## Sign-Off

- [ ] Pre-deployment checklist complete
- [ ] Team reviewed changes
- [ ] Deployment approved
- [ ] Monitoring plan in place

**Ready to Deploy**: ✅ Yes / ❌ No

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Reviewed By**: _______________

---

For questions or issues, refer to `MONGOOSE_VERCEL_FIXES.md` → Troubleshooting section.
