import React, { PureComponent } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

class Deck extends PureComponent {

  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
    renderNoMoreCards: () => {}
  }

  constructor(props) {
    super(props);

    this.state = { index: 0 };
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition(); 
        }
      }
    });

    this.panResponder = panResponder;
    this.position = position;
  }

  forceSwipe = direction => {
    const xPosition = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.position, {
      toValue: { x: xPosition, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete = direction => {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.setNextCard(this.state.index + 1)
  }

  setNextCard = (newIndex) => {
    this.position.setValue({ x: 0, y: 0 });
    this.setState({ index: newIndex });
  }

  resetPosition = () => {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 }
    }).start()
  }

  getCardStyle = () => {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    })
    return {
      ...this.position.getLayout(),
      transform: [{ rotate }]
    }
  }

  renderCards = () => {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, ix) => {

      if (ix < this.state.index) return null;

      if (ix === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={this.getCardStyle()}
            {...this.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return this.props.renderCard(item);
    });
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }

}

export default Deck;
