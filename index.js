const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Nodemailer setup using Firebase environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass,
  },
});

exports.submitForm = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const formData = req.body;

      // Save form data to Firestore
      await db.collection('treeRequests').add(formData);

      // Email notification
      const mailOptions = {
        from: functions.config().email.user,
        to: 'khadra.database@gmail.com', // Replace with your recipient email
        subject: 'New Tree Planting Request',
        text: `A new tree planting request from ${formData.name}. Details: ${JSON.stringify(formData)}`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send('Request submitted and email sent!');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error saving request or sending email: ' + error.message);
    }
  });
});
