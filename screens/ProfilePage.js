import React, { Component } from 'react';
import { Animated, StatusBar, Alert, StyleSheet, TextInput, Text, View, Image, Button, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import { sha256 } from 'js-sha256';
import SimpleCrypto from "simple-crypto-js";
import Dialog from 'react-native-dialog';

const styles = StyleSheet.create({
    contentContainer: {
        width: "100%",
        paddingLeft: 15,
        paddingRight: 15,
        aspectRatio: 1
    },
    header: {
        fontWeight: 'bold',
        fontSize: 28,
        alignSelf: 'flex-start'
    },
    header2: {
        fontWeight: 'bold',
        fontSize: 20,
        alignSelf: 'flex-start',
        backgroundColor: '#d3d3d3',
        width: '100%',
    },
    button: {
        width: '45%',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
        backgroundColor: '#2990cc',
        alignSelf: 'flex-end',
        marginBottom: 15,
    },
    TextBox: {
        height: 26,
        fontSize: 20,
        color: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#555'
    },
});

class FloatingLabelInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isFocused: false,
        }
    }
    componentWillMount() {
        this._animatedIsFocused = new Animated.Value(this.props.value === '' ? 0 : 1);
    }


    handleFocus = () => {
        const { onActive } = this.props;
        this.setState({ isFocused: true }, () => {
            onActive()
        })
    };
    handleBlur = () => {
        const { onActive } = this.props;
        this.setState(
            { isFocused: false }, () => {
                onActive()
            })
    };

    componentDidUpdate() {
        Animated.timing(this._animatedIsFocused, {
            toValue: (this.state.isFocused || this.props.value !== '') ? 1 : 0,
            duration: 200,
        }).start();
    }


    render() {
        const { label, onActive, ...props } = this.props;
        const { isFocused } = this.state;
        const labelStyle = {
            position: 'absolute',
            left: 0,
            top: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
            }),
            fontSize: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 14],
            }),
            color: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: ['#aaa', '#000'],
            }),
        };
        return (
            <View style={{ paddingTop: 18 }}>

                <Animated.Text style={labelStyle}>
                    {label}
                </Animated.Text>
                <TextInput {...props} style={styles.TextBox} onFocus={this.handleFocus} onBlur={this.handleBlur} blurOnSubmit />
            </View>
        );
    }
}
export default class ProfilePage extends Component {
    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            email: null,
            phone: null,
            name: null,
            verified: '(un-verified)',
            value: '',
            nameText: '',
            emailText: '',
            phoneText: '',
            bioAuth: null,
            bioHash: '',
            isEditing: false,
            dialogVisible: false,
            QuestionInput: '',
            AnswerInput: '',
            QuestionDialogVisible: false,
            AnswerInput2: '',
            invalidAnswer: '',
            Bothfilled: '',
        };
        handleTextChange = (newText) => this.setState({ value: newText });
        this.state.email = (navigation.getParam('email'));
    }

    handleQuestionInput = (typedText) => {
        this.setState({ QuestionInput: typedText });
    }
    handleAnswerInput = (typedText) => {
        this.setState({ AnswerInput: typedText });
    }
    handleAnswerInput2 = (typedText) => {
        this.setState({ AnswerInput2: typedText });
    }
    showDialog = () => {
        this.setState({ dialogVisible: true });
    }
    closeQuestionDialog = () =>{
        this.setState({QuestionDialogVisible: false,invalidAnswer:''})
    }

    handleSubmitAnswer = () => {
        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');
        if(this.state.AnswerInput == this.state.AnswerInput2.toLowerCase())
        {
            firebase.database().ref('users/' + userEmail).update(
            {
                SecurityQuestion: '',
                SecurityAnswer: '',
                biometricData: '',
                biometricAuth: false,
            });
            
            this.setState({ bioAuth: false,QuestionDialogVisible: false,invalidAnswer:''});
        }
        else{
            this.setState({invalidAnswer: 'Wrong Answer'});
        }
    }

    handleSubmit = () => {

        if(this.state.QuestionInput.length >0 && this.state.AnswerInput.length > 0)
        {
        const deviceId = Expo.Constants.deviceId;
        // hash user email with unique device id
        var concatEmailDeviceId = firebase.auth().currentUser.email + deviceId;
        const hashedDeviceId = sha256(concatEmailDeviceId);

        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');
        var _secretKey = this.reduction(this.state.email);

        var simpleCrypto = new SimpleCrypto(_secretKey);
        firebase.database().ref('users/' + userEmail).update(
            {
                SecurityQuestion: simpleCrypto.encrypt(this.state.QuestionInput),
                SecurityAnswer: simpleCrypto.encrypt(this.state.AnswerInput.toLowerCase()),
                biometricData: hashedDeviceId,
                biometricAuth: true,

            }).then(() => {
                this.setState({ QuestionInput: '',AnswerInput: '',dialogVisible: false
                ,bioAuth: true ,bioHash: hashedDeviceId,Bothfilled: ''});
                
            });
        }
        else{
            this.setState({Bothfilled: 'Please fill in both Question & Answer fields'});
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

    componentWillMount() {
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

        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');
        var _secretKey = this.reduction(this.state.email);

            var simpleCrypto = new SimpleCrypto(_secretKey);

        firebase.database().ref('users/' + userEmail).once('value', function (snapshot) {
            this.setState({ phone: simpleCrypto.decrypt(snapshot.val().phone) });
            this.setState({ bioAuth: snapshot.val().biometricAuth });
            this.setState({ bioHash: snapshot.val().biometricData });
        }.bind(this));

        var user = firebase.auth().currentUser;
        this.setState({ name: user.displayName });
        if (user.emailVerified) {
            this.setState({ verified: '(verified)' });
        }
    }


    EditDetails = () => {
        if (this.state.nameText != '' && this.state.nameText != null && this.state.name != this.state.nameText) {
            this.setState({ name: this.state.nameText });
            var user = firebase.auth().currentUser;
            user.updateProfile({
                displayName: this.state.nameText,
            }).then(() => {
                // Update successful.
                this.setState({ nameText: '' });
            }).catch(function (error) {
                // An error happened.
            });
        }
        if (this.state.phoneText != '' && this.state.phoneText != null && this.state.phone != this.state.phoneText) {
            this.setState({ phone: this.state.phoneText });
            var temp = this.remove_character('@', this.state.email);
            var userEmail = temp.replace(/\./g, '');
            var _secretKey = this.reduction(this.state.email);

            var simpleCrypto = new SimpleCrypto(_secretKey);
            // Get a key for a new Post.
            firebase.database().ref('users/' + userEmail).update(
                {
                    phone: simpleCrypto.encrypt(this.state.phoneText),

                }).then(() => {
                    this.setState({ phoneText: '' });
                });
        }
        this.setState({isEditing: false});

    }

    bindBiometrics = () => {        
        this.showDialog();
        
    }

    unbindBiometrics = () => {
        const deviceId = Expo.Constants.deviceId;
        // hash user email with unique device id
        var concatEmailDeviceId = firebase.auth().currentUser.email + deviceId;
        const hashedDeviceId = sha256(concatEmailDeviceId);
        this.state.email = this.state.email.toLowerCase();
            var temp = this.remove_character('@', this.state.email);
            var userEmail = temp.replace(/\./g, '');
        // check if hashedDeviceId tallies with DB biometricData
        if (this.state.bioHash == hashedDeviceId) {
            
            firebase.database().ref('users/' + userEmail).update(
                {
                    SecurityQuestion: '',
                    SecurityAnswer: '',
                    biometricData: '',
                    biometricAuth: false,
                });
            Alert.alert('Success', 'Your bounded biometrics have been removed successfully');
            this.setState({ bioAuth: false });
        } else {
            //Alert.alert('Failed', 'Please remove your bound biometrics from your previous device first');
            var _secretKey = this.reduction(this.state.email);
            var simpleCrypto = new SimpleCrypto(_secretKey);
    
            firebase.database().ref('users/' + userEmail).once('value', function (snapshot) {
                this.setState({ QuestionInput: simpleCrypto.decrypt(snapshot.val().SecurityQuestion) });
                this.setState({ AnswerInput: simpleCrypto.decrypt(snapshot.val().SecurityAnswer) });
            
            }.bind(this)).then(() => {
                this.setState({ QuestionDialogVisible: true });

            });
        }
    }

    toggleBiometricAuth = () => {
        if (this.state.bioAuth == false) {
            // set up biometric authentcation
            Alert.alert('Set-up Biometric', 'Your device\'s biometric data will be bound to your SimPay account', [
                { text: 'OK', onPress: this.bindBiometrics },
                { text: 'Cancel', style: 'cancel' },
            ]);
        } else {
            // remove biometric authentication
            Alert.alert('Remove biometric', 'This will remove your bounded biometrics in your account. Are you sure?', [
                { text: 'Yes', onPress: this.unbindBiometrics },
                { text: 'No', style: 'cancel' },
            ]);
        }
    }

    toggleEditing = () => {
        if(this.state.nameText != '' && this.state.nameText != null && this.state.phoneText != '' && this.state.phoneText != null)
        this.setState({isEditing: true});
        else if(this.state.nameText != '' && this.state.nameText != null)
            this.setState({isEditing: true});
        else if(this.state.phoneText != '' && this.state.phoneText != null)
            this.setState({isEditing: true});
        else
            this.setState({isEditing: !this.state.isEditing});
    }

    render() {
        const { isEditing } = this.state;
        return (
            <View style={styles.contentContainer}>
                <Text style={styles.header}>Profile Details </Text>
                <StatusBar hidden />
                <Text style={styles.header2}>Email: </Text>
                <Text style={{ color: "#aaa", fontSize: 20, alignSelf: 'flex-start' }}>{this.state.email}{this.state.verified}</Text>
                <Text style={styles.header2}>Mobile Number:</Text>
                <FloatingLabelInput
                    label={this.state.phone}
                    returnKeyType='done'
                    keyboardType={'numeric'}
                    value={this.state.phoneText}
                    onChangeText={(phoneText) => this.setState({ phoneText })}
                    onActive={() => { this.toggleEditing() }} />
                <Text style={styles.header2}>Name: </Text>
                <FloatingLabelInput label={this.state.name} value={this.state.nameText} onChangeText={(nameText) => this.setState({ nameText })}
                    onActive={() => { this.toggleEditing() }} />

                <Text style={styles.header2}>Biometric Authentication:</Text>
                <Text style={{ color: "#aaa", fontSize: 20, alignSelf: 'flex-start' }}>{this.state.bioAuth ? 'Yes' : 'No'}</Text>
                {
                    isEditing
                        ?
                        <TouchableOpacity style={styles.button} onPress={this.EditDetails}>
                            <Text style={{ fontSize: 16, color: 'white' }}>Edit Details</Text>
                        </TouchableOpacity>
                        : null
                }
                <TouchableOpacity style={styles.button} onPress={this.toggleBiometricAuth}>
                    <Text style={{ fontSize: 16, color: 'white' }}>{this.state.bioAuth ? 'Remove Biometric Authentication' : 'Set-up Biometric Authentication'}</Text>
                </TouchableOpacity>
                <Dialog.Container visible={this.state.dialogVisible}>
                    <Dialog.Title>Setting Security Question</Dialog.Title>
                    <Dialog.Description>Please key in a question that you know the answer to</Dialog.Description>
                    <Dialog.Description style={{color: 'red'}}>{this.state.Bothfilled}</Dialog.Description>
                    <Dialog.Input placeholder="Question" onChangeText={this.handleQuestionInput} />
                    <Dialog.Input placeholder="Answer" onChangeText={this.handleAnswerInput}/>
                    <Dialog.Button label='Submit' onPress={this.handleSubmit} />
                </Dialog.Container>
                <Dialog.Container visible={this.state.QuestionDialogVisible}>
                    <Dialog.Title>To unbind answer security question</Dialog.Title>
                    <Dialog.Description>{this.state.QuestionInput}</Dialog.Description>
                    <Dialog.Description style={{color: 'red'}}>{this.state.invalidAnswer}</Dialog.Description>
                    <Dialog.Input placeholder="Answer" onChangeText={this.handleAnswerInput2}/>
                    <Dialog.Button label='Submit' onPress={this.handleSubmitAnswer} />
                    <Dialog.Button label='Cancel' onPress={this.closeQuestionDialog} />
                </Dialog.Container>
            </View>
        );
    }
}

