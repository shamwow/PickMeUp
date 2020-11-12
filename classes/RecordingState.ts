import { Audio } from 'expo-av';

export class RecordingState {
  recording: Audio.Recording;
  status: Audio.RecordingStatus;

  constructor(recording: Audio.Recording, status: Audio.RecordingStatus) {
    this.recording = recording
    this.status = status
  }

  async updateStatus() {
    this.status = await this.recording.getStatusAsync();
  }

  isRecording(): boolean {
    return this.status.isRecording;
  }
}

export async function NewRecordingState(recording: Audio.Recording): Promise<RecordingState> {
  const status = await recording.getStatusAsync();
  return new RecordingState(recording, status);
}