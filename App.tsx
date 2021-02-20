import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NativeModules, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { RecordScreen } from './components/RecordScreen';
import { PlayScreen } from "./components/PlayScreen";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SvgXml } from "react-native-svg";
import { MIC_RED, MIC_GREY, PLAY_BUTTON_GREY, PLAY_BUTTON_RED } from './icons';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const Tab = createBottomTabNavigator();

function RecordScreenTab() {
  return (
      <View style={styles.container}>
        <RecordScreen />
        <StatusBar style="auto" />
      </View>
  );
}

function PlayScreenTab() {
    return (
        <View style={styles.container}>
          <PlayScreen />
          <StatusBar style="auto" />
        </View>
    )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let icon;

            if (route.name === 'Record') {
              icon = focused ? MIC_RED : MIC_GREY;
            } else if (route.name === 'Listen') {
              icon = focused ? PLAY_BUTTON_RED : PLAY_BUTTON_GREY;
            } else {
              throw new Error("unrecognized route " + route.name)
            }

            return <SvgXml width="30" height="30" xml={icon} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#000',
          inactiveTintColor: '#000',
          tabStyle: {
            marginStart: 20,
            marginEnd: 20,
            marginBottom: 20,
          },
          style: {
            backgroundColor: '#E5EAF0',
            borderTopWidth: '0',
            paddingLeft: 60,
            paddingRight: 60,
            height: 100,
          },
        }}
      >
        <Tab.Screen name="Record" component={ RecordScreenTab } />
        <Tab.Screen name="Listen" component={ PlayScreenTab } />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigation: {
    height: 100,
    backgroundColor: '#E5EAF0',
    flexDirection: 'row',
    flex: 1,
  },
  navigationItem: {
    margin: 10,
    backgroundColor: '#DE1819',
    borderRadius: 50,
    flex: 1,
    height: 40,
  },
  navigationText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    height: 40,
  },
});
