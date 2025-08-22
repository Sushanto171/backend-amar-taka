import twilio from "twilio";
import { envVars } from "./env.config";

export const twilioClient = twilio(
  envVars.TWILIO.ACCOUNT_SID,
  envVars.TWILIO.AUTH_TOKEN
);

export const sendMessage = async (phone: string, body: string) => {
  await twilioClient.messages.create(
    {
      to: phone,
      from: envVars.TWILIO.TWILIO_PHONE_NUMBER,
      body,
    },
    (error) => {
      if (error) {
        console.log("Send message error:", error);
      }
      // console.log({ item });
    }
  );
};
