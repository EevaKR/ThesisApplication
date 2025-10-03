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


LISÄÄ: 


import * as IntentLauncher from 'expo-intent-launcher';

IntentLauncher.startActivityAsync(
  'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
);
