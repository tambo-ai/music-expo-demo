import { AudioContext, AudioBuffer } from "react-native-audio-api";

let cachedNoiseBuffer: AudioBuffer | null = null;

/**
 * Get (or create) a 1-second white noise AudioBuffer for drum synthesis.
 * Cached after first creation.
 */
export function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer) return cachedNoiseBuffer;

  const sampleRate = ctx.sampleRate;
  const length = sampleRate; // 1 second
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  cachedNoiseBuffer = buffer;
  return buffer;
}
