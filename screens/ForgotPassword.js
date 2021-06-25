import React, { Component } from 'react';
import { Text, TextInput, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firebase from 'firebase';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    input: {
        width: 260,
        height: 45,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 30
    },
    button: {
        width: 200,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        backgroundColor: '#2990cc',
        marginBottom: 15,
    }
});

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: null,
        };
    }

    remove_character(str_to_remove, str) {
        let reg = new RegExp(str_to_remove)
        return str.replace(reg, '')
    }

    handleResetPassword = () => {
        // e-mail field not empty
        if (this.state.email != null) {
            var temp = this.remove_character('@', this.state.email);
            var userEmail = temp.replace(/\./g, '');
            firebase.database().ref('users/' + userEmail).once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                // e-mail exists in DB
                if (exists) {
                    firebase.auth().sendPasswordResetEmail(this.state.email).then(function () {
                        Alert.alert('E-mail Sent', 'We have sent you a link to reset your password. If you didn\'t receive an e-mail, please check your spam folder.');
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
                else {
                    Alert.alert('Invalid E-mail', 'This e-mail is not registered with us');
                }
            }.bind(this));
        }
        else {
            Alert.alert('Invalid Input', 'Key in an e-mail address');
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
        return (
            <View style={styles.container}>
                <Text style={{ fontSize: 25, marginBottom: 50 }}>Reset Password</Text>
                <Text style={{ fontStyle: 'italic', fontSize: 16, marginBottom: 15, width: 260 }}>We will send you an e-mail with a link to reset your password</Text>
                <TextInput
                    value={this.state.email}
                    onChangeText={(email) => this.setState({ email })}
                    placeholder={'Email'}
                    style={styles.input} />
                <TouchableOpacity style={styles.button} onPress={this.handleResetPassword}>
                    <Text style={{ fontSize: 16, color: 'white' }}>Reset Password</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')} style={styles.button}>
                    <Text style={{ fontSize: 16, color: 'white' }}>Back</Text>
                </TouchableOpacity>
            </View>
        );
    }
}