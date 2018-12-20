import React, { PureComponent } from 'react';
import { 
  View, 
  Animated, 
  PanResponder, 
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;
const SCALE_INCREMENTOR = 0.02;
const POSITION_INCREMENTOR = 12;
const PADDING = 5;

class Deck extends PureComponent {

  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
    renderNoMoreCards: () => {}
  }

  constructor(props) {
    super(props);

    this.state = { index: 0, itemPositions: [], itemScales: [] };
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setupCards();
      this.setState({ index: 0 });
    }
  }

  componentWillMount() {
    this.setupCards();
  }

  setupCards = () => {
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

    var itemPositions = [];
    var itemScales = [];
  
    this.props.data.map((item, index) => {
      const newPosition = new Animated.ValueXY({ x: 0, y: POSITION_INCREMENTOR * index });
      itemPositions.push(newPosition);

      const newScale = new Animated.Value(1 - (index * SCALE_INCREMENTOR));
      itemScales.push(newScale);
    });

    this.setState({ itemPositions, itemScales });
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

  getTopCardStyle = () => {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    })
    return {
      ...this.position.getLayout(),
      transform: [{ rotate }]
    }
  }

  getCardStyleForIndex = (ix) => {
    const position = this.state.itemPositions[ix];
    const scale = this.state.itemScales[ix];

    return {
      ...position.getLayout(),
      transform: [{ scale }],
      top: PADDING * (ix - this.state.index)
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
            style={[this.getTopCardStyle(), styles.cardStyle]}
            {...this.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return (
        <Animated.View 
          key={item.id}
          style={ this.getCardStyleForIndex(ix) }
        >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }

}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
}

export default Deck;
