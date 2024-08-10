const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors"); // Include CORS
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for your deployed domain
app.use(
  cors({
    origin: "https:/creativecaptureph.com", // Replace with your frontend domain
    methods: ["GET", "POST"], // Allow only POST method
    allowedHeaders: ["Content-Type"],
  })
);

// POST endpoint to handle incoming email inquiries
const getPdfPath = (category) => {
  switch (category) {
    case "corporate":
      return "./public/BusinessCC.pdf";
    case "Portraits":
      return "./public/PortraitCC.pdf";
    default:
      return null; // Return null for unknown categories
  }
};

app.post("/send-email", async (req, res) => {
  // Extract email details from the request body
  const { senderEmail, name, category } = req.body;

  if (!category) {
    return res.status(400).send("Category is required");
  }

  try {
    // Configure Nodemailer with your email service provider's SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.ionos.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // This ensures TLS is used
        rejectUnauthorized: false,
      },
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log("SMTP Connection Error:", error);
      } else {
        console.log("SMTP Server is ready to take our messages");
      }
    });

    const pdfPath = getPdfPath(category);

    if (!pdfPath) {
      return res.status(400).send("Invalid category"); // Send 400 error for unknown categories
    }

    // Define email content
    const mailOptions = {
      from: "info@creativecaptureph.com",
      to: senderEmail,
      subject: "Automated Response with PDF Attachment",
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for your inquiry and interest in our services. We are delighted to assist you in finding the perfect package tailored to your needs.</p>
        <p>Attached, you will find our packages outlined in the PDF document. These packages encompass a range of options designed to suit various preferences and requirements.</p>
        <p>Should you have any questions or require further assistance, please feel free to reply directly to this email.</p>
        <p>Our dedicated team is here to accommodate your unique needs and ensure that your experience with us exceeds your expectations.</p>
        <p>We look forward to the opportunity to serve you and create memorable experiences together.</p>
        <p>Warm regards,</p>
        <p>Maria Duchesne</p>
        <p>Creative Capture</p>
      `,
      attachments: [
        {
          filename: "attachment.pdf",
          path: pdfPath,
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log("Email sent with PDF attachment");
    res.status(200).send("Email sent with PDF attachment");
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).send("Error sending email");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
