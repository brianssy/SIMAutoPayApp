import React, { Component } from 'react';
import { Animated, Dimensions, Keyboard, UIManager, Alert, StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import SimpleCrypto from "simple-crypto-js";
import { sha256 } from 'js-sha256';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  input: {
    width: 200,
    height: 45,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15
  },
  button: {
    width: 180,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#2990cc',
  }
});
const { State: TextInputState } = TextInput;
export default class PaymentPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      email: this.props.navigation.getParam('email'),
      shift: new Animated.Value(0),
      merchantID: this.props.navigation.getParam('merchantID'),
      merchantName: '',
      cardCounter: 0,
      loading: true,
    }

  }

  remove_character(str_to_remove, str) {
    let reg = new RegExp(str_to_remove)
    return str.replace(reg, '')
  }

  reduction(email) {
    temp = sha256(email);
    for (i = 0; i < 3; i++) {
      temp = sha256(temp.substring(0, 32));
    }
    return temp;
  }
  // Check if there is at least 1 card
  CheckCards = () => {

    if (this.state.amount > 0.50) {
      var temp = this.remove_character('@', this.state.email);
      var userEmail = temp.replace(/\./g, '');


      counter = 0;
      firebase.database().ref('users/' + userEmail + '/Card').once('value', function (snapshot) {

        snapshot.forEach(function (child) {
          child.forEach(function (stuff) {

            if (stuff.key == 'Status') {
              if (stuff.val() == 'Active') {
                counter++;
              }
            }

          })

        });

      }.bind(this)).then(() => {
        if (counter > 0)
          this.props.navigation.navigate('ConfirmPayment', { email: this.state.email, merchantID: this.state.merchantID, amountPayable: this.state.amount, merchantName: this.state.merchantName })
        else
          this.props.navigation.navigate('AddCardPayment', { email: this.state.email, merchantID: this.state.merchantID, amountPayable: this.state.amount, merchantName: this.state.merchantName })
      });
    }
    else {
      Alert.alert('Please key in an amount above $0.50');
    }

  }

  componentWillMount() {

    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);
    var config = {
      apiKey: "AIzaSyDwNT6z_uPTNkYpup_E8uQjZ-0_PYDT4QM",
      authDomain: "aspdatabase-7458c.firebaseapp.com",
      databaseURL: "https://aspdatabase-7458c.firebaseio.com",
      projectId: "aspdatabase-7458c",
      storageBucket: "aspdatabase-7458c.appspot.com",
      messagingSenderId: "974951413468",
      appId: "1:974951413468:web:a0d27cbba22d508f51e619",
      measurementId: "G-W02TZC7QT6"
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    firebase.database().ref('Merchants/' + this.state.merchantID).once('value', function (snapshot) {
      var exists = (snapshot.val() !== null);
      if (exists) {
        this.setState({ merchantName: snapshot.val().name });
      }

    }.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }



  render() {
    const { shift } = this.state;
    // get merchant ID from previous screen

    return (
      <Animated.View style={[styles.container, { transform: [{ translateY: shift }] }]}>
        <View style={styles.container}>
          <Text style={{ fontSize: 16 }}>Vendor Name: {this.state.merchantName}</Text>
          <Text style={{ fontSize: 16 }}>Merchant ID: {this.state.merchantID}</Text>
          <Text style={{ fontSize: 16 }}>Input amount (S$):</Text>
          <TextInput style={styles.input} returnKeyType='done' keyboardType={'numeric'} value={this.state.amount} onChangeText={(amount) => this.setState({ amount })} />
          <TouchableOpacity style={styles.button} onPress={this.CheckCards}>
            <Text style={{ fontSize: 16, color: 'white' }}>Next</Text>
          </TouchableOpacity >
        </View>
      </Animated.View>
    );
  }

  handleKeyboardDidShow = (event) => {
    const { height: windowHeight } = Dimensions.get('window');
    const keyboardHeight = event.endCoordinates.height;
    const currentlyFocusedField = TextInputState.currentlyFocusedField();
    UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
      const fieldHeight = height;
      const fieldTop = pageY;
      const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
      if (gap >= 0) {
        return;
      }
      Animated.timing(
        this.state.shift,
        {
          toValue: gap,
          duration: 200,
          useNativeDriver: true,
        }
      ).start();
    });
  }

  handleKeyboardDidHide = () => {
    Animated.timing(
      this.state.shift,
      {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }
    ).start();
  }
}
