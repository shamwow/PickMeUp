import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';

type ScrubberState = {
  sound: Audio.Sound,
  status?: AVPlaybackStatus
}

type Props = {
  sound: Audio.Sound | null,
}

function setSoundStatusInterval(state: ScrubberState, setState: (state: ScrubberState) => void): number {
  const {sound} = state;
  return setInterval(async () => {
    const status = await sound.getStatusAsync()
    setState({sound, status})
  }, 100)
}

function getPlaybackTimestamp(state: ScrubberState) {
  if (!state.status || !state.status.isLoaded) {
    return '0:00'
  }
  return new Date(state.status.positionMillis).toISOString().substr(11, 8)
}

function getDurationTimestamp(state: ScrubberState) {
  if (!state.status || !state.status.isLoaded || !state.status.durationMillis) {
    return '0:00'
  }
  return new Date(state.status.durationMillis).toISOString().substr(11, 8)
}

function getSliderPosition(state: ScrubberState) {
  if (!state.status || !state.status.isLoaded || !state.status.durationMillis) {
    return 0
  }
  return state.status.positionMillis / state.status.durationMillis
}

export default function Scrubber(props: Props) {
  const {sound} = props

  if (sound === null) {
    return null
  }

  const [scrubberState, setScrubberState] = useState<ScrubberState>({sound});

  useEffect(() => {
    const intervalID = setSoundStatusInterval(scrubberState, setScrubberState)
    return () => {
      clearInterval(intervalID)
    }
  }, [scrubberState, setScrubberState])

  return (
    <View>
      <Text>{getPlaybackTimestamp(scrubberState)}</Text>
      <Slider value={getSliderPosition(scrubberState)} />
      <Text>{getDurationTimestamp(scrubberState)}</Text>
    </View>
  );
}
