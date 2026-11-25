---
status: accepted
date: 2026-11-25
decision-makers: project author
---

# Chinese word segmentation and dictionary lookup

## Context and Problem Statement

Captions arrive as Mandarin text with no spaces between words. In the
overlay, the user must be able to:

- **hover** a word to see a quick translation and its pinyin,
- **click** a word to save it, with the sentence it came from,
- **drag-select** any span of characters (like highlighting text in a
  browser) to see and save a phrase,
- **toggle pinyin** above the captions.

This requires answers to three questions: how captions are split into words,
where translations come from, and where pinyin comes from. Lookups happen
on every hover, so they must be instant and free.

## Decision Drivers

- Hover lookups feel instant and cost nothing per lookup
- The overlay and the web app show the same word boundaries
- The user can override bad automatic splits
- Correct pinyin for characters with more than one pronunciation
  (e.g. 行 is _háng_ in 银行 but _xíng_ in 不行)
- Minimal native dependencies in the Electron app

## Considered Options

**Segmentation**

- No segmentation (every character clickable on its own)
- `Intl.Segmenter` (built into JavaScript)
- jieba (`@node-rs/jieba`)
- An AI model segments each caption

**Translation and pinyin lookup**

- AI on every hover
- An online dictionary API
- CC-CEDICT bundled locally, with pinyin-pro as a pinyin fallback

## Decision Outcome

**Segmentation:** the API runs
`new Intl.Segmenter('zh-CN', { granularity: 'word' })` on each _final_
caption segment and stores the word boundaries (character offsets) with the
transcript. Partial (non-final) captions are shown but not clickable.

**Selection:** hovering highlights the stored word and clicking saves it.
Phrases use the browser's native text selection: on mouse-up, the overlay
reads the selected characters and offers the same popup and save action.

**Lookup:** CC-CEDICT is bundled and loaded into memory. A selection is
looked up as a whole. If it has no entry, it is shown as its longest
matching dictionary words. Pinyin comes from the matched CC-CEDICT entry,
which is per word and therefore picks the right reading. If no entry
exists, pinyin-pro generates it. Pinyin is displayed with HTML `<ruby>`
annotations when the toggle is on.

Lookup code lives in a shared package (planned name `@wal/zh`) used by the
overlay, API, and web app. AI is reserved for the web app, where it
explains meaning in the context of the saved sentence.

### Consequences

- Good, because hover lookups are local, instant, free, and work offline.
- Good, because word boundaries are computed once and stored, so every
  app shows the same words.
- Good, because drag-to-select lets the user correct any bad split, so
  segmentation does not have to be perfect.
- Good, because word-level pinyin is correct for most multi-pronunciation
  characters.
- Bad, because `Intl.Segmenter` is less accurate than dedicated tools on
  names, slang, and new words. If this becomes a problem, jieba can replace
  it behind the same function.
- Bad, because a dictionary lists every meaning of a word, not the one used
  in the sentence. Choosing the right meaning is left to the web app's AI
  step.
- Bad, because CC-CEDICT is licensed CC BY-SA. The app must credit it, and
  any changes to the dictionary data must be shared under the same license.
- Neutral: bundling the dictionary adds a few megabytes to the desktop app.

## Pros and Cons of the Options

### No segmentation

- Good, because it is trivial to build.
- Bad, because single characters often mean something different from the
  word they belong to (电 "electricity" vs. 电脑 "computer").

### `Intl.Segmenter`

- Good, because it is built into Node and Chromium, with no dependency.
- Bad, because it is less accurate than jieba on harder text.

### jieba (`@node-rs/jieba`)

- Good, because it is a widely used, fast, and generally more accurate
  Chinese segmenter, with custom dictionary support.
- Bad, because it is a native module, which adds build and packaging work.

### AI segmentation

- Good, because it can use context.
- Bad, because it is slow and costs money per caption, which is too much
  for live captions.

### AI on every hover

- Good, because it gives context-aware explanations.
- Bad, because it adds noticeable latency and cost to hundreds of hovers
  per session.

### Online dictionary API

- Good, because there is no data to bundle.
- Bad, because it adds network latency, rate limits, and a third-party
  dependency to every hover.

### CC-CEDICT + pinyin-pro

- Good, because it is free, offline, fast, and covers words and phrases
  with per-word pinyin.
- Bad, because of the share-alike license and context-free meanings (see
  above).
