import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import React from 'react';

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
      <View style={styles.view}>
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