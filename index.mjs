import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Set your SES region here or use an environment variable in Lambda
const REGION = process.env.AWS_REGION || "us-east-1";

// Create SES client
const sesClient = new SESClient({ region: REGION });

export const handler = async (event) => {
  try {
    // You can pass these in the Lambda test event
    const toEmail = event?.toEmail || process.env.TO_EMAIL;
    const fromEmail = event?.fromEmail || process.env.FROM_EMAIL;
    const subject = event?.subject || "Test email from AWS Lambda + SES";
    const message =
      event?.message || "Hello! This is a test email sent from AWS Lambda using Amazon SES.";

    if (!toEmail || !fromEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing toEmail or fromEmail. Provide them in the event or environment variables."
        })
      };
    }

    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8"
        },
        Body: {
          Text: {
            Data: message,
            Charset: "UTF-8"
          }
        }
      }
    });

    const response = await sesClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email sent successfully",
        messageId: response.MessageId
      })
    };
  } catch (error) {
    console.error("SES send error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send email",
        error: error.message
      })
    };
  }
};
