import React, { useState, useEffect } from 'react';
import Modal from 'react-native-modal';
import { StyleSheet, TouchableOpacity, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Audio } from 'expo-av';
import { Recording, Sound } from 'expo-av/build/Audio';
import Player, { Slider } from './Player';
import * as SQLite from 'expo-sqlite';
import Consts from '../consts';
import { setStatusBarStyle } from 'expo-status-bar';
import Button from './Button';
import { BigButton } from './BigButton';
import { MIC_RED, SQUARE_RED, PAUSE_CIRCLE_RED, MIC_GREY } from '../icons';
import { SvgXml } from "react-native-svg";
import { STYLES, COLORS } from '../styles';


type PopupProps = {
    isVisible: boolean
    onConfirm: () => void
    title: string
    message: string
    icon: any
}

export default function Popup(props: PopupProps) {
    const {isVisible, onConfirm, title, message, icon} = props

    return (
        <Modal
            isVisible={isVisible}
            animationIn='fadeInUp'
            backdropColor='white'
            backdropOpacity={0.5}
            animationOut="fadeOutDown"
        >
            <View style={{
                backgroundColor: 'white',
                borderRadius: 25,
                paddingStart: 40,
                paddingEnd: 40,
                marginEnd: 20,
                marginStart: 20,
                minHeight: 300,
                maxHeight: 500,
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowOffset: {
                    height: 40,
                },
                shadowRadius: 40,
                shadowOpacity: 0.5,
            }}>
                <View style={{marginTop: 40, marginBottom: 40}}>{icon}</View>
                <Text style={{marginBottom: 15, fontSize: 18}}>{title}</Text>
                <Text style={{marginStart: 10, marginEnd: 10, lineHeight: 18, textAlign: 'center', fontSize: 12}}>{message}</Text>
                <Button style={{minWidth: 120, marginTop: 40, marginBottom: 40}} onPress={onConfirm} label="OK!" color={COLORS.grey}  />
            </View>
        </Modal>
    )
}