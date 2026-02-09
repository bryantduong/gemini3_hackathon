export const recordAudio = (): Promise<{ blob: Blob; base64: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(",")[1];
          resolve({ blob: audioBlob, base64: base64String });
        };
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorder.start();
      
      // Stop recording after 5 seconds automatically for this demo to keep it simple, 
      // or we can expose a stop function. 
      // For a better UX, we'll return the stop function.
    } catch (error) {
      reject(error);
    }
  });
};

// Helper class to manage recording state more cleanly
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };

    this.mediaRecorder.start();
  }

  stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject("Recorder not initialized");

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          this.cleanup();
          resolve(base64);
        };
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
  }
}

// --- PCM Playback Utils for Gemini TTS ---

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playPCM(base64: string, audioContext: AudioContext): Promise<AudioBufferSourceNode> {
  const bytes = decodeBase64(base64);
  // Gemini TTS output is typically 24kHz mono PCM (16-bit linear)
  // Converting byte array to Int16
  const dataInt16 = new Int16Array(bytes.buffer);
  
  const sampleRate = 24000;
  const numChannels = 1;
  
  const buffer = audioContext.createBuffer(numChannels, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  // Normalize 16-bit integer to float [-1.0, 1.0]
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
  return source;
}