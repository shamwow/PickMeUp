import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';

type RecordingState = {
  recording: Audio.Recording,
  status: Audio.RecordingStatus,
}

function setRecordingStatusInterval(state: RecordingState, setState: (state: RecordingState) => void): number {
  const {recording} = state;
  return setInterval(async () => {
    const status = await recording.getStatusAsync()
    setState({recording, status})
  }, 100)
}

// Generator which returns a function to be called when the record button is clicked.
function recordButtonClickGen(
  recordingState: RecordingState | null,
  setRecordingState: (state: RecordingState | null) => void,
  intervalID: number | null,
  setIntervalID: (id: number | null) => void,
) {
  return async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    })
    const permissions = await Audio.requestPermissionsAsync();
    if (!permissions.granted) {
      console.warn("you need permissions!");
      return;
    }

    if (recordingState === null || recordingState.status.isDoneRecording) {
      // There is no recording, create a new one and start recording.
      const recording = new Audio.Recording();
      try {
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        if (intervalID) {
          clearInterval(intervalID);
        }
        const status = await recording.getStatusAsync()
        const recordingState = {recording, status};

        const newIntervalID = setRecordingStatusInterval(recordingState, setRecordingState);
        setIntervalID(newIntervalID)
        setRecordingState(recordingState);
      } catch (error) {
          console.warn(error);
          setRecordingState(recordingState);
      }
    } else if (!recordingState.status.isRecording) {
      // There is already a recording and it is paused, unpause it.
      await recordingState.recording.startAsync();
    } else {
      // There is already a recording and it is running, pause it.
      await recordingState.recording.pauseAsync();
    }
  }
}

function onSaveButtonClickGen(state: RecordingState | null) {
  return async () => {
    if (state === null) {
      return null;
    }

    await state.recording.stopAndUnloadAsync()
    console.log(state.recording.getURI())
  }
}

function RecordingDuration(props: {state: RecordingState | null}) {
  const { state } = props;

  if (state === null) {
    return null;
  }

  return <Text>{new Date(state.status.durationMillis).toISOString().substr(11, 8)}</Text>;
}

function SaveButton(props: {state: RecordingState | null}) {
  const { state } = props;

  if (state === null) {
    return null;
  }

  if (state.status.isRecording) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onSaveButtonClickGen(state)}>
      <Text>Save recording!</Text>
    </TouchableOpacity>
  );
}

export function RecordScreen() {
  const [recordingState, setRecordingState] = useState<RecordingState | null>(null);
  const [recordingIntervalID, setRecordingIntervalID] = useState<number | null>(null);
  const onRecordButtonClick = recordButtonClickGen(recordingState, setRecordingState, recordingIntervalID, setRecordingIntervalID);

  let text = "Pause Recording"
  if (recordingState === null) {
    text = "Record Something!"
  } else if (!recordingState.status.isRecording) {
    text = "Resume Recording"
  }

  return (
    <>
      <TouchableOpacity onPress={onRecordButtonClick} style={styles.container}>
        <Text>{text}</Text>
      </TouchableOpacity>
      <RecordingDuration state={recordingState} />
      <SaveButton state={recordingState} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
});
