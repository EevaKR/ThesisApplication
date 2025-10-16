#############

tarvittaessa voi lisätä app.config.js plugin:
[
                "expo-location",
                {
                    isAndroidBackgroundLocationEnabled: true,
                    isIosBackgroundLocationEnabled: true,
                }
            ]



TODO:


*** Asetukset, tauko-ominaisuus, onko yhdistetty????

LISÄÄ: 


import * as IntentLauncher from 'expo-intent-launcher';

IntentLauncher.startActivityAsync(
  'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
);


Suojautuaksesi akun tyhjenemiseltä, aseta kohtuullinen aikakatkaisu, kun sijainti päivittyy pitäisi lopettaa. Aikakatkaisu varmistaa, että päivitykset eivät jatku loputtomiin, ja Se suojaa sovellusta tilanteissa, joissa päivityksiä pyydetään, mutta niitä ei poisteta (esimerkiksi koodivirheen vuoksi).


import * as Updates from 'expo-updates';

export interface UpdateInfo {
  isAvailable: boolean;
  manifest?: Updates.Manifest;
}

/**
 * Check if a new update is available
 */
export const checkForUpdates = async (): Promise<UpdateInfo> => {
  try {
    const update = await Updates.checkForUpdateAsync();
    return {
      isAvailable: update.isAvailable,
      manifest: update.manifest
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    throw error;
  }
};

/**
 * Download and install available update
 */
export const downloadAndInstallUpdate = async (): Promise<void> => {
  try {
    const update = await Updates.fetchUpdateAsync();
    if (update.isNew) {
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('Error downloading update:', error);
    throw error;
  }
};

/**
 * Get current update information
 */
export const getCurrentUpdateInfo = () => {
  return {
    updateId: Updates.updateId,
    runtimeVersion: Updates.runtimeVersion,
    channel: Updates.channel,
    isEmergencyLaunch: Updates.isEmergencyLaunch,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  };
};


