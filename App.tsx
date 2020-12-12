import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecordScreen } from './components/RecordScreen';
import { PlayScreen } from "./components/PlayScreen";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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
        <Tab.Navigator>
          <Tab.Screen name="Record" component={ RecordScreenTab } />
          <Tab.Screen name="Hype Me Up" component={ PlayScreenTab } />
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
});
