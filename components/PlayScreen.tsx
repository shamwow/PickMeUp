import React from "react";
import {Text, TouchableOpacity} from "react-native";
import { Audio } from 'expo-av';
import Toast from 'react-native-easy-toast'

const soundObject = new Audio.Sound();

async function onPlayButtonGenClicked(refs: React.Ref) {
    // TODO(alex-fung): Read file name from database instead
    const filePath = "";
    try {
        await soundObject.loadAsync(require(filePath));
        // Your sound is playing!
        await soundObject.playAsync();

        await soundObject.unloadAsync();
    } catch (error) {
        refs.toast.show('hello world!');
    }
}

export function PlayScreen() {
    this.refs = React.createRef();

    return (
        <>
            <TouchableOpacity onPress={onPlayButtonGenClicked(this.refs)}>
                <Text>Hype Me</Text>
            </TouchableOpacity>
            <Toast ref="toast"/>
        </>
    );
}