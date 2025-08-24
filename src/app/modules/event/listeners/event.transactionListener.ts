import { transactionService } from "../../transaction/transaction.service";
import { eventBus } from "../eventBus";

eventBus.on("transaction", async (payload) => {
  const { req, ...transPayload } = payload;
  await transactionService.createTransaction(req, transPayload);
});
