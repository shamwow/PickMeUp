import React from "react";
import {Image, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, View} from "react-native";

type ButtonProps = {
    onPress: () => void
    onUnpress: () => void
    pressedIcon: any
    unpressedIcon: any
}

type ButtonState = {
    isPressed: boolean
}

export class BigButton extends React.Component<ButtonProps, ButtonState> {
    state: ButtonState = {
        isPressed: false,
    };

    touchableOnPress = () => {
        const newIsPressed = !this.state.isPressed
        console.log("touchable pressed to: " + newIsPressed);
        this.setState({isPressed: newIsPressed});
        if (newIsPressed) {
            this.props.onPress();
        } else {
            this.props.onUnpress();
        }
    };

    render() {
        let icon = this.props.unpressedIcon
        let bgImage = <Image style={styles.bgImage} source={require('../assets/sunshine_button.png')} />
        if (this.state.isPressed) {
            icon = this.props.pressedIcon
            bgImage = <Image style={styles.bgImage} source={require('../assets/button_depressed.png')} />

        }

        return (
            <TouchableWithoutFeedback onPress={this.touchableOnPress}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 341,
                    width: 341,
                    overflow: 'visible',
                }}>
                    {bgImage}
                    {icon}
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
    icon: {

    }
});