import type { JournalEntry, VoiceMemory } from '@/types';
import { generateId } from '@/lib/ids';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const VOICE_MEMO_1_ID = 'voice-memo-seed-01';

export const SEED_ENTRIES: JournalEntry[] = [
  {
    id: generateId(),
    title: 'One of those strange days',
    body: `Today felt slightly out of focus, like looking through a window that hasn't been cleaned in a while. Not necessarily bad, just **unresolved**.

I spent the morning watching the rain collect on the balcony. There's something deeply calming about water finding its own path.

> "We do not write to be understood; we write to understand."

- Walked around the neighborhood
- Read a few pages of that old book
- Made coffee, twice`,
    mood: 'tired',
    voiceMemoryIds: [],
    createdAt: new Date(now - day * 0.1).toISOString(), // today
    updatedAt: new Date(now - day * 0.05).toISOString(),
  },
  {
    id: generateId(),
    title: 'Morning thoughts',
    body: `Woke up earlier than usual. The city is so quiet at 5 AM. It feels like the world is holding its breath.

I need to remember this stillness.`,
    mood: 'calm',
    voiceMemoryIds: [VOICE_MEMO_1_ID],
    createdAt: new Date(now - day * 1).toISOString(), // yesterday
    updatedAt: new Date(now - day * 1).toISOString(),
  },
  {
    id: generateId(),
    title: 'Grateful for the small things',
    body: `A good conversation with an old friend. Sometimes you don't realize how much you miss someone until you hear their voice.`,
    mood: 'grateful',
    voiceMemoryIds: [],
    createdAt: new Date(now - day * 3).toISOString(),
    updatedAt: new Date(now - day * 3).toISOString(),
  },
];

export const SEED_VOICE_MEMORIES: VoiceMemory[] = [
  {
    id: VOICE_MEMO_1_ID,
    title: 'Morning thoughts',
    durationSec: 151, // 02:31
    createdAt: new Date(now - day * 1).toISOString(),
    audioSrc: undefined, // Phase 1: no real audio
  },
  {
    id: generateId(),
    title: 'Evening walk ambient',
    durationSec: 45,
    createdAt: new Date(now - day * 5).toISOString(),
    audioSrc: undefined,
  }
];
