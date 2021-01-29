import React from "react";
import {Image, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback} from "react-native";

type ButtonProps = {
    onPress: () => void
    onUnpress: () => void
}

type ButtonState = {
    isPressed: boolean
}

export class BigButton extends React.Component<ButtonProps, ButtonState> {
    state: ButtonState = {
        isPressed: false,
    };

    public reset() {
        this.state = {
            isPressed: false,
        };
    }

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

    render = () => {
        const image = this.state.isPressed ?
            <Image
                style={styles.notAbsolutePosition}
                source={require('../assets/button_depressed.png')}
            />

            :

            <Image
                style={styles.notAbsolutePosition}
                source={require('../assets/sunshine_button.png')}
            />;

        return (
            <>
                {/*<TouchableOpacity>*/}
                <TouchableWithoutFeedback
                    onPress={this.touchableOnPress}
                    // onPressOut={this.touchablePressOut}
                >
                    {image}
                </TouchableWithoutFeedback>
                <Image style={styles.logo}
                       source={require('../assets/sunshine_icon.png')}
                />
                {/*</TouchableOpacity>*/}
            </>
        );
    }
}


const styles = StyleSheet.create({
    notAbsolutePosition: {
        borderWidth: 0,
        borderColor: 'red',
        position: 'absolute',
        width: 341,
        height: 341
    },
    logo: {
        position: 'absolute',
        width: 60,
        height: 60
    }
});