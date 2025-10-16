import { View, Text, StyleSheet, Modal, Alert, TouchableOpacity } from 'react-native'
import React from 'react';
import { styles } from '../styles/styles';
import * as IntentLauncher from 'expo-intent-launcher'

type ModalOneProps = {
  visible: boolean;
  onClose: () => void;
}

export default function ModalTwo({ visible, onClose }: ModalOneProps) {

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade' >
      <View style={styles.modalView}>
        <View style={styles.container}>
          <Text style={styles.text}> Taukotila asetettu. Lähde liikkeelle, niin paikannustoiminto jatkuu. </Text>
    
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Sulje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


