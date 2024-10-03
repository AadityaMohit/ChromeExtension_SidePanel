const functions = require("firebase-functions");

exports.test = functions.https.onCall(async () => {
  try {
    console.log("Received data:");
    return {message: "Function executed successfully!"};
  } catch (error) {
    console.error("Error in cloud function: ", error);
    throw new functions.https.HttpsError("internal", "Error");
  }
});
