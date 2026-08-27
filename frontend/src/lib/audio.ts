/** Microphone capture + PCM conversion. No transcription logic lives here. */

export const TARGET_SAMPLE_RATE = 16000;

export interface AudioCaptureHandlers {
  onChunk: (chunk: ArrayBuffer, sampleRate: number) => void;
  onLevel?: (level: number) => void;
  onError?: (error: Error) => void;
}

export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export class AudioCapture {
  private stream: MediaStream | null = null;
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private raf = 0;

  constructor(private handlers: AudioCaptureHandlers) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          channelCount: 1, 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        },
      });
      const Ctx: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new Ctx({ sampleRate: 16000 });
      this.source = this.context.createMediaStreamSource(this.stream);

      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 512;
      this.source.connect(this.analyser);

      // Using 1024 buffer size = ~64ms chunks at 16kHz (Extreme low latency)
      this.processor = this.context.createScriptProcessor(1024, 1, 1);
      this.processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        this.handlers.onChunk(floatTo16BitPCM(input), this.context?.sampleRate ?? TARGET_SAMPLE_RATE);
      };
      this.source.connect(this.processor);
      this.processor.connect(this.context.destination);

      this.trackLevel();
    } catch (error) {
      this.handlers.onError?.(error as Error);
      throw error;
    }
  }

  private trackLevel() {
    if (!this.analyser || !this.handlers.onLevel) return;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i]! - 128) / 128;
        sum += v * v;
      }
      this.handlers.onLevel?.(Math.min(1, Math.sqrt(sum / data.length) * 3));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.processor?.disconnect();
    this.source?.disconnect();
    this.analyser?.disconnect();
    void this.context?.close().catch(() => undefined);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.processor = null;
    this.source = null;
    this.analyser = null;
    this.context = null;
    this.stream = null;
  }
}
