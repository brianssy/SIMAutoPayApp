import React, { Component } from 'react';
import { View, TouchableOpacity, Image ,Button } from 'react-native';
import { createAppContainer, createSwitchNavigator} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';

// import SwitchNavigation pages
import LoginPage from './screens/LoginPage.js';
import RegistrationPage from './screens/RegistrationPage.js';
import ForgotPassword from './screens/ForgotPassword.js'

// import QRStackNavigation pages
import MainMenu from './screens/MainMenu.js';
import QRScanner from './screens/QRScanner.js';
import PaymentPage from './screens/PaymentPage.js';
import CheckPayment from './screens/CheckPayment.js';
import ReceiptPage from './screens/ReceiptPage.js';
import AddCardPayment from './screens/AddCardForPayment.js';

// import WalletStackNavigation pages
import WalletOverview from './screens/WalletOverview.js';
import AddCardToWallet from './screens/AddCardToWallet.js';

// import ProfileStackNavigation pages
import ProfilePage from './screens/ProfilePage.js';
import AnalysisPage from './screens/AnalysisPage.js';

//import TransactionNavigation page
import TransactionPage from './screens/TransactionPage.js'

// import custom sidebar for drawer navigation
import SidebarMenu from './screens/SidebarMenu.js';


const styles = {
    header: {
        backgroundColor: '#2990cc',
        color: 'white',
      }
};

global.currentScreenIndex = 0;

class NavigationDrawerStructure extends Component {
    
    toggleDrawer = () => {
        this.props.navigationProps.toggleDrawer();
    };
    render() {
        return(
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                  <Image
                    source={require('./assets/images/drawer.png')}
                    style={{ width: 35, height: 35, marginLeft: 10 }}
                  />
                </TouchableOpacity>
            </View>
        );
    }
}

// wallet stack navigation
const WalletStackNavigation = createStackNavigator(
    {
        WalletMain:
        {
            screen: WalletOverview,
            navigationOptions: ({ navigation }) => ({
                headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
                headerTitle: 'Wallet',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
            })
        },
        AddCard:
        {
            screen: AddCardToWallet,
            navigationOptions:
            {
                headerTitle: 'Add a new card',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
                headerTintColor: 'white',
            },
        }
    }
);

//profile transaction navigation
const StatisticNavigation = createStackNavigator(
    {
        Statistic:
        {
            screen: AnalysisPage,
            navigationOptions: ({ navigation }) => ({
              headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
              headerTitle: 'Budget',
              headerStyle: styles.header,
              headerTitleStyle: {color:'white', fontWeight: 'bold'},
          })
        },
    },
  );

//profile transaction navigation
const TransactionNavigation = createStackNavigator(
  {
      Transaction:
      {
          screen: TransactionPage,
          navigationOptions: ({ navigation }) => ({
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerTitle: 'Transactions',
            headerStyle: styles.header,
            headerTitleStyle: {color:'white', fontWeight: 'bold'},
        })
      },
  },
);

// profile stack navigation
const ProfileStackNavigation = createStackNavigator(
    {
        ProfileMain:
        {
            screen: ProfilePage,
            navigationOptions: ({ navigation }) => ({
                headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
                headerTitle: 'Profile',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
            })
        },
    },
);

// QR stack navigation
const QRStackNavigation = createStackNavigator(
    {
        QRMain:
        {
            screen: MainMenu,
            navigationOptions: ({ navigation }) => ({
                headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
                headerTitle: 'QR Code Scanner',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},                
            }),
        },
        QRScan:
        {
            screen: QRScanner,
            navigationOptions: ({ navigation }) => (
            {
                headerTitle: 'Scan QR Code',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
                headerTintColor: 'white',
                headerLeft: <Button color='white' title="Back "onPress={() => navigation.navigate('QRMain',{inMainPage: true})}/>,
            }),
        },
        Payment:
        {
            screen: PaymentPage,
            navigationOptions:
            {
                headerTitle: 'Payment Details',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
                headerTintColor: 'white',
            },
        },
        ConfirmPayment:
        {
            screen: CheckPayment,
            navigationOptions:
            {
                headerTitle: 'Confirm Payment Details',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
                headerTintColor: 'white',
            },
        },
        PaymentSummary:
        {
            screen: ReceiptPage,
            navigationOptions:
            {
                headerTitle: 'Payment Summary',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
                headerTintColor: 'white',
            },

        },
        AddCardPayment:
        {
            screen: AddCardPayment,
            navigationOptions:
            {
                headerTitle: 'Add Card For Payment',
                headerStyle: styles.header,
                headerTitleStyle: {color:'white', fontWeight: 'bold'},
                headerTintColor: 'white',
            },
        },
    },
    {
        // starting route
        initialRouteName: 'QRMain',
    }
);

// drawer navigation
const DrawerNavigation = createDrawerNavigator(
    {
   
            QRStack:
            {
               screen: QRStackNavigation,
            },
            WalletStack:
            {
               screen: WalletStackNavigation,
            },
            ProfileStack:
            {
                screen: ProfileStackNavigation,
            },
            TransactionStack:
            {
                screen: TransactionNavigation,
            },
            StatisticStack:
            {
                screen: StatisticNavigation,
            },
    },
    {
         
        // for custom SidebarMenu
        contentComponent: SidebarMenu,
    }
);

// switch navigation
const SwitchNavigation = createSwitchNavigator(
    {
        Login: { screen: LoginPage },
        Registration: { screen: RegistrationPage },
        Landing: { screen: DrawerNavigation},
        Forgot: { screen: ForgotPassword },
    },
    {
        // starting route
        initialRouteName: 'Login',
    }
);

export default createAppContainer(SwitchNavigation);