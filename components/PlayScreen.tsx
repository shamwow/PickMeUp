import React from "react";
import {StyleSheet, Text, TouchableOpacity, View, Image} from "react-native";
import * as SQLite from 'expo-sqlite';
import Consts from "../consts";
import Player from './Player';

const db = SQLite.openDatabase("db.db");
let lastId = 0;
let lastFilePath = "";

type PlayScreenComponentState = {
    showHype: boolean,
    showDelete: boolean,
    filePath: string,
    isPlaying: boolean,
    urls: [string, number][]
}

export class PlayScreen extends React.Component<{}, PlayScreenComponentState> {
    state: PlayScreenComponentState = {
        showHype: true,
        showDelete: false,
        filePath: "",
        isPlaying: false,
        urls: [],
    };

    onSunshineClicked = () => {
        return async () => {
            if (this.state.urls.length == 0) {
                console.log("NO FILE PATHS TO PLAY FROM");
            }

            const index = Math.floor(Math.random() * this.state.urls.length);
            const tuple = this.state.urls[index];
            lastFilePath = tuple[0];
            lastId = tuple[1];
            this.setState({ isPlaying: true, filePath: lastFilePath })
        }
    };

    updateUrlsInTransaction = (tx: SQLite.SQLTransaction) => {
        this.state.urls = [];
        tx.executeSql(
            "SELECT * FROM recordings;", [], (_, resultSet) => {
                for (let i = 0; i < resultSet.rows.length; i++) {
                    const item = resultSet.rows.item(i);
                    console.log(item);
                    this.state.urls.push([item.path, item.id]);
                }
            }
        );
    };

    onDeleteThatShitClicked = () => {
        return async () => {
            db.transaction(tx => {
                tx.executeSql(
                    "DELETE FROM recordings WHERE id = " + lastId + ";"
                );
                this.updateUrlsInTransaction(tx);
            });
        }
    };

    componentDidMount = () => {
        db.transaction(tx => {
            tx.executeSql(Consts.CREATE_TABLE_SQL);
            this.updateUrlsInTransaction(tx);
        });
    };

    render() {
        let player = null;
        if (this.state.isPlaying) {
            const uri = this.state.filePath;
            if (uri !== null) {
                player = <Player soundPath={uri} durationMs={0} />
            }
        }

        return (
            <>
                {
                    this.state.showHype &&
                    <>
                        <TouchableOpacity onPress={this.onSunshineClicked()}>
                            {/*style={styles.listenButton}>*/}
                            <Image source={require('../assets/sunshine_button.png')} />
                            <Image source={require('../assets/sunshine_icon.png')} style={styles.absolutePosition}/>
                        </TouchableOpacity>
                        {/*<View style={styles.whiteShadow}>*/}
                        {/*</View>*/}
                    </>
                }
                {
                    this.state.showDelete &&
                    <TouchableOpacity onPress={this.onDeleteThatShitClicked()}>
                        {/*style={styles.deleteButton}>*/}
                        <Text style={styles.whiteText}>Delete</Text>
                    </TouchableOpacity>
                }
                {player}
            </>
        )
    }
}

const styles = StyleSheet.create({
    absolutePosition: {
        top: 130,
        left: 140,
        position: 'absolute',
    },
    whiteShadow: {
        borderRadius: 123,
        backgroundColor: '#E5EAF0',
        width: 245,
        height: 245,
        shadowColor: "#FFFFFF",
        shadowOffset: {
            width: -18,
            height: -18,
        },
        shadowOpacity: 1,
        shadowRadius: 30,
        position: 'absolute'
    },
    listenButton: {
        borderRadius: 123,
        backgroundColor: '#E5EAF0',
        textAlign: 'center',
        color: 'white',
        width: 245,
        height: 245,
        shadowColor: "#AFC1D8",
        shadowOffset: {
            width: 18,
            height: 18,
        },
        shadowOpacity: 1,
        shadowRadius: 30,
        position: 'absolute',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    whiteText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },
    deleteButton: {
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 48,
        backgroundColor: '#DE1819',
        textAlign: 'center',
        color: 'white'
    },
});
