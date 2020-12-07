import React, {useState} from "react";
import {Text, TouchableOpacity} from "react-native";
import { Audio } from 'expo-av';
import * as SQLite from 'expo-sqlite';
import Consts from "../consts";
import {useFocusEffect} from "@react-navigation/native";

const db = SQLite.openDatabase("db.db");
const state = {
    showHype: true,
};
const soundObject = new Audio.Sound();
let urls: String[] = [];

function onPlayButtonGenClicked() {
    return async () => {
        const index = Math.floor(Math.random() * urls.length);
        const filePath = urls[index];
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
    const [showHype, setShowHype] = useState(true);

    soundObject.setOnPlaybackStatusUpdate(async (update) => {
        console.log("playback status updated!");
        console.log(update);
        if (update.isLoaded && update.didJustFinish) {
            await soundObject.unloadAsync();
            //state.showHype = true;
        } else {
            setShowHype(!update.isLoaded);
        }
        console.log("showHype: " + state.showHype);
    });

    useFocusEffect(() => {
        urls = [];
        db.transaction(tx => {
            tx.executeSql(Consts.CREATE_TABLE_SQL);
            tx.executeSql(
                "SELECT * FROM recordings;", [], (_, resultSet) => {
                    for (let i = 0; i < resultSet.rows.length; i++) {
                        const item = resultSet.rows.item(i);
                        console.log(item);
                        urls.push(item.path);
                    }
                }
            );
        });
    });

    return (
        <>
            {
                showHype &&
                <TouchableOpacity onPress={onPlayButtonGenClicked()}>
                    <Text>Hype Me</Text>
                </TouchableOpacity>
            }
            {
                !showHype &&
                <TouchableOpacity>
                    <Text>Delete that shit</Text>
                </TouchableOpacity>
            }
        </>
    );
}