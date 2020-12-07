import React, {useEffect, useState} from "react";
import {Text, TouchableOpacity} from "react-native";
import { Audio } from 'expo-av';
import * as SQLite from 'expo-sqlite';
import Consts from "../consts";
import {useFocusEffect} from "@react-navigation/native";

const db = SQLite.openDatabase("db.db");
const soundObject = new Audio.Sound();
let urls: [string, number][] = [];
let lastId = 0;
let lastFilePath = "";

function onPlayButtonGenClicked() {
    return async () => {
        if (urls.length == 0) {
            console.log("NO FILE PATHS TO PLAY FROM");
        }

        const index = Math.floor(Math.random() * urls.length);
        const tuple = urls[index];
        lastFilePath = tuple[0];
        const source = {
            uri: lastFilePath
        };
        lastId = tuple[1];
        try {
            console.log("playing file!");
            await soundObject.loadAsync(source);
            await soundObject.playAsync();

        } catch (error) {
            console.log(error);
        }
    }
}

function onDeleteThatShitClicked() {
    return async () => {
        db.transaction(tx => {
            tx.executeSql(
                "DELETE FROM recordings WHERE id = " + lastId + ";"
            );
            updateUrlsInTransaction(tx);
        });
    }
}

function updateUrlsInTransaction(tx: SQLite.SQLTransaction) {
    urls = [];
    tx.executeSql(
        "SELECT * FROM recordings;", [], (_, resultSet) => {
            for (let i = 0; i < resultSet.rows.length; i++) {
                const item = resultSet.rows.item(i);
                console.log(item);
                urls.push([item.path, item.id]);
            }
        }
    );
}

export function PlayScreen() {
    const [showHype, setShowHype] = useState(true);
    const [showDelete, setShowDelete] = useState(false);

    soundObject.setOnPlaybackStatusUpdate(async (update) => {
        console.log("playback status updated!");
        console.log(update);
        if (update.isLoaded && update.didJustFinish) {
            await soundObject.unloadAsync();
            setShowDelete(true);
        } else {
            setShowHype(!update.isLoaded);
        }
    });

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(Consts.CREATE_TABLE_SQL);
        });
    });

    useFocusEffect(() => {
        db.transaction(tx => {
            updateUrlsInTransaction(tx);
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
                showDelete &&
                <TouchableOpacity onPress={onDeleteThatShitClicked()}>
                    <Text>Delete that shit</Text>
                </TouchableOpacity>
            }
        </>
    );
}