import { registerWebModule, NativeModule } from 'expo';

import { ExpoNativeConfigurationModuleEvents } from './ExpoNativeConfiguration.types';

class ExpoNativeConfigurationModule extends NativeModule<ExpoNativeConfigurationModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoNativeConfigurationModule, 'ExpoNativeConfigurationModule');
