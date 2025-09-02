// Reexport the native module. On web, it will be resolved to ExpoNativeConfigurationModule.web.ts
// and on native platforms to ExpoNativeConfigurationModule.ts
export { default } from './ExpoNativeConfigurationModule';
export { default as ExpoNativeConfigurationView } from './ExpoNativeConfigurationView';
export * from  './ExpoNativeConfiguration.types';
