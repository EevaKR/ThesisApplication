import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import React from 'react';
import { styles } from '../styles/styles';

//TÄMÄ FILE OK UUSIMPAAN BRANCHIIN VERRATEN

type ModalOneProps = {
  visible: boolean;
  onClose: () => void;
}

export default function ModalOne({ visible, onClose }: ModalOneProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade' >
      <View style={styles.modalView}>
        <View style={styles.container}>
          <Text style={styles.text}> Siirry Asetukset-valikkoon ja muuta virransäästöasetuksia -- "Rajoittamaton" </Text>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Sulje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


