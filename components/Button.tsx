import React from "react";
import {Image, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback} from "react-native";

type ButtonProps = {
}

type ButtonState = {
    isTouchDown: boolean
}

export class Button extends React.Component<ButtonProps, ButtonState> {
    state: ButtonState = {
        isTouchDown: false,
    };

    touchablePressIn = () => {
        console.log("touchable pressed in");
        this.setState({isTouchDown: true});
    };

    touchablePressOut = () => {
        console.log("touchable pressed out");
        this.setState({isTouchDown: false});
    };

    render = () => {
        const image = this.state.isTouchDown ?
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
                    onPressIn={this.touchablePressIn}
                    onPressOut={this.touchablePressOut}
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
        borderWidth: 1,
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
