import { eventBus } from "../eventBus";
import { commissionService } from "./commission.listener";

eventBus.on("commission", async (payload) => {
  await commissionService.createCommission(payload);
});
