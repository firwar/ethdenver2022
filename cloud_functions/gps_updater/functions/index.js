const functions = require("firebase-functions");
const { Requester, Validator } = require("@chainlink/external-adapter");
const { getFirestore, Timestamp, FieldValue, GeoPoint } = require('firebase-admin/firestore');

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
  requestingUser: "user",
  targetUser: "user"
};

const DEFAULT_CLOSENESS = 0.001;

// Handles the App Update
const handleUpdateRequest = async ({ latitude, longitude, userAddress }) => {

  // Create datapoint
  const userData = {
    location: new GeoPoint(latitude, longitude),
    userAddress
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
const distanceBetweenUsers = (requestUserData, targetUserData) => {
  const distance = requestUserData.location.compareTo(targetUserData.location);
  functions.logger.info(`Distance between ${requestUserData.userAddress} and ${targetUserData.userAddress} is ${distance}`);
  return distance <= DEFAULT_CLOSENESS;
};

// Handles the EA Request
const handleGetRequest = async (request) => {
  // Validate the EA Request
  const validator = new Validator(request, customParams);

  // Get JobRunId supplied from Node to EA
  const jobRunID = validator.validated.id;
  const { requestingUser, targetUser } = validator.validated.data;

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
    const [requestUserData, targetUserData] = await Promise.all([dbRef.get(requestingUser), dbRef.get(targetUser)]);

    // Calculate the delta and just return true false because I don't want to do Geo math in Solidity
    const close = distanceBetweenUsers(requestUserData, targetUserData);

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
  functions.logger.info(`Hello user ${request.body.sellerAddress}`, {structuredData: true});
  handleUpdateRequest(request.body).then( (resData) => {
    response.status(200).send(resData);
  });
});

exports.getLocation = functions.https.onRequest( (request, response) => {
  functions.logger.info(`Hello user ${request.body.sellerAddress}`, {structuredData: true});
  handleGetRequest(request.body).then( (resData) => {
    response.status(200).send(resData);
  });
});
