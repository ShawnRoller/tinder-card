import React, { PureComponent } from 'react';
import { View, Animated, PanResponder } from 'react-native';

class Deck extends PureComponent {

  constructor(props) {
    super(props);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        console.log(gesture);
      },
      onPanResponderRelease: () => {}
    });

    this.panResponder = panResponder;
  }

  renderCards = () => {
    return this.props.data.map(item => {
      return this.props.renderCard(item);
    });
  }

  render() {
    return (
      <View {...this.panResponder.panHandlers}>
        {this.renderCards()}
      </View>
    );
  }

}

export default Deck;
