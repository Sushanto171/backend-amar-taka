import { ICommission } from "../agent/commission/commission.interface";
import { ICreateAudit } from "../auditLogs/auditLogs.service";


export interface IEvents {
  commission: ICommission;
  log: ICreateAudit;
}
