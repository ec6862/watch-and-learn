# Architecture

The system overview diagram is in the [README](../README.md#how-it-works).
This page shows what happens over time during one session. The reasoning
behind each part is in the [ADRs](adr/).

## One session, step by step

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant O as Overlay (Electron)
  participant A as API (NestJS)
  participant S as Speech-to-text
  participant D as PostgreSQL
  participant W as Web app

  U->>O: Start session
  O->>A: Open WebSocket and create session
  A->>D: Insert session
  loop While audio plays
    O->>A: Audio chunk (PCM)
    A->>S: Forward audio stream
    S-->>A: Partial transcript
    A-->>O: Partial caption (not clickable yet)
    S-->>A: Final transcript
    A->>A: Split into words (Intl.Segmenter)
    A->>D: Save segment + word boundaries
    A-->>O: Final caption + word boundaries
  end
  U->>O: Hover a word or drag-select a phrase
  O->>O: Look up in CC-CEDICT (@wal/zh)
  O-->>U: Popup with pinyin + meaning
  U->>O: Click to save
  O->>A: POST saved word + its sentence
  A->>D: Insert saved word
  U->>O: Done
  O->>A: End session
  A->>S: Close stream
  O->>W: Open session page in browser
  W->>A: GET session, transcript, saved words
  A->>D: Query
  A-->>W: Session data
  Note over A,D: Audio is never stored, only text
```

## Walkthrough

1. **Start (1–3):** The overlay opens a WebSocket to the API, which creates
   a session row.
2. **Live captions (4–11):** Audio is streamed in small chunks. The
   speech-to-text provider returns _partial_ results that may still change.
   These are shown but not clickable. When a result is _final_, the API
   splits it into words, saves it, and sends it to the overlay with word
   boundaries ([ADR 0002](adr/0002-speech-to-text-via-backend-with-text-only-storage.md),
   [ADR 0004](adr/0004-chinese-word-segmentation-and-dictionary-lookup.md)).
3. **Look up (12–14):** Hovering or drag-selecting looks the text up in a
   local dictionary inside the overlay. There is no network call, so the
   popup is instant.
4. **Save (15–17):** Clicking saves the word with the sentence it came from.
5. **Done (18–25):** The session ends, the speech-to-text stream closes, and
   the session opens in the web app, which loads it over REST.
