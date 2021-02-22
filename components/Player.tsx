import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
import {PLAY_GREY, PAUSE_GREY} from '../icons'
import { SvgXml } from "react-native-svg";


type PlayerProps = {
  soundPath: string,
  // Observed weird behaviour where the duration of the sound was less than the duration of the recording.
  // So to keep things consistent, we pass in the duration of the recording to the player.
  durationMs?: number,
}

type PlayerState = {
  soundIntervalID: number | null,
  sound: Audio.Sound | null,
  positionMs: number,
  durationMs: number,
  isPlaying: boolean,
}

function getMsTimestamp(ms: number) {
  return new Date(ms).toISOString().substr(14, 5)
}

export function Slider(props: {middleIcon?: React.Component, onTap?: () => {}, maxMs: number, currMs: number}) {
  const {currMs, maxMs, onTap, middleIcon} = props;

  // This `|| 0` is important because `currMs / maxMs` can equal NaN.
  let percentage = Math.round((currMs / maxMs || 0) * 10000) / 10000
  // To prevent weird visual issue where progress bar never reaches end.
  if (currMs > 0 && maxMs - currMs < 50) {
    percentage = 1
  }

  let middleIconElem;
  if (middleIcon) {
    middleIconElem = <View style={styles.middleIcon}>{middleIcon}</View>
  }

  let slider = (
    <>
      <View style={styles.slider}>
        <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'white', height: 5, borderRadius: 50}}>
          <View style={{height: 8, flex: percentage, backgroundColor: '#DE1819', borderRadius: 50, marginTop: -1}}></View>
        </View>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Text style={{flex: 1, textAlign: 'left', fontWeight: 'bold'}}>{getMsTimestamp(currMs)}</Text>
        {middleIconElem}
        <Text style={{flex: 1, textAlign: 'right', fontWeight: 'bold'}}>{getMsTimestamp(maxMs)}</Text>
      </View>
    </>
  )
  if (!onTap) {
    return <View style={{flex: 1}}>{slider}</View>
  }
  return <TouchableOpacity style={{flex: 1}} onPress={onTap}>{slider}</TouchableOpacity>
}

export default class Player extends React.Component<PlayerProps, PlayerState> {
  constructor(props: PlayerProps) {
    super(props)

    this.state = {
      soundIntervalID: null,
      sound: null,
      positionMs: 0,
      durationMs: 0,
      isPlaying: false,
    }
  }

  setSoundInterval = () => {
    return setInterval(async () => {
      const {sound} = this.state;
      if (sound === null) {
        return
      }

      const status = await sound.getStatusAsync()
      if (!status.isLoaded) {
        this.setState({positionMs: 0, durationMs: 0})
      } else {
        this.setState({positionMs: status.positionMillis, durationMs: status.durationMillis || 0, isPlaying: status.isPlaying})
      }
    }, 50)
  }

  updateSound = async (prevPath: string | null, newPath: string) => {
    if (prevPath === newPath) {
      return
    }

    const sound = new Audio.Sound();
    try {
      await sound.loadAsync({uri: newPath});
      await sound.setIsLoopingAsync(true)
      await sound.playAsync()
    } catch (error) {
      console.warn(error)
    }

    this.setState({sound, isPlaying: true})
  }

  componentDidMount = async () => {
    const {soundPath} = this.props

    await this.updateSound(null, soundPath)
    const soundIntervalID = this.setSoundInterval()
    this.setState({soundIntervalID})
  }

  componentDidUpdate = async (prevProps: PlayerProps) => {
    await this.updateSound(prevProps.soundPath, this.props.soundPath)
  }

  componentWillUnmount = async () => {
    const {sound, soundIntervalID} = this.state;
    if (soundIntervalID !== null) {
      clearInterval(soundIntervalID)
    }
    if (sound !== null) {
      await sound.unloadAsync()
    }
  }

  onSliderClick = async () => {
    const {sound, isPlaying} = this.state
    if (sound === null) {
      return
    }

    if (isPlaying) {
      await sound.pauseAsync()
      this.setState({isPlaying: false})
    } else {
      await sound.playAsync()
      this.setState({isPlaying: true})
    }
  }

  render() {
    const {durationMs, positionMs, isPlaying} = this.state
    let durationMsDisplay = durationMs
    if (this.props.durationMs) {
      durationMsDisplay = this.props.durationMs
    }

    let middleIcon = <SvgXml width="10" height="10" xml={PAUSE_GREY} />
    if (isPlaying) {
      middleIcon = <SvgXml width="10" height="10" xml={PLAY_GREY} />
    }

    return (
      <Slider middleIcon={middleIcon} maxMs={durationMsDisplay} currMs={positionMs} onTap={this.onSliderClick} />
    );
  }
}

const styles = {
  slider: {marginBottom: 10, marginTop: 10, flexDirection: 'row'},
  middleIcon: {height: 10, width: 10, flex: 1, justifyContent: 'center', alignItems: 'center'}
}
