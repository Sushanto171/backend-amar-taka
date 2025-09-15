import { ISettings } from "./settings.interfaces";
import { Settings } from "./settings.model";

const sysSettingInit = async (payload: ISettings) => {
  const settings = await Settings.create(payload);
  return settings;
};
const getSysSettings = async () => {
  const settings = await Settings.find();
  return settings;
};
const sysSettingsUpdate = async (id: string, payload: ISettings) => {
  const settings = await Settings.findByIdAndUpdate(id, payload);
  return settings;
};

export const settingsService = {
  sysSettingInit,
  getSysSettings,
  sysSettingsUpdate,
};
