import React, { useState, useEffect } from 'react';
import { LayoutAnimation, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { Recording, Sound } from 'expo-av/build/Audio';
import Player, { Slider } from './Player';
import * as SQLite from 'expo-sqlite';
import Consts from '../consts';
import { setStatusBarStyle } from 'expo-status-bar';
import Button from './Button';
import { BigButton } from './BigButton';
import { MIC_RED, SQUARE_RED, MIC_GREY, SUN_YELLOW } from '../icons';
import { SvgXml } from "react-native-svg";
import { STYLES, COLORS } from '../styles';
import Popup from './Popup';

// 1 minute.
const MAX_DURATION_MS = 1000*60

const db = SQLite.openDatabase("db.db")

type RecordingScreenComponentState = {
  recordingIntervalID: number | null,
  recording: Audio.Recording | null,
  durationMs: number,
  isRecording: boolean,
  showSavedPrompt: boolean,
}

export class RecordScreen extends React.Component<{}, RecordingScreenComponentState> {
  state: RecordingScreenComponentState = {
    recordingIntervalID: null,
    recording: null,
    durationMs: 0,
    isRecording: false,
    showSavedPrompt: false,
  }

  constructor(props: {}) {
    super(props)

    this.state = {
      recordingIntervalID: null,
      recording: null,
      durationMs: 0,
      isRecording: false,
      showSavedPrompt: false,
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
    this.setState({showSavedPrompt: true})
  }

  onSavedDialogClick = () => {
    this.setState({showSavedPrompt: false})
  }

  render() {
    const {durationMs, isRecording, recording} = this.state;
    const thereIsNoRecording = recording === null
    const isDoneRecording = recording !== null && !isRecording

    let bigButtonIcon;
    let isBigButtonPressed
    if (thereIsNoRecording) {
      bigButtonIcon = <SvgXml style={STYLES.bigButtonIcon} width="50" height="50" xml={MIC_RED} />;
      isBigButtonPressed = false
    } else if (isRecording) {
      bigButtonIcon = <SvgXml style={STYLES.bigButtonIcon} width="50" height="50" xml={SQUARE_RED} />;
      isBigButtonPressed = true
    } else {
      bigButtonIcon = <SvgXml style={STYLES.bigButtonIcon} width="50" height="50" xml={MIC_GREY} />;
      isBigButtonPressed = false
    }

    let player = null;
    if (isDoneRecording) {
      // Need to do this check because the type checker is dumb.
      const uri = recording !== null ? recording.getURI() : ""
      if (uri !== null) {
        player = <Player soundPath={uri} durationMs={durationMs} />
      }
    }

    let duration = null;
    if (recording !== null && isRecording) {
      duration = <Slider maxMs={MAX_DURATION_MS} currMs={durationMs} />
    }

    let discardButton = null
    let saveButton = null
    if (isDoneRecording) {
      discardButton = <Button style={{flex: 1, marginEnd: 20}} onPress={this.onDiscardClick} color="#6A758A" label="Discard" />
      saveButton = <Button style={{flex: 1}} onPress={this.onSaveClick} color="#DE1819" label="Save" />
    }

    let bigButton = null
    const sunshineIcon = <SvgXml style={STYLES.bigButtonIcon} width="60" height="60" xml={SUN_YELLOW} />;
    const popup = <Popup isVisible={this.state.showSavedPrompt} title="Recording Saved!" message="Come back to this ray of sunshine on a rainier day!" onConfirm={this.onSavedDialogClick} icon={sunshineIcon} />
    if (!this.state.showSavedPrompt) {
      bigButton = <BigButton onTap={this.onRecordClick} icon={bigButtonIcon} isPressed={isBigButtonPressed} />
    }

    return (
      <View style={{flex: 1, marginTop: 100, paddingStart: 40, paddingEnd: 40, justifyContent: 'space-between', alignItems: 'center'}}>
        <View>
            <Text style={{...STYLES.text, color: COLORS.red, fontSize: 14, marginBottom: 50}}>Sunshine</Text>
            <Text style={{...STYLES.text, color: COLORS.black, fontSize: 24, textTransform: 'none'}}>Record a daily win</Text>
        </View>
        <View style={{height: 350}}>
          {popup}
          {bigButton}
        </View>
        <View style={{marginBottom: 50, height: 150, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flexDirection: 'row'}}>
            {duration}
            {player}
          </View>
          <View style={{flexDirection: 'row', marginTop: 40}}>
            {discardButton}
            {saveButton}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
