const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const validator = require('validator');

// Get Firestore
const db = getFirestore();

exports.signupEmail = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
  } else {
    const { email } = request.body;
    const valid = validator.isEmail(email); // true
    if (valid) {
      const ref = db.collection('signup').doc(email);
      const data = {
        email,
      };
      await ref.set({ data });
      response.status(200).send();
    } else {
      response.status(400).send();
    }
  }
});
