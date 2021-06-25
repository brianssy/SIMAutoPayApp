import React, { Component }from 'react';
import { Animated, Dimensions, Keyboard, UIManager, Alert, StyleSheet, TextInput, Text, View, Image, Button, TouchableOpacity } from 'react-native';
import firebase from 'firebase';

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
    width: 192,
    height: 192,
    marginBottom: 15,
  },
  forget: {
    marginBottom: 15,
    color: 'blue',
    textDecorationLine: 'underline',
    alignItems: 'center',
  },
  loginFooter: {
    marginTop: 25
  },
  button: {
    width: 200,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#2990cc'
  }
});

const { State: TextInputState } = TextInput;

export default class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: null,
      password: null,
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

  onLogin() {
    const { email, password } = this.state;
    Alert.alert('Credentials', `Username = ${email}\nPassword = ${password}`);
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

  handleLogin = (event) => {
    if (this.state.email != null && this.state.password != null) {
      this.state.email = this.state.email.toLowerCase();
       
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(function () {
        var user = firebase.auth().currentUser;
        // if user is verified then log him in
        if (user.emailVerified) {
          this.props.navigation.navigate('WalletMain', { email: this.state.email });
          this.props.navigation.navigate('ProfileMain', { email: this.state.email });
          this.props.navigation.navigate('QRMain', { email: this.state.email });
        }
        else {
          Alert.alert('Account un-verified', 'An Email has been sent to your email for verification');
          this.VerifyEmail();
          firebase.auth().signOut().then(function () {
            // signed out
          }, function (error) {
            console.error('Sign Out Error', error);
          });
        }

      }.bind(this)).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorMessage == 'The password is invalid or the user does not have a password.') {
          Alert.alert('Invalid Input', 'Invalid Username and/or Password');
        }
        else if (errorMessage == 'Too many unsuccessful login attempts. Please try again later.') {
          Alert.alert('Too many unsuccessful login attempts.', 'Please try again later.');
        }
        else {
          Alert.alert('Invalid Input', 'Invalid Username and/or Password');
        }


  });


    }
    else
      Alert.alert('Invalid Input', 'Key in a Username and Password');
      

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
        <Animated.View style={[styles.container, { transform: [{ translateY: shift }] }]}>
          <Image
            source={require('../assets/images/icon4.png')}
            style={styles.logo} />
          <Text style={{ fontSize: 28, marginBottom: 25 }}>WELCOME</Text>
          <TextInput
            value={this.state.email}
            onChangeText={(email) => this.setState({ email })}
            placeholder={'Email'}
            autoCapitalize='none'
            style={styles.input} />
          <TextInput
            value={this.state.password}
            onChangeText={(password) => this.setState({ password })}
            placeholder={'Password'}
            secureTextEntry={true}
            style={styles.input} />
          <Text style={styles.forget} onPress={() => this.props.navigation.navigate('Forgot')}>Forget Password?</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={{ fontSize: 16, color: 'white' }}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.loginFooter} >Don't have an account yet?</Text>
          <Text style={styles.loginFooter, { color: 'blue', textDecorationLine: 'underline' }}
            onPress={() => this.props.navigation.navigate('Registration')}>Create new account</Text>
        </Animated.View>
      </View>

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
