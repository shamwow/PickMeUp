import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { Recording, Sound } from 'expo-av/build/Audio';
import Scrubber from './Scrubber';
import * as SQLite from 'expo-sqlite';
import Consts from '../consts';

const db = SQLite.openDatabase("db.db")

type RecordingState = {
  recording: Audio.Recording,
  status: Audio.RecordingStatus,
  sound: Audio.Sound | null,
}

type SetStateFn = (state: RecordingState | null) => void

function setRecordingStatusInterval(state: RecordingState, setState: SetStateFn): number {
  const {recording} = state;
  if (recording === null) {
    return 0
  }

  return setInterval(async () => {
    const status = await recording.getStatusAsync()
    setState({recording, status, sound: null})
  }, 100)
}

// Generator which returns a function to be called when the record button is clicked.
function recordButtonClickGen(
  // Represents the state of the current recording. If null means no recording is in progress.
  recordingState: RecordingState | null,
  setRecordingState: (state: RecordingState | null) => void,
  // The id of the interval function setup which repeats constantly, updating the reording status. This is needed because
  // getting the recording status is an async process.
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
      console.warn("need recording permissions but were unabe to get them");
      return;
    }

    if (recordingState === null || recordingState.status.isDoneRecording) {
      // There is no recording, create a new one and start recording.
      const recording = new Audio.Recording();
      try {
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
        await recording.startAsync();
        if (intervalID) {
          clearInterval(intervalID);
        }
        const status = await recording.getStatusAsync()
        const recordingState = {recording, status, sound: null}

        const newIntervalID = setRecordingStatusInterval(recordingState, setRecordingState)
        setIntervalID(newIntervalID)
        setRecordingState(recordingState)
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
      await recordingState.recording.stopAndUnloadAsync()
      const {sound, status} = await recordingState.recording.createNewLoadedSoundAsync()
      setRecordingState({sound, ...recordingState})
    }
  }
}

function onSaveButtonClickGen(state: RecordingState, setState: SetStateFn) {
  return async () => {
    const path = state.recording.getURI();

    db.transaction(tx => {
      tx.executeSql(
        "INSERT INTO recordings (path, date) VALUES (?, ?)",
        [path, new Date()],
        () => {},
        (_, err) => {
          console.warn(err);
          return false
        },
      );
    });

    console.log(path)
  }
}

function RecordingDuration(props: {state: RecordingState | null}) {
  const { state } = props;

  if (state === null) {
    return null;
  }

  return <Text>{new Date(state.status.durationMillis).toISOString().substr(11, 8)}</Text>;
}

function SaveButton(props: {state: RecordingState | null, setState: SetStateFn}) {
  const { state, setState } = props;

  if (state === null) {
    return null;
  }

  if (state.status.isRecording) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onSaveButtonClickGen(state, setState)}>
      <Text>Save</Text>
    </TouchableOpacity>
  );
}

function DiscardButton(props: {state: RecordingState | null, onPress: () => void}) {
  const { state, onPress } = props;

  if (state === null) {
    return null;
  }

  if (state.status.isRecording) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <Text>Discard</Text>
    </TouchableOpacity>
  );
}

export function RecordScreen() {
  const [recordingState, setRecordingState] = useState<RecordingState | null>(null);
  const [recordingIntervalID, setRecordingIntervalID] = useState<number | null>(null);
  const onRecordButtonClick = recordButtonClickGen(recordingState, setRecordingState, recordingIntervalID, setRecordingIntervalID);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(Consts.CREATE_TABLE_SQL);
    });
  })

  let text = "Stop Recording"
  if (recordingState === null) {
    text = "Record Something!"
  } else if (!recordingState.status.isRecording) {
    text = "Resume Recording"
  }

  const discardFn = async () => {
    if (recordingIntervalID !== null) {
      clearInterval(recordingIntervalID)
      setRecordingIntervalID(null)
    }
    if (recordingState !== null) {
      if (!recordingState.status.isDoneRecording) {
        await recordingState.recording.stopAndUnloadAsync()
      }
      setRecordingState(null)
    }
  }

  let scrubber = null;
  if (recordingState !== null) {
    scrubber = <Scrubber sound={recordingState.sound} />
  }

  return (
    <>
      <TouchableOpacity onPress={onRecordButtonClick} style={styles.container}>
        <Text>{text}</Text>
      </TouchableOpacity>
      <RecordingDuration state={recordingState} />
      {scrubber}
      <SaveButton state={recordingState} setState={setRecordingState} />
      <DiscardButton state={recordingState} onPress={discardFn} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
});
