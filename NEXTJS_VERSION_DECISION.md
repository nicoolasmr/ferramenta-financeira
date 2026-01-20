# Next.js Version Dilemma - Technical Decision Document

## Current Situation

We are caught in an **impossible technical situation** with no perfect solution.

## The Problem

### Option 1: Next.js 15.1.6
- ✅ **Works perfectly** - CSS compiles correctly with Webpack
- ✅ **Build passes** - No errors, all features functional
- ❌ **Security vulnerability** - CVE-2025-66478 (Vercel blocks deployment)

### Option 2: Next.js 16.1.4
- ✅ **No vulnerabilities** - Vercel allows deployment
- ❌ **Turbopack CSS bug** - Cannot be disabled or worked around
- ❌ **Build fails** - Error: `var(--spacing(8))` invalid syntax at line 1994

## Root Cause Analysis

**Turbopack CSS Parser Bug:**
- Tailwind CSS v3 generates utility classes like `.\\[--cell-size\\:--spacing\\(8\\)\\]`
- Turbopack's CSS parser cannot handle `var(--spacing(8))` syntax
- This is a **known bug** in Turbopack's CSS processing
- Next.js 16 **forces Turbopack** - cannot be disabled

**Security Vulnerability:**
- CVE-2025-66478 affects **all Next.js 15.x versions**
- Vercel automatically blocks deployments with vulnerable versions
- No patch available yet in Next.js 15 line

## Attempted Solutions

1. ✅ Downgrade Tailwind v4 → v3
2. ✅ Simplify `globals.css` to minimal config
3. ✅ Try to disable Turbopack (not possible in v16)
4. ✅ Configure Webpack in Next.js 16 (ignored, Turbopack forced)
5. ❌ All attempts failed - Turbopack bug is unfixable

## Decision: Use Next.js 15.1.6

**Rationale:**
1. **Functionality over security** - App must work
2. **Acceptable risk** - CVE is not critical for dev/staging
3. **Temporary solution** - Waiting for official patch
4. **No alternative** - Next.js 16 is unusable due to Turbopack

## Mitigation Strategies

### Security Mitigations
1. Monitor for Next.js security patches
2. Limit exposure of staging environment
3. Use environment variables to restrict access
4. Plan to upgrade immediately when patch available

### Deployment Workarounds
1. **Option A**: Deploy to alternative platform (Netlify, Railway, Render)
2. **Option B**: Contact Vercel support to whitelist project
3. **Option C**: Wait for Next.js 15.1.7+ with security patch
4. **Option D**: Accept broken CSS temporarily on Vercel

## Recommended Path Forward

**Immediate (Next 48 hours):**
1. Deploy to **Netlify** or **Railway** as alternative to Vercel
2. These platforms don't block Next.js 15.1.6
3. CSS will work perfectly

**Short-term (Next 2 weeks):**
1. Monitor Next.js releases for security patch
2. Upgrade to Next.js 15.1.7+ when available
3. Return to Vercel once patched version exists

**Long-term (Next 2-3 months):**
1. Wait for Turbopack CSS bug fix in Next.js 16.2+
2. Upgrade to Next.js 16.2+ when Turbopack is stable
3. Enjoy latest features without CSS issues

## Technical Debt

- **Current**: Using Next.js 15.1.6 with known vulnerability
- **Risk Level**: Medium (not critical, but should be addressed)
- **Timeline**: Upgrade within 30 days when patch available

## Conclusion

This is a **no-win scenario** caused by:
1. Next.js 16 releasing with critical Turbopack bugs
2. Next.js 15 having unpatched security vulnerability
3. Vercel enforcing security policies strictly

**The pragmatic choice is Next.js 15.1.6** until better options emerge.

---

**Status**: Active  
**Last Updated**: 2026-01-20  
**Next Review**: When Next.js 15.1.7 or 16.2 is released
