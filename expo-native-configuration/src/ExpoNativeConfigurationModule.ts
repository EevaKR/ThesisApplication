import { NativeModule, requireNativeModule } from 'expo';

import { ExpoNativeConfigurationModuleEvents } from './ExpoNativeConfiguration.types';

declare class ExpoNativeConfigurationModule extends NativeModule<ExpoNativeConfigurationModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoNativeConfigurationModule>('ExpoNativeConfiguration');
