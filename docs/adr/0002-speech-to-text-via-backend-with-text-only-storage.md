---
status: accepted
date: 2026-11-24
decision-makers: project author
---

# Speech-to-text via the backend, with text-only storage

## Context and Problem Statement

The desktop app captures system audio (shows, videos) and needs live
Chinese captions. The first target language is Mandarin with Simplified
characters (`zh-CN`). Two questions follow:

1. **Where does transcription happen**: on the user's machine, directly
   from the desktop app to a cloud provider, or through our backend?
2. **What do we store**: audio, text, or both?

## Decision Drivers

- No cloud API keys inside a desktop app that anyone can unpack
- Freedom to switch speech-to-text providers without shipping a new
  desktop build
- Real-time captions, with latency low enough to follow dialogue
- Privacy and copyright: avoid keeping copies of media audio or people's
  voices
- Low cost and low setup for a single developer

## Considered Options

- On-device transcription (e.g. a local Whisper model)
- Desktop app streams directly to a cloud provider
- Desktop app streams to our NestJS API, which streams to a cloud provider

## Decision Outcome

Chosen option: **stream through the NestJS API**. The desktop app sends
audio chunks to the API over a WebSocket. The API forwards them to the
speech-to-text provider and sends caption text back over the same
connection.

**Only text is stored**: transcript segments and saved words. Audio exists
only in memory while it is streamed, and is never written to disk or the
database.

The provider is not chosen yet. Both candidates support streaming Mandarin
(and Cantonese): AWS Transcribe (`zh-CN`) and Deepgram Nova-3 (`zh-CN`).
The API hides the provider behind a single interface, so the choice can be
made with real latency and accuracy measurements, and changed later.

### Consequences

- Good, because provider credentials live only on the server.
- Good, because providers can be compared or swapped by changing one
  backend module.
- Good, because the stored data is small and holds no audio, which keeps
  storage cheap and avoids storing copyrighted media.
- Bad, because the extra network hop (desktop → API → provider) adds some
  latency.
- Bad, because the API must handle long-lived WebSocket connections and
  stream backpressure.
- Bad, because audio cannot be replayed later. Caption text is the only
  record, so transcription errors cannot be re-checked against the source.
- Neutral: Chinese text has no spaces between words, so making individual
  words clickable needs a word-segmentation step. This will get its own
  decision record.

## Pros and Cons of the Options

### On-device transcription

- Good, because audio never leaves the machine and there is no per-minute
  cost.
- Bad, because accurate real-time models need significant CPU/GPU, and
  results vary widely across user hardware.
- Bad, because shipping and updating a large model makes the desktop app
  much bigger.

### Desktop app streams directly to a provider

- Good, because it is the lowest-latency path.
- Bad, because the app needs credentials. Embedded keys can be extracted.
  Short-lived credentials still require a backend to issue them.
- Bad, because switching providers means releasing a new desktop build.

### Through our backend

- Good, because it keeps keys server-side and the provider swappable, and
  it is the natural place to save transcripts.
- Bad, because of the extra hop and WebSocket infrastructure (see above).
