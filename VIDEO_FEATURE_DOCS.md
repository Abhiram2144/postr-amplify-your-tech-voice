# Video Analysis Feature

## Overview
The video analysis feature allows users to analyze video content from various platforms and generate optimized content for social media platforms.

## Supported Platforms

### Video URL Input
- **YouTube Shorts**: Paste any YouTube Shorts URL
  - Format: `youtube.com/shorts/VIDEO_ID`
  - Format: `youtu.be/VIDEO_ID`
  
- **TikTok**: Paste any TikTok video URL
  - Format: `tiktok.com/@username/video/VIDEO_ID`
  - Format: `vm.tiktok.com/SHORT_CODE`
  
- **Instagram Reels**: Paste any Instagram Reel URL
  - Format: `instagram.com/reel/VIDEO_ID`
  - Format: `instagram.com/p/VIDEO_ID`

### Direct File Upload
- **Supported formats**: MP4, MOV, WebM
- **Maximum file size**: 100MB
- **Recommended**: Videos under 5 minutes for faster processing

## How It Works

### 1. Input Phase
Users can choose between two methods:
- **Paste Link**: Simply paste a supported video URL
- **Upload File**: Drag and drop or browse to upload a video file

### 2. Processing Phase
The system will:
1. Validate the video source (URL or file)
2. Extract or download the video
3. Extract audio from the video
4. Transcribe the audio to text
5. Analyze the transcript for content insights

### 3. Analysis Phase
The transcript is analyzed for:
- Clarity score
- Hook strength
- Engagement potential
- Content structure
- Key topics and themes

### 4. Content Generation
Based on the analysis, the system generates:
- Platform-specific content adaptations
- Optimized captions and descriptions
- Hashtag recommendations
- Engagement hooks

## Implementation Status

### Current (v1.0)
- ✅ UI for video URL input
- ✅ UI for file upload
- ✅ URL validation for YouTube, TikTok, Instagram
- ✅ File type and size validation
- ✅ Mock transcript processing (demo mode)

### Planned (v1.1)
- ⏳ Video download from URLs
- ⏳ Audio extraction
- ⏳ Transcription integration (Whisper API, AssemblyAI, or Deepgram)
- ⏳ Real-time processing status updates
- ⏳ Video metadata extraction (duration, resolution, etc.)

### Future Enhancements (v2.0)
- 📋 Support for longer videos with chunking
- 📋 Multi-language transcription support
- 📋 Subtitle/caption file upload (.srt, .vtt)
- 📋 Visual content analysis (scene detection, key frames)
- 📋 Speaker diarization (multiple speakers)

## Technical Architecture

### Frontend
- Video URL validation in `src/lib/video-utils.ts`
- File upload handling with drag-and-drop
- Progress indicators for processing status

### Backend (Edge Function)
- Location: `supabase/functions/process-video/index.ts`
- Handles both URL and file inputs
- Integrates with transcription services
- Returns structured transcript and metadata

### Transcription Services (Options)

#### Option 1: OpenAI Whisper API
- **Pros**: High accuracy, good pricing
- **Cons**: Rate limits
- **Cost**: ~$0.006/minute

#### Option 2: AssemblyAI
- **Pros**: Fast, accurate, real-time capabilities
- **Cons**: Slightly higher cost
- **Cost**: ~$0.00025/second

#### Option 3: Deepgram
- **Pros**: Very fast, good accuracy
- **Cons**: Premium pricing
- **Cost**: ~$0.0125/minute

#### Option 4: Google Speech-to-Text
- **Pros**: Reliable, multi-language
- **Cons**: Complex setup
- **Cost**: ~$0.024/minute

## Testing Mode
When testing mode is enabled (default), the system uses mock transcript data to demonstrate the workflow without consuming actual video processing credits.

## Credit System
- Video processing counts towards monthly video credits
- Free: 2 videos/month
- Creator: 20 videos/month  
- Pro: 50 videos/month

## Error Handling
- Invalid URL formats show immediate feedback
- File size/type errors prevent upload
- Processing errors display user-friendly messages
- Failed transcriptions can be retried

## Privacy & Data
- Videos are not permanently stored
- Transcripts are saved to user's account
- Video URLs are not shared with third parties
- Uploaded files are deleted after processing
