import React, {useEffect} from "react";
import {Text, TouchableOpacity} from "react-native";
import { Audio } from 'expo-av';
import * as SQLite from 'expo-sqlite';

const soundObject = new Audio.Sound();
soundObject.setOnPlaybackStatusUpdate(async (update) => {
    console.log("playback status updated!");
    console.log(update);
    if (update.isLoaded && update.didJustFinish) {
        await soundObject.unloadAsync()
    }
});

function onPlayButtonGenClicked() {
    return async () => {
        // TODO(alex-fung): Read file name from database instead
        const filePath = "file:///var/mobile/Containers/Data/Application/FF088D24-D732-4200-9F27-EE3783F474B0/Library/Caches/ExponentExperienceData/%2540anonymous%252FPickMeUp-423738e5-8606-403c-a52d-433a02585c1b/AV/recording-6F20CEFD-7CA6-4315-9241-339025C34015.caf";
        const source = {
            uri: filePath
        };
        try {
            console.log("playing file!");
            await soundObject.loadAsync(source);
            await soundObject.playAsync();

        } catch (error) {
            console.log(error);
        }
    }
}

export function PlayScreen() {
    // db name: db.db
    // table name: recordings
    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS recordings (id integer PRIMARY KEY NOT NULL, path text, date timestamp NOT NULL);"
            );
        });
    });

    return (
        <>
            <TouchableOpacity onPress={onPlayButtonGenClicked()}>
                <Text>Hype Me</Text>
            </TouchableOpacity>
        </>
    );
}