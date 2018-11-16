import React, { Component } from 'react';
import { View, Animated } from 'react-native';

class Ball extends Component {
  componentWillMount() {
    this.position = new Animated.ValueXY();
    Animated.spring(this.position, {
      toValue: { x: 50, y: 50 }
    }).start();

    this.colorAnimator = new Animated.Value(0);
    Animated.spring(this.colorAnimator, {
      toValue: 1
    }).start();


  }

  render() {
    const color = this.colorAnimator.interpolate({
      inputRange: [0, 1],
      outputRange: ['#000', '#ddd']
    });

    return (
      <Animated.View style={this.position.getLayout()}>
        <Animated.View style={[styles.ball, {borderColor: color}]}>
        </Animated.View>
      </Animated.View>
    );
  }
}

const styles = {
  container: {
    borderWidth: 10,
  },
  ball: {
    height: 60,
    width: 60,
    borderRadius: 30, 
    borderWidth: 30,
    borderColor: 'black'
  }
}

export default Ball;