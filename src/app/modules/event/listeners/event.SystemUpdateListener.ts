/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventBus } from "../eventBus";

eventBus.on("trigger", (payload: any) => {
  console.log(payload);
  console.log("Root route triggered");
});
