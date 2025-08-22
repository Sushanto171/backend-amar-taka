import { sendMessage } from "../../../config/twilio.config";
import { eventBus } from "../eventBus";

eventBus.on("sendSms", async (payload) => {
  console.log(payload);
  await sendMessage("+8801791407583", payload.message as string);
});
