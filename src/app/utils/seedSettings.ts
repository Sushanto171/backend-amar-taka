import { settingsService } from "../modules/settings/settings.service";

export const seedSettings = async () => {
  try {
    const settings = await settingsService.getSysSettings();

    if (!settings) {
      const payload = {
        sysFund: 1000000000,
        deposit: {
          min: 5000,
          feePct: 2,
          sysPct: 25,
          agentPct: 75,
        },
        withdraw: {
          min: 0,
          feePct: 2,
          sysPct: 50,
          agentPct: 50,
        },
        sendMoney: {
          perThousandFee: 500,
          min: 20,
        },
        user: {
          welcomeBonus: 5000,
          dailyLimit: 2500000,
          monthlyLimit: 5000000,
        },
        agent: {
          initBal: 1000000,
          dailyLimit: 5000000,
          monthlyLimit: 20000000,
        },
      };
      await settingsService.sysSettingInit(payload);
      console.log("✍️ Settings init success");
    } else {
      console.log("🛠️ sysSettings already exist.");
    }
  } catch (error) {
    console.log("❌ Settings error:", error);
  }
};
