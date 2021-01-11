import React, { useState, useEffect } from 'react';
import { GestureResponderEvent, Text, TouchableOpacity, View } from 'react-native';

export default function Button(props: {onPress: (event: GestureResponderEvent) => void, label: string, color: string, style: {}}) {
    const {onPress, label, color, style} = props;

    return (
        <TouchableOpacity style={{
            backgroundColor: color,
            borderRadius: 50,
            paddingStart: 10,
            paddingEnd: 10,
            paddingTop: 20,
            paddingBottom: 20,
            ...style
        }} onPress={onPress}>
            <Text style={{textAlign: 'center', color: '#fff', textTransform: 'uppercase', fontWeight: 'bold'}}>{label}</Text>
        </TouchableOpacity>
    )
}