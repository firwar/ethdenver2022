const functions = require("firebase-functions");
const { Requester, Validator } = require("@chainlink/external-adapter");
const { getFirestore, Timestamp, FieldValue, GeoPoint } = require('firebase-admin/firestore');
const haversine = require('haversine-distance');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Get Firestore
const db = getFirestore();

// Create a collection for user location
const dbRef = db.collection('userLocation');

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  sellerAddress: "user",
  buyerAddress: "user"
};

const DEFAULT_CLOSENESS_METERS = 50;

// Handles the App Update
const handleUpdateRequest = async ({ latitude, longitude, userAddress }) => {

  functions.logger.info(`${userAddress} is at ${latitude} ${longitude}`);

  // Create datapoint
  const userData = {
    latitude,
    longitude,
    userAddress: userAddress.toLowerCase()
  }

  try {
    await dbRef.doc(userAddress).set(userData);
    return {
      saved: true
    }
  } catch (e) {
    functions.logger.error(e);
    return {
      saved: false
    }
  }


};

// Helper function to compare the distance between to locations
const distanceBetweenUsers = (buyerUserData, sellerUserData) => {
  // Returns distance in meters;
  const buyerLocation = { latitude: buyerUserData.latitude, longitude: buyerUserData.longitude };
  const sellerLocation = { latitude: sellerUserData.latitude, longitude: sellerUserData.longitude };
  const distance = haversine(buyerLocation, sellerLocation);
  functions.logger.info(`Distance between ${buyerUserData.userAddress} and ${sellerUserData.userAddress} is ${distance}`);
  return distance <= DEFAULT_CLOSENESS_METERS;
};

// Handles the EA Request
const handleGetRequest = async (request) => {
  // Validate the EA Request
  const validator = new Validator(request, customParams);

  // Get JobRunId supplied from Node to EA
  const jobRunID = validator.validated.id;
  const { sellerAddress, buyerAddress } = validator.validated.data;

  functions.logger.info(`Address ${sellerAddress} ${typeof(sellerAddress)} ${buyerAddress} ${typeof(buyerAddress)}`)

  // Default Response
  // TODO we'll set some default precision for the GPS
  const defaultResponse = {
    jobRunID,
    data: false,
    result: null,
    statusCode: 200
  }

  try {
    // Query the data
    const sellerDoc = dbRef.doc(sellerAddress.toLowerCase());
    const sellerUserData = await sellerDoc.get();
    const buyerDoc = dbRef.doc(buyerAddress.toLowerCase());
    const buyerUserData = await buyerDoc.get();

    functions.logger.info(`Buyer ${JSON.stringify(buyerUserData.data())} Seller ${JSON.stringify(sellerUserData.data())}`)

    // Calculate the delta and just return true false because I don't want to do Geo math in Solidity
    const close = distanceBetweenUsers(buyerUserData.data(), sellerUserData.data());

    defaultResponse.data = close;
    return defaultResponse;
  } catch (e) {
    functions.logger.error(e);
    return defaultResponse;
  }

};

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.updateLocation = functions.https.onRequest( (request, response) => {
  if (request.body.userAddress === undefined) {
    const _data = JSON.parse(request.body);
    functions.logger.info(`Hello user ${_data.userAddress} with ${_data}`, {structuredData: true});
    handleUpdateRequest(_data).then( (resData) => {
      response.status(200).send(resData);
    });
  } else {
    functions.logger.info(`Hello user ${request.body.userAddress} with ${request.body}`, {structuredData: true});
    handleUpdateRequest(request.body).then( (resData) => {
      response.status(200).send(resData);
    });
  }
});

exports.getLocation = functions.https.onRequest( (request, response) => {
  functions.logger.info(`Hello user ${request.body.buyerAddress} ${request.body.sellerAddress}`, {structuredData: true});
  handleGetRequest(request.body).then( (resData) => {
    response.status(200).send(resData);
  });
});
