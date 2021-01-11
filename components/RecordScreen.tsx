import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { Recording, Sound } from 'expo-av/build/Audio';
import Player from './Player';
import * as SQLite from 'expo-sqlite';
import Consts from '../consts';
import { setStatusBarStyle } from 'expo-status-bar';
import Button from './Button';

const db = SQLite.openDatabase("db.db")

type RecordingScreenComponentState = {
  recordingIntervalID: number | null,
  recording: Audio.Recording | null,
  durationMs: number,
  isRecording: boolean,
}

function RecordingDuration(props: {durationMs: number}) {
  const { durationMs } = props;
  return <Text style={{textAlign: 'center'}}>{new Date(durationMs).toISOString().substr(11, 8)}</Text>;
}

function SaveButton(props: {onSaveClick: () => void}) {
  const { onSaveClick } = props;

  return (
    <TouchableOpacity onPress={onSaveClick}>
      <Text>Save</Text>
    </TouchableOpacity>
  );
}

function DiscardButton(props: {onPress: () => void}) {
  const { onPress } = props;
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>Discard</Text>
    </TouchableOpacity>
  );
}

export class RecordScreen extends React.Component<{}, RecordingScreenComponentState> {
  state: RecordingScreenComponentState = {
    recordingIntervalID:null,
    recording: null,
    durationMs: 0,
    isRecording: false,
  }

  constructor(props: {}) {
    super(props)

    this.state = {
      recordingIntervalID:null,
      recording: null,
      durationMs: 0,
      isRecording: false,
    }
  }

  clearState = async () => {
    const {recordingIntervalID, recording} = this.state;

    if (recordingIntervalID !== null) {
      clearInterval(recordingIntervalID)
    }
    if (recording !== null) {
      await recording.stopAndUnloadAsync()
    }

    this.setState({
      recordingIntervalID:null,
      recording: null,
      durationMs: 0,
      isRecording: false,
    })
  }

  componentDidMount() {
    db.transaction(tx => {
      tx.executeSql(Consts.CREATE_TABLE_SQL);
    });
  }

  componentWillUnmount = () => {
    const {recordingIntervalID} = this.state;

    if (recordingIntervalID !== null) {
      clearInterval(recordingIntervalID)
    }
  }

  setRecordingStatusInterval = () => {
    return setInterval(async () => {
      const {recording, recordingIntervalID} = this.state
      if (recording === null) {
        if (recordingIntervalID !== null) {
          clearInterval(recordingIntervalID)
        }
        return
      }
      const status = await recording.getStatusAsync()
      this.setState({durationMs: status.durationMillis, isRecording: status.isRecording})
    }, 100)
  }

  onRecordClick = async () => {
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

    const {recording, isRecording} = this.state;
    if (recording === null) {
      // There is no recording or the recording has no status, create a new one and start recording.
      const recording = new Audio.Recording();
      try {
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
        await recording.startAsync();
        const status = await recording.getStatusAsync()

        const recordingIntervalID = this.setRecordingStatusInterval()
        this.setState({recordingIntervalID, recording, durationMs: status.durationMillis, isRecording: status.isRecording})
      } catch (error) {
        console.warn(error);
        await this.clearState()
      }
    } else if (!isRecording) {
      // There is a recording and it is not running. Start it.
      await recording.startAsync();
    } else {
      // There is already a recording and it is running, pause it.
      await recording.pauseAsync();
    }
  }

  onDiscardClick = async () => {
    await this.clearState()
  }

  onSaveClick = async () => {
    const {recording} = this.state;

    if (recording === null) {
      console.warn("did not expect recording to be null")
      return
    }

    const path = recording.getURI();

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

    await this.clearState()
  }

  render() {
    const {durationMs, isRecording, recording} = this.state;

    let text = "Stop Recording"
    if (recording === null) {
      text = "Record Something!"
    } else if (!isRecording) {
      text = "Resume Recording"
    }

    let player = null;
    if (recording !== null && !isRecording) {
      const uri = recording.getURI()
      if (uri !== null) {
        player = <Player soundPath={uri} durationMs={durationMs} />
      }
    }

    let duration = null;
    if (recording !== null) {
      duration = <RecordingDuration durationMs={durationMs} />
    }

    let discardButton = null
    let saveButton = null
    if (recording !== null && !isRecording) {
      discardButton = <Button style={{flex: 1, marginEnd: 20}} onPress={this.onDiscardClick} color="#6A758A" label="Discard" />
      saveButton = <Button style={{flex: 1}} onPress={this.onSaveClick} color="#DE1819" label="Save" />
    }

    return (
      <View style={{paddingStart: 40, paddingEnd: 40, height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity onPress={this.onRecordClick} style={styles.container}>
          <Text>{text}</Text>
        </TouchableOpacity>
        {duration}
        {player}
        <View style={{flexDirection: 'row', marginTop: 40}}>
          {discardButton}
          {saveButton}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
