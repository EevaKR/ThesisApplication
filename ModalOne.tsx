//this is a modal what user can see when he/she opens the application
//säädä tähän modaliin näkyvyys niin ettei se aina näy

import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import React from 'react';
import ExpoNativeConfigurationModule from './expo-native-configuration/src/ExpoNativeConfigurationModule';
import ExpoNativeConfigurationView from './expo-native-configuration/src/ExpoNativeConfigurationView.web';
import ExpoNativeConfigurationModuleWeb from './expo-native-configuration/src/ExpoNativeConfigurationModule.web';
import { requireNativeModule } from 'expo-modules-core'


type ModalOneProps = {
  visible: boolean;
  onClose: () => void;
}

export default function ModalOne({ visible, onClose }: ModalOneProps) {

  const ExpoNativeConfiguration = requireNativeModule('ExpoNativeConfiguration');

  const handleOpenBatterySettings = () => {
    try {
      ExpoNativeConfiguration.openBatterySettings();
    } catch (error) {
      console.warn('Error while trying to open the settings: ', error);
    }

  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade' >
      <View style={styles.view}>
        <View style={styles.container}>
          <Text style={styles.text}> Siirry Asetukset-valikkoon ja muuta virransäästöasetuksia -- "Rajoittamaton" </Text>
          <TouchableOpacity onPress={handleOpenBatterySettings} style={styles.button}>
            <Text style={styles.buttonText}> Avaa virransäästöasetukset </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Sulje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


//sit tee modal joka pakottaa käyttäjän antamaan luvan taustatoimintoihin
//ja akun kulutukseen (kaksi eri vaihtoehtoa)
//Pyytää akun optimoinnin ohittamista:


const styles = StyleSheet.create({
  container: {

    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '80%',
    alignItems: 'center',

  },
  buttonText: {

    color: '#fff',
    fontWeight: 'bold',

  },
  view: {

    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'

  },
  text: {

    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',

  },
  button: {

    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,

  }
});