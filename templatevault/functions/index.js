const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions/logger");

// Example usage - create a simple HTTP function
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});