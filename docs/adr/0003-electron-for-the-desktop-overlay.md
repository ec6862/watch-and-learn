---
status: accepted
date: 2026-11-24
decision-makers: project author
---

# Electron for the desktop overlay

## Context and Problem Statement

The user watches content in any app (a browser, a streaming app, a local
video player). watch-and-learn needs a desktop window that:

- captures **system audio** (everything the computer is playing),
- floats **transparently on top** of other windows, showing captions as the
  audio plays,
- lets clicks **pass through** to the video underneath, until the user
  hovers over the captions,
- lets the user **hover or click a word or phrase** in the captions to see
  a quick translation and save it for later,
- shares TypeScript types and the API client with the rest of the
  monorepo.

Which desktop technology should build it? The development platform is
Windows.

## Decision Drivers

- System audio capture on Windows without a virtual audio driver
- Transparent, always-on-top, click-through windows that can still detect
  hover
- Same language (TypeScript) and UI library (React) as the web app
- A path to macOS later
- Learnable by one developer within the project timeline

## Considered Options

- Electron
- Tauri
- Native Windows app (C# with WPF or WinUI)
- Browser extension

## Decision Outcome

Chosen option: **Electron**. It embeds Chromium, whose screen-capture
pipeline can include system audio. In the main process,
`session.setDisplayMediaRequestHandler` grants `audio: 'loopback'`, and the
renderer receives an audio stream through the standard `getDisplayMedia()`
web API. Electron's `BrowserWindow` supports transparent, frameless,
always-on-top windows. `setIgnoreMouseEvents(true, { forward: true })`
makes the window click-through while still receiving mouse-move events, so
the overlay can detect when the user hovers over the captions and switch to
interactive mode. Everything is TypeScript and can import `@wal/types`
directly.

### Consequences

- Good, because system audio capture uses a documented Electron API with
  no native code.
- Good, because hover detection on a click-through window is built in
  (Windows and macOS).
- Good, because the overlay UI is React and TypeScript, the same as the
  web app.
- Good, because the same code can target macOS later. Recent Electron
  versions support system audio loopback on macOS 14.2+.
- Bad, because Electron apps are large (they bundle Chromium) and use more
  memory than native or Tauri apps.
- Bad, because Electron's main/renderer process model, IPC, and security
  settings (context isolation, preload scripts) are new to learn.
- Bad, because on Windows, mouse-move forwarding pauses while an elevated
  window (e.g. Task Manager or an installer) is active, so hover detection
  briefly stops working in that case.

## Pros and Cons of the Options

### Electron

- Good, because of the audio, window, and TypeScript reasons above.
- Bad, because of the size and memory cost.

### Tauri

- Good, because apps are much smaller and lighter, using the OS webview.
- Bad, because system audio capture would need custom Rust code (e.g.
  Windows WASAPI loopback), which adds a language and a native layer.

### Native Windows (C# WPF/WinUI)

- Good, because it has the best performance and full OS access.
- Bad, because it is a different language, nothing is shared with the
  TypeScript monorepo, and it is Windows-only.

### Browser extension

- Good, because it is easy to install and is already where much video is
  watched.
- Bad, because it can only capture browser tab audio, not desktop apps or
  local video players.
- Bad, because it cannot draw an overlay outside the browser.
