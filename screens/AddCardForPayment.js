import React, { Component } from 'react';
import { Animated, Dimensions, Keyboard, UIManager, Alert, StyleSheet, TextInput, Text, View, Image, TouchableOpacity, Button } from 'react-native';
import firebase from 'firebase';
import SimpleCrypto from "simple-crypto-js";
import { sha256, sha224 } from 'js-sha256';
var stripe = require('stripe-client')('pk_test_gA0EY3yvEnOSzsVZaWj3fAVb004i1hK2K9');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingBottom: '10%',
  },
  input: {
    alignItems: 'center',
    width: 200,
    height: 40,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15
  },
  inputtext: {
    fontSize: 12
  },
  cardimage: {
    width: 160,
    height: 150
  },
  forget: {
    marginBottom: 15,
    color: 'blue',
    textDecorationLine: 'underline',
    textAlign: 'right',
    alignItems: 'flex-end'
  },
  loginFooter: {
    marginTop: 25
  },
  button: {
    width: 200,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#2990cc',
  }
});
const { State: TextInputState } = TextInput;
export default class AddCardForPayment extends Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {
      email: null,
      name: null,
      cardnumber: null,
      expiry: null,
      cvc: null,
      shift: new Animated.Value(0),
      merchantID: this.props.navigation.getParam('merchantID'),
      amount: this.props.navigation.getParam('amountPayable'),
      merchantName: this.props.navigation.getParam('merchantName'),
    };
    this.state.email = (navigation.getParam('email'));

  }

  componentWillMount() {
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);
  }

  componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }

  reduction(email) {
    temp = sha256(email);
    for (i = 0; i < 3; i++) {
      temp = sha256(temp.substring(0, 32));
    }
    return temp;
  }

  remove_character(str_to_remove, str) {
    let reg = new RegExp(str_to_remove)
    return str.replace(reg, '')
  }

  handleUpdate = async () => {

    var Valid = true;
    if (this.state.name == null || this.state.cardnumber == null ||
      this.state.expiry == null || this.state.cvc == null) {
      var missingfields = "";
      if (this.state.name == null) {
        missingfields += "Name not filled\n";
        Valid = false;
      }

      if (this.state.cardnumber == null) {
        missingfields += "Card Number not filled\n";
        Valid = false;
      }

      if (this.state.expiry == null) {
        missingfields += "Expiry Date not filled\n";
        Valid = false;
      }

      if (this.state.cvc == null) {
        missingfields += "Security Code not filled\n";
        Valid = false;
      }
      Alert.alert('Missing Fields', missingfields);
    }
    else {
      var error = "";
      if (this.state.cardnumber.length < 12 || this.state.cardnumber.length > 19) {
        Valid = false;
        error += 'Card Number has invalid length\n';

        if (isNaN(this.state.cardnumber)) {
          Valid = false;
          error += 'Please Input only numerical for card number!\n';
        }
      }

      if (this.state.expiry != null) {
        var str = this.state.expiry;
        if (isNaN(this.state.expiry)) {
          Valid = false;
          error += 'Please Input only numerical for expiry date!\n';
        }
        if (this.state.expiry.length != 4) {
          Valid = false;
          error += 'Expiry Date length invalid, Format is (MMYY)\n';
        }
        if (str.substring(0, 2) > 12 || str.substring(0, 2) < 1) {
          Valid = false;
          error += 'Please Key in a Valid month\n';
        }
        if (str.substring(2, 4) > 99 || str.substring(2, 4) < 1) {
          Valid = false;
          error += 'Please Key in a valid Year\n';
        }
      }

      if (this.state.cvc != null) {
        if (isNaN(this.state.cvc)) {
          Valid = false;
          error += 'Please Input only numerical for CVC!\n';
        }
      }
      if (!Valid)
        Alert.alert('Invalid Input', error);
    }


    if (Valid) {
      var str = this.state.expiry
      var temp = this.remove_character('@', this.state.email);
      var userEmail = temp.replace(/\./g, '');
      this.state.cardnumber = this.state.cardnumber.trim();
      var information = {
        card: {
          number: this.state.cardnumber,
          exp_month: str.substring(0, 2),
          exp_year: str.substring(2, 4),
          cvc: this.state.cvc,
          name: this.state.name,
        }
      }
      // code below is to get token from stripe api
      var card = await stripe.createToken(information);
      if (card.id != null) {
        this.state.brand = card.card.brand;

        var _secretKey = this.reduction(this.state.email);

        var simpleCrypto = new SimpleCrypto(_secretKey);

        firebase.database().ref('users/' + userEmail + '/Card/' + sha256(this.state.cardnumber)).update(
          {
            name: simpleCrypto.encrypt(this.state.name),
            cardno: simpleCrypto.encrypt(this.state.cardnumber),
            cvc: simpleCrypto.encrypt(this.state.cvc),
            expirymonth: simpleCrypto.encrypt(str.substring(0, 2)),
            expiryyear: simpleCrypto.encrypt(str.substring(2, 4)),
            brand: simpleCrypto.encrypt(this.state.brand),
            Status: 'Active',
          }
        ).then(() => {
          this.props.navigation.navigate('WalletMain', { email: this.state.email });
          this.props.navigation.navigate('ConfirmPayment', { email: this.state.email, merchantID: this.state.merchantID, amountPayable: this.state.amount, merchantName: this.state.merchantName });

        }).catch((error) => {

        });
      }
      else {
        Alert.alert('Invalid Card', 'Please enter a valid card');
      }

    }
    else {
      // missingfields = "";
      // missingfields += this.state.name;
      // missingfields += "\n";
      // missingfields += this.state.cardnumber;
      // missingfields += "\n";
      // missingfields += this.state.expiry;
      // missingfields += "\n";
      // missingfields += this.state.cvc;
      // missingfields += "\n";
      // missingfields += Valid;
      // alert(missingfields);
    }


  }

  UNSAFE_componentWillMount() {
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
  }



  render() {
    const { shift } = this.state;
    return (
      <Animated.View style={[styles.container, { transform: [{ translateY: shift }] }]}>
        <View style={styles.container}>
          <Text style={styles.inputtext}>Name On Card</Text>
          <TextInput
            value={this.state.name}
            onChangeText={(name) => this.setState({ name })}
            style={styles.input} />

          <Text style={styles.inputtext}>Card Number</Text>
          <TextInput
            returnKeyType='done'
            keyboardType={'numeric'}
            value={this.state.cardnumber}
            onChangeText={(cardnumber) => this.setState({ cardnumber })}
            style={styles.input} 
            maxLength={19}
            />

          <Text style={styles.inputtext}>Expiry Date</Text>
          <TextInput
            returnKeyType='done'
            keyboardType={'numeric'}
            value={this.state.expiry}
            onChangeText={(expiry) => this.setState({ expiry })}
            placeholder={'MM/YY'}
            style={styles.input}
            maxLength={4} />

          <Text style={styles.inputtext}>Security Code(CVC/CVV)</Text>
          <TextInput
            returnKeyType='done'
            keyboardType={'numeric'}
            value={this.state.cvc}
            onChangeText={(cvc) => this.setState({ cvc })}
            style={styles.input}
            maxLength={3} />
          <TouchableOpacity onPress={this.handleUpdate} style={styles.button}>
            <Text style={{ color: 'white' }}>Proceed to payment</Text>
          </TouchableOpacity>
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