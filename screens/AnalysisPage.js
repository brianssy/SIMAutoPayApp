import React, { Component } from 'react';
import { AppRegistry, StyleSheet, ScrollView, StatusBar, Text, View, TouchableOpacity } from 'react-native';
import PieChart from 'react-native-pie-chart';
import firebase from 'firebase';
import SimpleCrypto from "simple-crypto-js";
import { sha256, sha224 } from 'js-sha256';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: '10%',
        paddingBottom: '3%',
    },
    title: {
        fontSize: 24,
        margin: 10,
        backgroundColor: '#90DBFF',
        borderWidth: 2,
        borderColor: '#30689F',
        width: '90%',
        textAlign: 'center',
        padding: '3%',
    },
    TextStyle: {
        padding: 5,
        fontSize: 16,
        textAlign: 'center',
        borderWidth: 1,
    },
    button: {
        alignItems: 'center',
        width: 90,
        margin: 5,
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#2990cc',
    },
});

export default class AnalysisPage extends Component {

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            duration: 1,
            card: "",
            email: null,
            loading: true,
            called: false,
            ThreeMonths: [],
            FirstMonth: [],
            SecondMonth: [],
            ThirdMonth: [],
            CardsAvailable: [],
            DATA4: [],
            BusinessTypes: [],
            percentile: [],
            sliceColor: [],
            totalAmount: 0,
            Month: this.get_Month(new Date().getMonth() + 1),
            LoggedOut: false,
            loadedOnce: false,

        }
    }


    remove_character(str_to_remove, str) {
        let reg = new RegExp(str_to_remove)
        return str.replace(reg, '')
    }

    get_Month(month) {
        if (month == 1)
            return 'January';
        else if (month == 2)
            return 'Febuary';
        else if (month == 3)
            return 'March';
        else if (month == 4)
            return 'April';
        else if (month == 5)
            return 'May';
        else if (month == 6)
            return 'June';
        else if (month == 7)
            return 'July';
        else if (month == 8)
            return 'August';
        else if (month == 9)
            return 'September';
        else if (month == 10)
            return 'October';
        else if (month == 11)
            return 'November';
        else
            return 'December';
    }

    SortByTiming = (MonthSet) => {
        tempMonth = [];
        while (MonthSet.length != 0) {
            var largest = MonthSet[0].totalSeconds;
            var index = 0;
            for (i = 0; i < MonthSet.length; i++) {
                if (MonthSet[i].totalSeconds > largest) {
                    largest = MonthSet[i].totalSeconds;
                    index = i;
                }
            }
            tempMonth.push(MonthSet[index]);
            MonthSet.splice(index, 1);
        }
        return tempMonth;
    }

    SortByMonths = () => {

        for (i = 0; i < this.state.ThreeMonths.length; i++) {
            for (j = 0; j < this.state.DATA4.length; j++) {
                //Push to first month
                if (i == 0) {
                    if (this.state.DATA4[j].month == this.state.ThreeMonths[0].month && this.state.DATA4[j].year == this.state.ThreeMonths[0].year) {
                        this.state.FirstMonth.push(this.state.DATA4[j]);
                    }
                }
                else if (i == 1) {
                    if (this.state.DATA4[j].month == this.state.ThreeMonths[1].month && this.state.DATA4[j].year == this.state.ThreeMonths[1].year) {
                        this.state.SecondMonth.push(this.state.DATA4[j]);
                    }
                }
                else if (i == 2) {
                    if (this.state.DATA4[j].month == this.state.ThreeMonths[2].month && this.state.DATA4[j].year == this.state.ThreeMonths[2].year) {
                        this.state.ThirdMonth.push(this.state.DATA4[j]);
                    }
                }


            }
        }
    }

    Get3months = () => {
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        Months = [];
        currDate = { month: month, year: year };
        Months.push(currDate);
        // pushing the next 2 months depending on conditions
        for (i = 0; i < 2; i++) {
            month--;
            //if current month is january the prev 2 months will be dec and nov
            if (month == 0) {
                month = 12;
                year--;
            }
            currDate = { month: month, year: year };
            Months.push(currDate);
        }
        this.state.ThreeMonths = Months;

    }

    SortbyDate = () => {

        tempData = [];
        while (this.state.DATA4.length != 0) {
            var largest = (this.state.DATA4[0].year * 365) + (this.state.DATA4[0].month * 30) + (this.state.DATA4[0].day * 1);
            var index = 0;
            for (i = 0; i < this.state.DATA4.length; i++) {
                var curr = (this.state.DATA4[i].year * 365) + (this.state.DATA4[i].month * 30) + (this.state.DATA4[i].day * 1);
                if (curr > largest) {
                    largest = curr;
                    index = i;
                }

            }
            tempData.push(this.state.DATA4[index]);
            this.state.DATA4.splice(index, 1);
        }
        this.state.DATA4 = tempData;
    }



    getCards2 = () => {


        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');

        var _secretKey = this.reduction(this.state.email);

        var simpleCrypto = new SimpleCrypto(_secretKey);

        Cards = []
        firebase.database().ref('users/' + userEmail + '/Card')
            .once('value', function (snapshot) {

                snapshot.forEach(function (child) {

                    child.forEach(function (stuff) {
                        if (stuff.key == 'cardno') {
                            Cards.push(simpleCrypto.decrypt(stuff.val()));
                        }
                    })

                });
            }.bind(this)).then(() => {
                Cards.push("All")
                this.state.card = Cards[0];
                this.state.CardsAvailable = Cards;
                this.getAllTransactions2();
            });

    }


    getAllTransactions2 = () => {
        var temp = this.remove_character('@', this.state.email);
        var userEmail = temp.replace(/\./g, '');

        var _secretKey = this.reduction(this.state.email);

        var simpleCrypto = new SimpleCrypto(_secretKey);
        this.state.DATA4 = [];
        this.state.FirstMonth = [];
        this.state.SecondMonth = [];
        this.state.ThirdMonth = [];
        DATAtemp2 = [];

        for (i = 0; i < this.state.CardsAvailable.length - 1; i++) {
            this.state.card = this.state.CardsAvailable[i];
            firebase.database().ref('users/' + userEmail + '/Card/' + sha256(this.state.card) + '/Transactions')
                .once('value', function (snapshot) {

                    data = { amount: '', name: '', day: '', month: '', year: '', totalSeconds: '', paid: '', cardnum: '' };

                    snapshot.forEach(function (child) {

                        child.forEach(function (stuff) {
                            if (stuff.key == 'amount') {
                                // data.amount = simpleCrypto.decrypt(stuff.val());
                                data.amount = stuff.val();
                            }
                            else if (stuff.key == 'date') {
                                //var date = simpleCrypto.decrypt(stuff.val());
                                var date = stuff.val();
                                var array = date.split("/");
                                data.day = array[0];
                                data.month = array[1];
                                data.year = array[2];

                            }
                            else if (stuff.key == 'paid') {
                                //data.merchant = simpleCrypto.decrypt(stuff.val());
                                data.merchant = stuff.val();
                            }
                            else if (stuff.key == 'time') {
                                // var time = simpleCrypto.decrypt(stuff.val());
                                var time = stuff.val();
                                var array = time.split(":");
                                data.totalSeconds = (array[0] * 60 * 60) + (array[1] * 60) + (array[2] * 1)
                            }
                            else if (stuff.key == 'card') {
                                //data.merchant = simpleCrypto.decrypt(stuff.val());
                                data.cardnum = stuff.val();
                            }
                            else if (stuff.key == 'type') {
                                //data.merchant = simpleCrypto.decrypt(stuff.val());
                                data.type = stuff.val();
                            }
                        })


                        DATAtemp2.push(data);
                        data = { amount: '', name: '', day: '', month: '', year: '', totalSeconds: '', paid: '', cardnum: '', type: '' };
                    });
                }.bind(this)).then(() => {
                    count = this.state.CardsAvailable.length - 1
                    if (i == count);
                    {

                        this.state.DATA4 = DATAtemp2;
                        this.SetBusinessType();
                        this.state.card = "All";
                        this.SortbyDate();
                        this.Get3months();
                        this.SortByMonths();
                        this.state.FirstMonth = this.SortByTiming(this.state.FirstMonth);
                        this.state.SecondMonth = this.SortByTiming(this.state.SecondMonth);
                        this.state.ThirdMonth = this.SortByTiming(this.state.ThirdMonth);

                        var currMonth = new Date().getMonth() + 1; //Current Month
                        var PreviousMonth = currMonth - 1;// month before current month
                        // if the current month is january
                        if (PreviousMonth == 0) {
                            PreviousMonth = 12;
                        }
                        var thirdPrev = PreviousMonth - 1;// month before the 2nd prev month

                        if (this.state.Month == this.get_Month(currMonth))
                            this.get1Month();
                        else if (this.state.Month == this.get_Month(PreviousMonth))
                            this.get2Month();
                        else if (this.state.Month == this.get_Month(thirdPrev))
                            this.get3Month();
                        this.setState({ loading: false, called: false });

                    }
                });
        }
        // a default page if no cards are created yet
        if (this.state.CardsAvailable.length == 1) {

            this.setState({ loading: false, called: false });
        }
    }

    componentWillUpdate() {
        if (this.state.loading == false && this.state.called == true && this.state.LoggedOut == false) {
            this.state.loading = true;
            this.getCards2();
        }
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


        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                this.setState({ email: user.email, LoggedOut: false });

                this.getCards2();
            } else {
                // No user is signed in.
                this.setState({ LoggedOut: true });
            }
        }.bind(this));




    }

    reduction(email) {
        temp = sha256(email);
        for (i = 0; i < 3; i++) {
            temp = sha256(temp.substring(0, 32));
        }
        return temp;
    }

    getWantedMonth = (month) => {

        var currMonth = new Date().getMonth() + 1; //Current Month
        var PreviousMonth = currMonth - 1;// month before current month
        // if the current month is january
        if (PreviousMonth == 0) {
            PreviousMonth = 12;
        }
        var thirdPrev = PreviousMonth - 1;// month before the 2nd prev month

        if (month == 1) {
            return currMonth;
        }
        else if (month == 2) {
            return PreviousMonth;
        }
        else
            return thirdPrev;
    }

    get1Month = () => {

        // total amount reset
        this.state.totalAmount = 0;
        // reset all business amount to 0
        for (i = 0; i < this.state.BusinessTypes.length; i++) {
            this.state.BusinessTypes[i].amount = 0;
        }

        for (i = 0; i < this.state.FirstMonth.length; i++) {
            for (j = 0; j < this.state.BusinessTypes.length; j++) {
                if (this.state.FirstMonth[i].type == this.state.BusinessTypes[j].type) {
                    this.state.BusinessTypes[j].amount += 1 * this.state.FirstMonth[i].amount;
                }

            }
        }

        percent = []
        for (i = 0; i < this.state.BusinessTypes.length; i++) {
            percent.push(this.state.BusinessTypes[i].amount);
            this.state.totalAmount += this.state.BusinessTypes[i].amount;
        }
        if (this.state.totalAmount == 0) {
            percent = [];
            for (i = 0; i < this.state.BusinessTypes.length; i++) {
                percent.push(100);
            }
        }
        this.state.loading = false;
        this.state.called = false;
        this.setState({ percentile: percent });

    }
    get1StatHandler = () => {
        this.state.loading = false;
        this.state.called = true;
        this.setState({ Month: this.get_Month(new Date().getMonth() + 1) })
    }

    get2Month = () => {

        // total amount reset
        this.state.totalAmount = 0;
        // reset all business amount to 0
        for (i = 0; i < this.state.BusinessTypes.length; i++) {
            this.state.BusinessTypes[i].amount = 0;
        }

        for (i = 0; i < this.state.SecondMonth.length; i++) {

            for (j = 0; j < this.state.BusinessTypes.length; j++) {
                if (this.state.SecondMonth[i].type == this.state.BusinessTypes[j].type) {
                    this.state.BusinessTypes[j].amount += 1 * this.state.SecondMonth[i].amount;
                }

            }
        }

        percent = [];
        for (i = 0; i < this.state.BusinessTypes.length; i++) {
            percent.push(this.state.BusinessTypes[i].amount);
            this.state.totalAmount += this.state.BusinessTypes[i].amount;
        }
        if (this.state.totalAmount == 0) {
            percent = [];
            for (i = 0; i < this.state.BusinessTypes.length; i++) {
                percent.push(100);
            }
        }
        this.state.loading = false;
        this.state.called = false;
        this.setState({ percentile: percent });


    }

    get2StatHandler = () => {
        var currMonth = new Date().getMonth() + 1; //Current Month
        var PreviousMonth = currMonth - 1;// month before current month
        // if the current month is january
        if (PreviousMonth == 0) {
            PreviousMonth = 12;
        }

        this.state.loading = false;
        this.state.called = true;
        this.setState({ Month: this.get_Month(PreviousMonth) });
    }

    get3Month = () => {


        // total amount reset
        this.state.totalAmount = 0;
        // reset all business amount to 0
        for (i = 0; i < this.state.BusinessTypes.length; i++) {
            this.state.BusinessTypes[i].amount = 0;
        }

        for (i = 0; i < this.state.ThirdMonth.length; i++) {

            for (j = 0; j < this.state.BusinessTypes.length; j++) {
                if (this.state.ThirdMonth[i].type == this.state.BusinessTypes[j].type) {
                    this.state.BusinessTypes[j].amount += 1 * this.state.ThirdMonth[i].amount;
                }

            }
        }

        percent = [];
        for (i = 0; i < this.state.BusinessTypes.length; i++) {
            percent.push(this.state.BusinessTypes[i].amount);
            this.state.totalAmount += this.state.BusinessTypes[i].amount;
        }
        if (this.state.totalAmount == 0) {
            percent = [];
            for (i = 0; i < this.state.BusinessTypes.length; i++) {
                percent.push(100);
            }
        }
        this.state.loading = false;
        this.state.called = false;
        this.setState({ percentile: percent });


    }

    get3StatHandler = () => {
        var currMonth = new Date().getMonth() + 1; //Current Month
        var PreviousMonth = currMonth - 1;// month before current month
        // if the current month is january
        if (PreviousMonth == 0) {
            PreviousMonth = 12;
        }
        thirdPrev = PreviousMonth - 1;
        this.state.loading = false;
        this.state.called = true;
        this.setState({ Month: this.get_Month(thirdPrev) });
    }


    SetBusinessType = () => {
        const sliceColor = ['#DB4040', '#60309F', '#4098DB', '#40DB93', '#E2F373', '#F0C54F', '#C761D7', '#61D7CF']
        for (i = 0; i < this.state.DATA4.length; i++) {
            found = false;
            data = { type: '', key: '' };
            for (j = 0; j < this.state.BusinessTypes.length; j++) {
                if (this.state.DATA4[i].type == this.state.BusinessTypes[j].type) {
                    found = true;
                }
            }
            if (!found) {
                data.type = this.state.DATA4[i].type;
                data.key = this.state.DATA4[i].totalSeconds;
                data.colour = sliceColor[this.state.BusinessTypes.length];
                data.amount = 0;
                this.state.sliceColor.push(sliceColor[this.state.BusinessTypes.length]);
                this.state.BusinessTypes.push(data);
                data = { type: '', key: '' };
            }
        }


    }


    render() {

        if (this.state.loading || this.state.LoggedOut) {
            return null;
        }

        const chart_wh = 150

        return (

            <View style={styles.container}>
                <StatusBar
                    hidden={true}
                />
                <View style={{ flexDirection: 'row' }}>
                    {this.state.totalAmount ?
                        <PieChart
                            chart_wh={chart_wh}
                            series={this.state.percentile}
                            sliceColor={this.state.sliceColor}
                            doughnut={true}
                            coverRadius={0.5}
                            coverFill={'#FFF'}
                        />
                        : null}
                    <View style={{ flexDirection: 'column', paddingLeft: '10%', paddingTop: '10%' }}>
                        {this.state.totalAmount ? this.state.BusinessTypes.map((item) => (
                            <Text key={item.key} style={styles.TextStyle} style={{ backgroundColor: item.colour, fontSize: 16, color: 'white', fontWeight: 'bold' }}> {item.type} </Text>)
                        ) : null}
                    </View>
                </View>
                <Text style={styles.title}>{this.state.Month}</Text>

                <ScrollView style={{ flex: 1, width: '100%' }}>
                    <View style={{ flexDirection: 'column', padding: '5%' }}>
                        {this.state.totalAmount ? this.state.BusinessTypes.map((item) => <View key={item.key + 1}>
                            <Text style={{ backgroundColor: item.colour, fontSize: 20, textAlign: 'center', borderWidth: 1, borderColor: item.colour }}> {item.type} </Text>
                            <Text key={item.key} style={{
                                padding: 5,
                                fontSize: 16,
                                textAlign: 'center',
                                borderWidth: 1,
                                borderColor: item.colour
                            }} >
                                Amount Spent: ${item.amount} - {item.amount ? Math.round((item.amount / this.state.totalAmount) * 100) : 0}%
     </Text>
                        </View>) : <Text>No Transactions made in the month of {this.state.Month}</Text>}
                        <Text style={{ textAlign: 'center', fontSize: 16, backgroundColor: '#90DBFF', fontWeight: 'bold', borderWidth: 1 }}>Total amount spent : ${this.state.totalAmount}</Text>
                    </View>
                </ScrollView>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.button}
                        onPress={this.get1StatHandler}>
                        <Text style={{ color: 'white' }}>{this.get_Month(this.getWantedMonth(1))}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                        onPress={this.get2StatHandler}>
                        <Text style={{ color: 'white' }}>{this.get_Month(this.getWantedMonth(2))}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                        onPress={this.get3StatHandler}>
                        <Text style={{ color: 'white' }}>{this.get_Month(this.getWantedMonth(3))}</Text>
                    </TouchableOpacity>
                </View>
            </View>


        );
    }
}

AppRegistry.registerComponent('AnalysisPage', () => AnalysisPage);

