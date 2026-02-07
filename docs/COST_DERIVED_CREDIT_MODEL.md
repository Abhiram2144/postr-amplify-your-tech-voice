# Postr Cost-Derived Credit Model

## Overview

Credits in Postr are **derived from actual backend costs**, not arbitrary unit assignments. This ensures transparent pricing, fair usage, and sustainable margins as the product scales.

---

## Real Cost Analysis Per Task

### 1. AssemblyAI Transcription
| Metric | Value |
|--------|-------|
| Pricing Model | $0.00025/second (Nano tier) or $0.00037/second (Best tier) |
| Average Short Duration | 60 seconds |
| **Cost per video** | $0.015 - $0.022 |

### 2. LLM Generation (Gemini via AI Gateway)
| Task | Input Tokens | Output Tokens | Cost/1M In | Cost/1M Out | Total |
|------|--------------|---------------|------------|-------------|-------|
| Intent Inference | ~1,500 | ~300 | $0.075 | $0.30 | $0.0002 |
| Content Generation (per platform) | ~2,000 | ~500 | $0.075 | $0.30 | $0.0003 |
| 3 Platforms | ~6,000 | ~1,500 | $0.075 | $0.30 | $0.0009 |

### 3. YouTube Data API
| Metric | Value |
|--------|-------|
| Quota Cost | 1 unit per video metadata fetch |
| Daily Quota | 10,000 units (free) |
| **Effective Cost** | $0 (within free tier) |

### 4. Infrastructure Overhead
| Component | Estimate |
|-----------|----------|
| Edge Function Execution | ~$0.0001 per invocation |
| Supabase Read/Write | ~$0.0001 per operation |
| Network/Egress | ~$0.0001 per request |

---

## Cost Breakdown by Task Type

### Video Intelligence (New Analysis)
```
AssemblyAI Transcription:    $0.018 (avg 60s video)
YouTube API:                 $0.000 (free tier)
Intent Inference (LLM):      $0.0002
Content Generation (3 plat): $0.0009
Infrastructure:              $0.0003
─────────────────────────────────────
TOTAL:                       $0.0194
With 50% margin:             $0.029
```

### Video Intelligence (Cached Transcript)
```
AssemblyAI:                  $0.000 (cache hit)
Intent Inference:            $0.0002
Content Generation (3 plat): $0.0009
Infrastructure:              $0.0002
─────────────────────────────────────
TOTAL:                       $0.0013
With 50% margin:             $0.002
```

### Text-Only Generation
```
Content Generation (3 plat): $0.0009
Infrastructure:              $0.0002
─────────────────────────────────────
TOTAL:                       $0.0011
With 50% margin:             $0.0016
```

---

## Credit Model

### Base Credit Value
```
1 CREDIT = $0.02 USD (with ~50% margin)
```

### Credit Calculation Formula
```typescript
function calculateCredits(task: Task): number {
  let baseCost = 0;
  
  // Transcription cost (only if not cached)
  if (task.type === 'video' && !task.cached) {
    baseCost += task.videoDurationSeconds * 0.00025; // AssemblyAI Nano
  }
  
  // LLM costs
  baseCost += 0.0002; // Intent inference
  baseCost += task.platformCount * 0.0003; // Generation per platform
  
  // Infrastructure
  baseCost += 0.0003;
  
  // Apply margin and convert to credits
  const withMargin = baseCost * 1.5;
  return Math.ceil(withMargin / 0.02); // Round up to nearest credit
}
```

### Credit Examples

| Scenario | Real Cost | Credits (1 = $0.02) |
|----------|-----------|---------------------|
| New YouTube Short (60s, 3 platforms) | $0.019 | 1 credit |
| Cached video (3 platforms) | $0.001 | 1 credit (minimum) |
| Text idea (3 platforms) | $0.001 | 1 credit (minimum) |
| New YouTube Short (120s, 5 platforms) | $0.035 | 2 credits |

---

## Plan Credit Allocations (Cost-Justified)

| Plan | Credits | Cost to Serve | Revenue | Margin |
|------|---------|---------------|---------|--------|
| Free | 10 | $0.20 | $0 | -$0.20 (acquisition cost) |
| Creator ($14/mo) | 60 | $1.20 | $14 | 91% |
| Pro ($29/mo) | 150 | $3.00 | $29 | 90% |

---

## Implementation Rules

### 1. Credits Scale with Cost
- Longer videos = more credits (transcription time)
- More platforms = more credits (LLM output tokens)
- Cached content = reduced credits

### 2. Adjustable Without UX Changes
Credit-to-dollar conversion is stored server-side:
```sql
-- In a future settings table
credit_value_usd: 0.02
```

### 3. Cache Reduces Credits
```typescript
// In generate-content edge function
const isCached = await checkTranscriptCache(videoUrl, userId);
const credits = isCached ? 1 : calculateFullCredits(videoDuration);
```

### 4. Failed Steps Don't Deduct
```typescript
try {
  await transcribe(video);
  await generateContent(transcript);
  await deductCredits(userId, credits); // Only after success
} catch (error) {
  // No credit deduction on failure
  throw error;
}
```

---

## Quality Differentiation

Credits are optimized for **insight density**, not volume:

1. **Intent Inference First** - Every generation starts with understanding creator intent
2. **No Generic Paraphrasing** - Output must preserve original thinking
3. **Platform-Native Optimization** - Each platform gets tailored content, not copy-paste
4. **Video Context Preservation** - Transcripts inform tone and audience targeting

---

## Future Enhancements

1. **Dynamic Credit Pricing** - Adjust `credit_value_usd` based on API cost changes
2. **Usage Analytics** - Track actual costs vs projected for margin optimization
3. **Tiered Video Credits** - Shorter videos cost less than longer ones
4. **Bulk Discounts** - Reduced per-credit cost for high-volume plans
