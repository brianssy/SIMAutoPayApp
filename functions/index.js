const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const stripe = require('stripe')('sk_test_I4CtDB9dau5OEKv2iHw29l4g00oumMBNAc');

exports.payWithStripe = functions.https.onRequest((request, response) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys

    // eslint-disable-next-line promise/catch-or-return
   // eslint-disable-next-line promise/catch-or-return
   //console.log('destination is : ' + request.body.destination);

   stripe.charges.create({
    amount: request.body.amount,
    currency: request.body.currency,
    source: request.body.token,
    transfer_data: {
      destination: request.body.destination,
    },
  }).then(charges => {
        // asynchronously called
        response.send(charges);
        throw new Error("something went wrong");
    })
    .catch(error =>{
        console.log(error);
    });

    },
);