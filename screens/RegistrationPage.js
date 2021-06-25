import React, { Component } from 'react';
import { ScrollView, Animated, Dimensions, Keyboard, UIManager, Alert, StyleSheet, TextInput, Text, View, Image, Button, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase';
import SimpleCrypto from "simple-crypto-js";
import { sha256} from 'js-sha256';

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
  logo: {
    height: 150,
    width: 150,
    marginBottom: 15,
  },
  button: {
    width: 180,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#2990cc',
    marginBottom: 15,
  }
});
const { State: TextInputState } = TextInput;
export default class RegistrationPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: null,
      email: null,
      Hp: null,
      Pw: null,
      VerifyPw: null,
      shift: new Animated.Value(0),
    };

  }
  componentWillMount() {
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);
  }

  componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }


  handleNameText = (typedText) => {
    this.setState({ name: typedText});
  }
  handleEmailText = (typedText) => {
    this.setState({ email: typedText });
  }
  handleHpText = (typedText) => {
    this.setState({ Hp: typedText });
  }
  handlePwText = (typedText) => {
    this.setState({ Pw: typedText });
  }
  handleVerifyPwText = (typedText) => {
    this.setState({ VerifyPw: typedText });
  }
  remove_character(str_to_remove, str) {
    let reg = new RegExp(str_to_remove)
    return str.replace(reg, '')
  }


  VerifyEmail = () => {

    var user = firebase.auth().currentUser;

    user.sendEmailVerification().then(() => {
      // Email sent.

    }).catch(function (error) {
      // An error happened.
    });

  }

  reduction(email) {
    temp = sha256(email);
    for (i = 0; i < 3; i++) {
      temp = sha256(temp.substring(0, 32));
    }
    return temp;
  }
  handleSubmit = (event) => {
    // boolean to check if all fields are valid
    var Valid = true;
    var sentence = "";
    if (this.state.name == null || this.state.Hp == null || this.state.email == null
      || this.state.Pw == null || this.state.VerifyPw == null || this.state.name == ''
      || this.state.Hp == '' || this.state.email == '' || this.state.Pw == ''
      || this.state.VerifyPw == '') {

      if (this.state.name == null || this.state.name == '')
        sentence += "Name not filled\n";
      if (this.state.Hp == null || this.state.Hp == '')
        sentence += "Phone Number not filled\n";
      if (this.state.email == null || this.state.email == '')
        sentence += "Email not filled\n";
      if (this.state.Pw == null || this.state.VerifyPw == null
        || this.state.Pw == '' || this.state.VerifyPw == '')
        sentence += "Password not filled\n";

      Valid = false;
    }
    if (this.state.Hp != null) {
      var numbers = /^\d+$/.test(this.state.Hp);
      if (!numbers) {
        Valid = false;
        sentence += 'Please Input a valid phone number!\n';
      }
    }
    if (this.state.Pw != null && this.state.VerifyPw != null && this.state.Pw != this.state.VerifyPw) {
      sentence += 'Password Mismatch!\n';
      Valid = false;
    }
    else if (this.state.Pw != null && this.state.Pw.length < 6) {
      sentence += 'Password length must be a minimum of 6\n';
      Valid = false;
    }

    if (Valid) {
      var tempEmail = this.state.email;
      var name = this.state.name;
      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.Pw).then(function (result) {
        result.user.updateProfile({
          displayName: name
        })
        // this is to prevent double account creation in database as lower case letters are not detected
        this.state.email = this.state.email.toLowerCase();
        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');
        var _secretKey = this.reduction(this.state.email);

        var simpleCrypto = new SimpleCrypto(_secretKey);

        firebase.database().ref('users/' + userEmail).once('value', function (snapshot) {
          var exists = (snapshot.val() !== null);
          if (!exists) {
            this.VerifyEmail();
            firebase.database().ref('users/' + userEmail).set(
              {
                phone: simpleCrypto.encrypt(this.state.Hp),
                biometricAuth: false,
                biometricData: '',
              }
            ).then(() => {
              Alert.alert('Account Created', 'An email as been sent to your email account for verification', [
                { text: 'OK', onPress: () => this.props.navigation.navigate('Login') }
              ]);
            }).catch((error) => {

            });
          }

        }.bind(this));

      }.bind(this)).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorMessage == 'The email address is already in use by another account.') {
          Alert.alert('Account Exists', 'Email: ' + tempEmail + ' already exists');
          // this is to ensure database do not add mroe than 1 account details
          Valid = false;
        }

        if (errorCode == 'auth/invalid-email') {
          Alert.alert('Invalid Email', 'Please enter a valid email');
          Valid = false;
        }
      });

    }
    else
      Alert.alert('Invalid Input', sentence);

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

      <View style={styles.container}>
        <ScrollView style={{ width: '100%', marginTop: '30%' }}>
          <Animated.View style={[styles.container, { transform: [{ translateY: shift }] }]}>
            <Image
              source={require('../assets/images/icon4.png')}
              style={styles.logo} />
            <Text style={{ fontSize: 30, marginBottom: 15 }}>Create New Account</Text>
            <TextInput style={styles.input} placeholder={'Full Name'}
              onChangeText={this.handleNameText} value={this.state.name}></TextInput>
            <TextInput style={styles.input} placeholder={'E-mail'}
              onChangeText={this.handleEmailText} autoCapitalize='none' value={this.state.email}></TextInput>
            <TextInput returnKeyType='done' keyboardType={'numeric'} style={styles.input} placeholder={'Phone Number'}
              onChangeText={this.handleHpText} value={this.state.Hp} returnKeyType='done' keyboardType={'numeric'}></TextInput>
            <TextInput style={styles.input} placeholder={'Password'} secureTextEntry={true}
              onChangeText={this.handlePwText} value={this.state.Pw} />
            <TextInput style={styles.input} placeholder={'Verify Password'} secureTextEntry={true}
              onChangeText={this.handleVerifyPwText} value={this.state.VerifyPw} />
            <TouchableOpacity style={styles.button} onPress={this.handleSubmit}>
              <Text style={{ fontSize: 16, color: 'white' }}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('Login')}>
              <Text style={{ fontSize: 16, color: 'white' }}>Back</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>


    );
  }
  handleKeyboardDidShow = (event) => {
    const { height: windowHeight } = Dimensions.get('window');
    const keyboardHeight = event.endCoordinates.height;
    const currentlyFocusedField = TextInputState.currentlyFocusedField();
    UIManager.measure(currentlyFocusedField, (_originX, _originY, _width, height, _pageX, pageY) => {
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