import React, {useEffect, useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View, Image} from "react-native";
import { Audio } from 'expo-av';
import * as SQLite from 'expo-sqlite';
import Consts from "../consts";
import {useFocusEffect} from "@react-navigation/native";
import { BigButton } from "./BigButton"
import Player from './Player';
import Button from './Button';
import {STYLES, COLORS} from '../styles';
import DB from '../classes/DB';
import * as FileSystem from 'expo-file-system';

type FileInfo = {
    id: number,
    path: string,
}

type PlayScreenState = {
    currentFile: FileInfo | null
}

export class PlayScreen extends React.Component<{}, PlayScreenState> {
    constructor(props: {}) {
        super(props)
        this.state = {currentFile: null}
    }

    async componentDidMount() {
        await DB.Tx(async tx => {
            await DB.SQL(tx, Consts.CREATE_TABLE_SQL)
        })
        await DB.Tx(async tx => {
            const data = await DB.SQL(tx, "SELECT * FROM recordings LIMIT 1")
            console.log("DATA!", data)
        })
    }

    onDeleteThatShitClicked = async () => {
        const {currentFile} = this.state
        if (!currentFile) {
            return
        }

        await DB.Tx(async tx => {
            await DB.SQL(tx, "DELETE FROM recordings WHERE id = ?", [currentFile.id])
        });

        await FileSystem.deleteAsync(currentFile.path, {idempotent: true})

        this.setState({currentFile: null})
    }

    loadNewRecording = async () => {
        try {
            await DB.Tx(async tx => {
                const res = await DB.SQL(
                    tx,
                    "SELECT id, path, date FROM recordings ORDER BY RANDOM() LIMIT 1",
                )
                if (res.rows.length === 0) {
                    console.warn("No recordings!")
                    return
                }

                console.log(res.rows)

                const recording = res.rows.item(0)
                this.setState({
                    currentFile: {
                        id: recording.id,
                        path: recording.path,
                    },
                })
            });
        }
        catch (err) {
            console.warn(err)
        }
    }

    clearRecording = async () => {
        this.setState({currentFile: null})
    }

    render() {
        const {currentFile} = this.state

        const bigButtonIcon = <Image style={STYLES.bigButtonIcon} source={require('../assets/sunshine_icon.png')} />

        let player = null;
        if (currentFile !== null) {
            player = <Player soundPath={currentFile.path} />
        }

        let deleteButton = null;
        if (currentFile !== null) {
            deleteButton = <Button style={styles.deleteButton} onPress={this.onDeleteThatShitClicked} color="#DE1819" label="Delete" />
        }

        let onBigButtonClicked = this.loadNewRecording
        if (currentFile !== null) {
            onBigButtonClicked = this.clearRecording
        }

        return (
            <View style={STYLES.mainView}>
                <View style={STYLES.headerSection}>
                    <Text style={{...STYLES.text, color: COLORS.red, fontSize: 14, marginBottom: 50}}>Sunshine</Text>
                    <Text style={{...STYLES.text, color: COLORS.black, fontSize: 24, textTransform: 'none'}}>Need some sunshine today?</Text>
                </View>
                <View style={STYLES.bigButtonSection}>
                    <BigButton onTap={onBigButtonClicked} icon={bigButtonIcon} isPressed={currentFile !== null} />
                </View>
                <View style={STYLES.playerSection}>
                    { player }
                </View>
                <View style={STYLES.buttonSection}>
                    {deleteButton}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    whiteText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },
    deleteButton: {
        ...STYLES.button,
        backgroundColor: COLORS.grey,
        width: 200,
    },
});
