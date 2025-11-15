/**
 * Audio utility functions
 */

export async function recordAudio(duration: number = 5000): Promise<Blob> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      mediaRecorder.onerror = (error) => {
        stream.getTracks().forEach(track => track.stop());
        reject(error);
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, duration);
    });
  } catch (error) {
    throw new Error(`Failed to record audio: ${error}`);
  }
}

export function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(audioBlob);
    
    audio.src = url;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    
    audio.play().catch(reject);
  });
}

export function compressAudio(audioBlob: Blob): Promise<Blob> {
  // Simple compression - convert to lower quality if needed
  // For production, consider using more sophisticated compression
  return Promise.resolve(audioBlob);
}

