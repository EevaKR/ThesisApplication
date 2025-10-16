import { View, Text, StyleSheet, Modal, Alert, TouchableOpacity } from 'react-native'
import React from 'react';
import { styles } from '../styles/styles';
import * as IntentLauncher from 'expo-intent-launcher'



type ModalOneProps = {
  visible: boolean;
  onClose: () => void;
}


//TODO: muokkaa et näkyy ensimmäisellä käynnistyskerralla, kts malli iisifoto
export default function ModalOne({ visible, onClose }: ModalOneProps) {
  //tästä voi tehdä natiiviversion joka menee suoraan virransäästöasetuksiin
  const openSettings = () => {
    IntentLauncher.startActivityAsync(
      'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
    ).catch(() => {
      Alert.alert('Virhe', 'Asetusten avaaminen epäonnistui.')
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade' >
      <View style={styles.modalView}>
        <View style={styles.container}>
          <Text style={styles.text}> Jotta taustapaikannus toimisi, siirry Asetukset-valikkoon ja muuta virransäästöasetuksia -- "Rajoittamaton" </Text>
          <TouchableOpacity onPress={openSettings} style={styles.button}>
            <Text style={styles.buttonText}>Virransäästövalikko</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Sulje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


