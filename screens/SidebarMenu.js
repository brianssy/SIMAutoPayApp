import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, Button, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import firebase from 'firebase';

const styles = StyleSheet.create({

  Headerbar: {
    backgroundColor: '#2990cc',
    width: '100%',
    height: '11%'
  },
  sideMenuContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',

  },
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 150,
    height: 150,
    marginTop: 20,
    borderRadius: 150 / 2,
  },
});

export default class SidebarMenu extends Component {

  constructor() {
    super();



    this.items = [
      {
        navOptionThumb: 'camera-alt',
        navOptionName: 'Scan QR',
        screenToNavigate: 'QRStack',
      },
      {
        navOptionThumb: 'credit-card',
        navOptionName: 'Wallet',
        screenToNavigate: 'WalletStack',
      },
      {
        navOptionThumb: 'account-circle',
        navOptionName: 'Profile',
        screenToNavigate: 'ProfileStack',
      },
      {
        navOptionThumb: 'local-atm',
        navOptionName: 'Transaction',
        screenToNavigate: 'TransactionStack',
      },
      {
        navOptionThumb: 'equalizer',
        navOptionName: 'Budget',
        screenToNavigate: 'StatisticStack',
      },
    ];
  }

  // logout function
  logout = () => {
    var user = firebase.auth().currentUser;
    firebase.auth().signOut().then(function () {
    }, function (error) {
      console.error('Sign Out Error', error);
    });
    this.props.navigation.navigate('Login');
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
    const { navigation } = this.props;
    return (
      <View style={styles.sideMenuContainer}>
        <View style={styles.Headerbar} />
        {/*Setting up Navigation Options from option array using loop*/}
        <View style={{ width: '100%' }}>
          {this.items.map((item, key) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: global.currentScreenIndex === key ? '#e0dbdb' : '#ffffff',
              }}
              key={key}>
              <View style={{ marginRight: 10, marginLeft: 20 }}>
                <Icon name={item.navOptionThumb} size={25} color="#808080" />
              </View>
              <Text
                style={{
                  width: '100%',
                  fontSize: 18,
                  fontWeight: global.currentScreenIndex === key ? 'bold' : 'normal',
                }}
                onPress={() => {
                  global.currentScreenIndex = key;
                  this.props.navigation.navigate(item.screenToNavigate);
                }}>
                {item.navOptionName}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: 10,
          }} onPress={this.logout}>
            <View style={{ marginRight: 10, marginLeft: 20 }}>
              <Icon name={'exit-to-app'} size={25} color="#808080" />
            </View>
            <Text style={{ width: '100%', fontSize: 18 }}>Logout</Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }
}
