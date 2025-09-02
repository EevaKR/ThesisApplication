import * as React from 'react';

import { ExpoNativeConfigurationViewProps } from './ExpoNativeConfiguration.types';

export default function ExpoNativeConfigurationView(props: ExpoNativeConfigurationViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
