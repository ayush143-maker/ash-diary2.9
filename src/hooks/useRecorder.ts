import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { VoiceRecorder } from 'capacitor-voice-recorder';

/**
 * Plugin choice: capacitor-voice-recorder (tchvu3) — the original,
 * most-forked recorder plugin in the Capacitor ecosystem, actively
 * maintained (v7.0.6). Ionic's own "@capacitor/voice-recorder" and
 * "@capacitor-community/voice-recorder" do not exist as published
 * packages — verified against the npm registry before adding this
 * dependency; do not swap in either of those names.
 */

export type RecorderStatus = 'idle' | 'recording' | 'paused';
export type RecorderPermission = 'unknown' | 'granted' | 'denied';

export interface RecorderState {
  status: RecorderStatus;
  durationSec: number;
  waveform: number[];
  permission: RecorderPermission;
}

const RECORDINGS_DIR = 'voice-memories';
const isNative = () => Capacitor.isNativePlatform();

async function ensureDir() {
  try {
    await Filesystem.mkdir({ path: RECORDINGS_DIR, directory: Directory.Data, recursive: true });
  } catch {
    // already exists — fine
  }
}

/** Prefer the same codec family native uses (m4a/AAC), fall back to webm. */
const MIME_CANDIDATES = [
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/webm;codecs=opus',
  'audio/webm',
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Web-preview fallback (npm run dev) using MediaRecorder.
 *
 * FORMAT FIX (issue #3): the blob is no longer hard-tagged 'audio/webm'.
 * The mime is negotiated up front via isTypeSupported (preferring the
 * mp4/AAC family native produces), and the final blob is tagged with the
 * MediaRecorder's ACTUAL mimeType — so the type always matches the bytes
 * and strict players can't reject it.
 */
function useWebFallbackRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef = useRef<string>('audio/webm');

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return true;
    } catch {
      return false;
    }
  }, []);

  const begin = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const preferred = pickMimeType();
    const recorder = preferred
      ? new MediaRecorder(streamRef.current, { mimeType: preferred })
      : new MediaRecorder(streamRef.current);
    mimeRef.current = recorder.mimeType || preferred || 'audio/webm';
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.start();
    mediaRecorderRef.current = recorder;
  }, []);

  const pause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') recorder.pause();
  }, []);

  const resume = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'paused') recorder.resume();
  }, []);

  const finish = useCallback((): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return resolve(undefined);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeRef.current });
        resolve(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      recorder.stop();
    });
  }, []);

  const abort = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  return { requestPermission, begin, pause, resume, finish, abort };
}

/**
 * Real (or web-preview-fallback) voice recorder state machine.
 *
 * TIMER BUG FIX: the 1s tick interval starts BEFORE the native plugin
 * call is awaited. startRecording() can settle late (or reject) right
 * after a permission grant on Android; awaiting it first is what froze
 * the timer at 00:00 until a pause/resume cycle "fixed" it. Every plugin
 * call is wrapped in try/catch so a rejection can never leave the UI dead.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>({
    status: 'idle',
    durationSec: 0,
    waveform: Array(40).fill(0.2),
    permission: 'unknown',
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webFallback = useWebFallbackRecorder();

  const tick = useCallback(() => {
    setState((prev) => ({
      ...prev,
      durationSec: prev.durationSec + 1,
      waveform: prev.waveform.map(() => 0.1 + Math.random() * 0.9),
    }));
  }, []);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isNative()) {
      try {
        const { value } = await VoiceRecorder.requestAudioRecordingPermission();
        setState((prev) => ({ ...prev, permission: value ? 'granted' : 'denied' }));
        return value;
      } catch {
        setState((prev) => ({ ...prev, permission: 'denied' }));
        return false;
      }
    }
    const granted = await webFallback.requestPermission();
    setState((prev) => ({ ...prev, permission: granted ? 'granted' : 'denied' }));
    return granted;
  }, [webFallback]);

  /** Starts the tick immediately; returns false if capture could not start. */
  const start = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, status: 'recording', durationSec: 0, waveform: Array(40).fill(0.2) }));
    clearTick();
    intervalRef.current = setInterval(tick, 1000);
    try {
      if (isNative()) {
        await VoiceRecorder.startRecording();
      } else {
        webFallback.begin();
      }
      return true;
    } catch (error) {
      console.error('Recording failed to start:', error);
      clearTick();
      setState((prev) => ({ ...prev, status: 'idle', durationSec: 0 }));
      return false;
    }
  }, [tick, webFallback]);

  const pause = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'paused' }));
    clearTick();
    try {
      if (isNative()) await VoiceRecorder.pauseRecording();
      else webFallback.pause();
    } catch (error) {
      console.error('Pause failed:', error);
    }
  }, [webFallback]);

  const resume = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'recording' }));
    clearTick();
    intervalRef.current = setInterval(tick, 1000);
    try {
      if (isNative()) await VoiceRecorder.resumeRecording();
      else webFallback.resume();
    } catch (error) {
      console.error('Resume failed:', error);
    }
  }, [tick, webFallback]);

  /** Stops capture and returns the persisted local file URI, if any. */
  const stop = useCallback(async (): Promise<string | undefined> => {
    setState((prev) => ({ ...prev, status: 'idle' }));
    clearTick();

    if (isNative()) {
      try {
        const result = await VoiceRecorder.stopRecording();
        const base64 = result.value.recordDataBase64;
        if (!base64) return undefined;
        const mime = result.value.mimeType || 'audio/aac';
        await ensureDir();
        const ext = mime.includes('mp4') || mime.includes('aac') ? 'm4a' : 'webm';
        const fileName = `${RECORDINGS_DIR}/${Date.now()}.${ext}`;
        await Filesystem.writeFile({ path: fileName, directory: Directory.Data, data: base64 });
        const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Data });
        return uri;
      } catch (error) {
        console.error('Recording save failed:', error);
        return undefined;
      }
    }
    return webFallback.finish();
  }, [webFallback]);

  const cancel = useCallback(() => {
    setState((prev) => ({
      status: 'idle',
      durationSec: 0,
      waveform: Array(40).fill(0.2),
      permission: prev.permission,
    }));
    clearTick();
    if (isNative()) {
      VoiceRecorder.stopRecording().catch(() => {});
    } else {
      webFallback.abort();
    }
  }, [webFallback]);

  useEffect(() => {
    return () => clearTick();
  }, []);

  return { ...state, requestPermission, start, pause, resume, stop, cancel };
}
