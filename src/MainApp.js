import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Ball from './Ball';

export default class MainApp extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Ball />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
}
