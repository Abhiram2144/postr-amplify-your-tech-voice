# Process Video Edge Function

## Overview
This Supabase Edge Function processes video content from URLs or uploaded files, extracting transcripts and metadata for content generation.

## Setup Instructions

### 1. Environment Variables
Add these to your Supabase project settings:

```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Choose ONE transcription service:

# Option A: OpenAI Whisper
OPENAI_API_KEY=your_openai_api_key

# Option B: AssemblyAI
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Option C: Deepgram
DEEPGRAM_API_KEY=your_deepgram_api_key

# Option D: Google Cloud Speech-to-Text
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_API_KEY=your_api_key
```

### 2. Deploy the Function

```bash
# Navigate to your project directory
cd supabase/functions

# Deploy the function
supabase functions deploy process-video

# Set environment variables
supabase secrets set OPENAI_API_KEY=your_key_here
```

### 3. Test the Function

```bash
# Test locally
supabase functions serve process-video

# Send a test request
curl -X POST http://localhost:54321/functions/v1/process-video \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://youtube.com/shorts/example",
    "userId": "test-user-id"
  }'
```

## Implementation Steps

### Phase 1: Basic Transcript Extraction
1. Download video from URL or receive uploaded file
2. Extract audio track
3. Send audio to transcription service
4. Return raw transcript

### Phase 2: Enhanced Processing
1. Add metadata extraction (duration, resolution, etc.)
2. Implement progress tracking
3. Add error recovery and retry logic
4. Support for multiple audio tracks

### Phase 3: Advanced Features
1. Speaker diarization
2. Timestamp generation
3. Key moment detection
4. Visual content analysis

## API Integration Examples

### OpenAI Whisper API

```typescript
async function transcribeWithWhisper(audioBuffer: ArrayBuffer) {
  const formData = new FormData();
  formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.text;
}
```

### AssemblyAI

```typescript
async function transcribeWithAssemblyAI(audioUrl: string) {
  // 1. Upload audio
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'authorization': Deno.env.get('ASSEMBLYAI_API_KEY'),
      'content-type': 'application/octet-stream',
    },
    body: audioBuffer,
  });
  
  const { upload_url } = await uploadResponse.json();

  // 2. Start transcription
  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': Deno.env.get('ASSEMBLYAI_API_KEY'),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: upload_url }),
  });

  const { id } = await transcriptResponse.json();

  // 3. Poll for completion
  let transcript;
  while (true) {
    const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: {
        'authorization': Deno.env.get('ASSEMBLYAI_API_KEY'),
      },
    });
    
    transcript = await pollingResponse.json();
    
    if (transcript.status === 'completed') break;
    if (transcript.status === 'error') throw new Error(transcript.error);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return transcript.text;
}
```

## Video Download Utilities

### YouTube (using yt-dlp)
```typescript
async function downloadYouTubeVideo(url: string): Promise<string> {
  // Use yt-dlp or youtube-dl
  const process = Deno.run({
    cmd: ['yt-dlp', '-f', 'bestaudio', '-o', '/tmp/video.%(ext)s', url],
    stdout: 'piped',
    stderr: 'piped',
  });
  
  await process.status();
  return '/tmp/video.webm';
}
```

### TikTok
```typescript
async function downloadTikTokVideo(url: string): Promise<ArrayBuffer> {
  // Use TikTok API or scraping service
  const response = await fetch(`https://api.tiktokapi.io/download?url=${encodeURIComponent(url)}`, {
    headers: {
      'Authorization': `Bearer ${Deno.env.get('TIKTOK_API_KEY')}`,
    },
  });
  
  return await response.arrayBuffer();
}
```

## Error Handling

```typescript
try {
  const transcript = await processVideo(videoUrl);
  return { success: true, transcript };
} catch (error) {
  console.error('Video processing error:', error);
  
  // Log to monitoring service
  await logError(error, { videoUrl, userId });
  
  // Return user-friendly error
  if (error.message.includes('rate limit')) {
    return { error: 'Service is busy. Please try again in a few minutes.' };
  }
  
  if (error.message.includes('invalid url')) {
    return { error: 'Invalid video URL. Please check the link and try again.' };
  }
  
  return { error: 'Unable to process video. Please try again or contact support.' };
}
```

## Performance Considerations

- **Video Download**: Can take 5-30 seconds depending on video size
- **Audio Extraction**: Usually 1-5 seconds
- **Transcription**: ~0.5x real-time (5-minute video = 2-3 minutes to transcribe)
- **Total Processing**: Expect 3-5 minutes for a 5-minute video

## Cost Estimates

Per minute of video:
- OpenAI Whisper: $0.006
- AssemblyAI: $0.015
- Deepgram: $0.0125
- Storage: ~$0.00001 (negligible)

## Monitoring & Logging

Track these metrics:
- Processing success/failure rate
- Average processing time
- API cost per video
- Error types and frequency
- User satisfaction with transcripts

## Security Considerations

1. **Rate Limiting**: Implement per-user rate limits
2. **File Size Limits**: Enforce 100MB max file size
3. **URL Validation**: Only allow whitelisted domains
4. **Virus Scanning**: Scan uploaded files
5. **Content Moderation**: Check for inappropriate content
6. **API Key Security**: Never expose keys in client code

## Testing Checklist

- [ ] YouTube Shorts URL processing
- [ ] TikTok URL processing
- [ ] Instagram Reel URL processing
- [ ] Direct file upload (MP4)
- [ ] Direct file upload (MOV)
- [ ] Direct file upload (WebM)
- [ ] Large file handling (>50MB)
- [ ] Invalid URL error handling
- [ ] Network timeout handling
- [ ] Transcription error handling
- [ ] Concurrent request handling
- [ ] Credit deduction logic
