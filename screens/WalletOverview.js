import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, Button, TouchableOpacity, ImageBackground } from 'react-native';
import firebase from 'firebase';
import SimpleCrypto from "simple-crypto-js";
import { sha256, sha224 } from 'js-sha256';



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingBottom: '3%',
    },
    flat: {
        flex: 1,

    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
        width: 300,
        marginVertical: 10,

    },
    listItem: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#ccc',
        borderColor: 'black',
        borderWidth: 1
    },
    button: {
        alignItems: 'center',
        width: 150,
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#2990cc',
    },
});



export default class WalletOverview extends Component {



    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            email: null,
            loading: true,
            token: '',
            called: false,
        }
        this.state.email = (navigation.getParam('email'));
    }



    ConfirmRemoveCard = (item) => {
        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');

        firebase.database().ref('users/' + userEmail + '/Card/' + sha256(item.cardNum)).update(
            {
                name: 'Deleted',
                cvc: 'Deleted',
                expirymonth: 'Deleted',
                expiryyear: 'Deleted',
                brand: 'Deleted',
                Status: 'InActive',
            }).then(() => {
                this.componentWillMount();
            });


    }

    AlertRemoveCard = (item) => {
        Alert.alert(
            'Confirm Delete',
            'Card number : ' + '****   ****   ****   ' + item.cardNum.substring(item.cardNum.length - 4, item.cardNum.length),
            [
                { text: 'Yes', onPress: () => this.ConfirmRemoveCard(item) },
                {
                    text: 'No',
                    style: 'cancel',
                },

            ],
            { cancelable: false },
        );
    }

    //handling onPress action  
    getListViewItem = (item) => {

        var it = //item.key + "\n" +
            item.name + '\n' +
            item.cardNum + '\n' +
            item.expirymonth + '/' + item.expiryyear + '\n' +
            item.cvc;

        Alert.alert('Delete Card',
            'Card Holder: ' + item.name +
            '\nCard number: ' + '****   ****   ****   ' + item.cardNum.substring(item.cardNum.length - 4, item.cardNum.length),
            [
                { text: 'Delete', onPress: () => this.AlertRemoveCard(item) },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },

            ],
            { cancelable: false },
        );
        //alert(it);  
        //find item and delete in db
        //rerender the view
    }

    removeGoalHandler = cardId => {
        setCoursegoals(currentGoals => {
            return currentGoals.filter((goal) => goal.id !== goalId);
        });
    };

    remove_character(str_to_remove, str) {
        let reg = new RegExp(str_to_remove)
        return str.replace(reg, '')
    }

    componentWillUpdate() {
        if (this.state.loading == false && this.state.called == false) {
            this.setState({ loading: true });
            this.componentWillMount();
        }
    }

    reduction(email) {
        temp = sha256(email);
        for (i = 0; i < 3; i++) {
            temp = sha256(temp.substring(0, 32));
        }
        return temp;
    }

    DATA = [];



    componentWillMount() {
        this.state.called = true;
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
        DATA = [];
        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');

        var _secretKey = this.reduction(this.state.email);

        var simpleCrypto = new SimpleCrypto(_secretKey);

        firebase.database().ref('users/' + userEmail + '/Card').once('value', function (snapshot) {
            data = { key: '', name: '', cardNum: '', expirymonth: '', expiryyear: '', cvc: '', status: '' }
            snapshot.forEach(function (child) {

                child.forEach(function (stuff) {
                    if (stuff.key == 'cardno') {
                        data.cardNum = simpleCrypto.decrypt(stuff.val());
                    }
                    else if (stuff.key == 'cvc') {
                        data.cvc = simpleCrypto.decrypt(stuff.val());
                    }
                    else if (stuff.key == 'expirymonth') {
                        data.expirymonth = simpleCrypto.decrypt(stuff.val());
                    }
                    else if (stuff.key == 'expiryyear') {
                        data.expiryyear = simpleCrypto.decrypt(stuff.val());
                    }
                    else if (stuff.key == 'name') {
                        data.name = simpleCrypto.decrypt(stuff.val());
                    }
                    else if (stuff.key == 'brand') {
                        var brand = simpleCrypto.decrypt(stuff.val());
                        if (brand == 'MasterCard') {
                            data.brand = require('../assets/images/cardmaster.jpg');
                        }
                        else if (brand == 'Visa') {
                            data.brand = require('../assets/images/cardvisa.jpg');
                        }
                        else {
                            data.brand = require('../assets/images/carddefault.jpg');
                        }
                    }
                    else if (stuff.key == 'Status') {
                        data.status = stuff.val();
                    }
                })
                if (data.status == 'Active')
                    DATA.push(data);

                data = { name: '', cardNum: '', expirymonth: '', expiryyear: '', cvc: '', brand: '', status: '' }
            });

        }.bind(this)).then(() => {
            this.setState({ loading: false, called: false })

        });

    }


    render() {

        if (this.state.loading) {
            return null;
        }


        return (
            <View style={styles.container}>
                <View>
                    <Text style={{ fontSize: 18, paddingTop: 5, justifyContent: 'flex-end' }}>
                        {'Select the Card you wish to remove'}
                    </Text>
                </View>
                <FlatList
                    data={DATA}
                    renderItem={({ item }) =>
                        <View style={styles.flat}>
                            <TouchableOpacity style={styles.item}
                                onPress={this.getListViewItem.bind(this, item)}>
                                <ImageBackground style={{ width: '100%', height: '100%' }} source={item.brand}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', paddingTop: '30%', paddingLeft: '10%' }}>
                                        {'****   ****   ****   ' + item.cardNum.substring(item.cardNum.length - 4, item.cardNum.length)}
                                    </Text>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', paddingTop: '1%', paddingLeft: '10%' }}>
                                        <Text style={{ fontSize: 10 }}>
                                            {
                                                item.name + '                Good thru '
                                            }
                                        </Text>
                                        {
                                            item.expirymonth + '/' + item.expiryyear
                                        }
                                    </Text>
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>
                    } keyExtractor={(item => item.cardNum)}
                />
                <TouchableOpacity style={styles.button}
                    onPress={() => this.props.navigation.navigate('AddCard', { email: this.state.email })}>
                    <Text style={{ color: 'white' }}>Add Card</Text>
                </TouchableOpacity>
            </View>
        );

    }


}