import React from "react";
import {Image, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, View} from "react-native";

type ButtonProps = {
    onTap: () => void
    icon: any
    isPressed: boolean
}

export class BigButton extends React.Component<ButtonProps, {}> {
    render() {
        let bgImage = <Image style={styles.bgImage} source={require('../assets/sunshine_button.png')} />
        if (this.props.isPressed) {
            bgImage = <Image style={styles.bgImage} source={require('../assets/button_depressed.png')} />
        }

        return (
            <TouchableWithoutFeedback onPress={this.props.onTap}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 341,
                    width: 341,
                    overflow: 'visible',
                }}>
                    {bgImage}
                    {this.props.icon}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    bgImage: {
        borderWidth: 0,
        borderColor: 'red',
        position: 'absolute',
        top: 0,
    },
});