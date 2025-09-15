import { ISettings, ISystemConfig } from "./settings.interfaces";
import { Settings } from "./settings.model";

export let systemConfig: ISystemConfig;

const sysSettingInit = async (payload: ISettings) => {
  const settings = await Settings.create(payload);
  return settings;
};

const getSysSettings = async () => {
  const settings = await Settings.find();
  systemConfig = settings[0].toObject();

  return settings[0];
};

const sysSettingsUpdate = async (id: string, payload: ISettings) => {
  const settings = await Settings.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  systemConfig = settings?.toObject();
  return settings;
};

export const settingsService = {
  sysSettingInit,
  getSysSettings,
  sysSettingsUpdate,
};
