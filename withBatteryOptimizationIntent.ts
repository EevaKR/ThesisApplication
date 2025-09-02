import {
  ConfigPlugin,
  withMainApplication,
} from '@expo/config-plugins';

const withBatteryOptimizationIntent: ConfigPlugin = config => {
  return withMainApplication(config, config => {
    const intentCode = `
      Intent intent = new Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(intent);
    `;

    if (!config.modResults.contents.includes(intentCode)) {
      config.modResults.contents = config.modResults.contents.replace(
        'super.onCreate();',
        `super.onCreate();\n${intentCode}`
      );
    }

    return config;
  });
};

export default withBatteryOptimizationIntent;
