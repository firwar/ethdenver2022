const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');

// Get Firestore
const db = getFirestore();


const LISTING_DETAIL_COLLECTION_NAME = 'listingDetails';
const LISTING_IMAGE_COLLECTION_NAME = 'listingImages';

const handleListingDetailRequest = async ({ listingId }) => {
  // Collection for listing details
  const listingRef = db.collection(LISTING_DETAIL_COLLECTION_NAME);
  const listingDoc = listingRef.doc(listingId);
  const data = (await listingDoc.get()).data();
  return data;
};

const handleListingImageRequest = async ({ listingId }) => {
  // Collection for listing details
  const listingRef = db.collection(LISTING_IMAGE_COLLECTION_NAME);
  const listingImageDoc = listingRef.doc(listingId);
  const data = (await listingImageDoc.get()).data();
  return data;
};

const handleClaimListingTxnRequest = async ({ listingId, claimListingTxn }) => {
  // Collection for listing details
  const listingRef = db.collection(LISTING_DETAIL_COLLECTION_NAME);
  const listingDoc = listingRef.doc(listingId);
  try {
    await listingDoc.update({ claimListingTxn });
    return true;
  } catch (e) {
    functions.logger.error(e, { structuredData: true });
    return false;
  }
};

const handleClaimListingRequest = async ({ listingId, listingAddress, sellerAddress }) => {
  // Collection for listing details
  const listingRef = db.collection(LISTING_DETAIL_COLLECTION_NAME);
  const listingDoc = listingRef.doc(listingId);
  try {
    await listingDoc.update({ listingAddress, sellerAddress });
    return true;
  } catch (e) {
    functions.logger.error(e, { structuredData: true });
    return false;
  }
};

const handleUnlockListingTxnRequest = async ({ listingId, unlockListingTxn }) => {
  // Collection for listing details
  const listingRef = db.collection(LISTING_DETAIL_COLLECTION_NAME);
  const listingDoc = listingRef.doc(listingId);
  try {
    await listingDoc.update({ unlockListingTxn });
    return true;
  } catch (e) {
    functions.logger.error(e, { structuredData: true });
    return false;
  }
};


const handleUpdateListingVisitCount = async ({ listingId }) => {
  // Collection for listing details
  const listingRef = db.collection(LISTING_DETAIL_COLLECTION_NAME);
  const listingDoc = listingRef.doc(listingId);
  const data = (await listingDoc.get()).data();
  let visitCount = 0;

  try {
    if (data.visitCount != undefined) {
      visitCount = data.visitCount;
    }
    visitCount += 1;
    console.log(data);
    await listingDoc.update({ visitCount });
    return true;
  } catch (e) {
    functions.logger.error(e, { structuredData: true });
    return false;
  }
};

exports.getListingImage = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  // noinspection JSCheckFunctionSignatures
  const data = await handleListingImageRequest(request.query);
  response.status(200).send(data);
});

exports.getListingDetail = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  // noinspection JSCheckFunctionSignatures
  const data = await handleListingDetailRequest(request.query);
  response.status(200).send(data);
});

exports.claimListingTxn = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
  } else {
    const status = await handleClaimListingTxnRequest(request.body);
    if (status) {
      response.status(200).send();
    } else {
      response.status(400).send();
    }
  }
});

exports.claimListing = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
  } else {
    const status = await handleClaimListingRequest(request.body);
    if (status) {
      response.status(200).send();
    } else {
      response.status(400).send();
    }
  }
});

exports.unlockListingTxn = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
  } else {
    const status = await handleUnlockListingTxnRequest(request.body);
    if (status) {
      response.status(200).send();
    } else {
      response.status(400).send();
    }
  }
});

exports.updateListingVisitCount = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
  } else {
    const status = await handleUpdateListingVisitCount(request.query);
    if (status) {
      response.status(200).send();
    } else {
      response.status(400).send();
    }
  }
});


