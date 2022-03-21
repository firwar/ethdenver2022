// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Import multiple functions
const signup = require('./signup');
const listings = require('./listings');

// Re-export the functions here
exports.signupEmail = signup.signupEmail;
exports.claimListing = listings.claimListing;
exports.claimListingTxn = listings.claimListingTxn;
exports.getListingDetail = listings.getListingDetail;
exports.getListingImage = listings.getListingImage;
exports.unlockListingTxn = listings.unlockListingTxn;
exports.updateListingVisitCount= listings.updateListingVisitCount;
