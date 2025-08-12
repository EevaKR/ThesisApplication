import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';


const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        // Error occurred - check `error.message` for more details.
        return;
    }
    if (data) {
        const { locations } = data;
        // do something with the locations captured in the background
    }
});

const requestPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.Balanced,
            });
        }
    }
};

const PermissionsButton = () => (
    <View style={styles.container} >
        <Button style={styles.button} onPress={requestPermissions} title="ALOITA PAIKANNUSTIETOJEN KERÄÄMINEN" />
    </View>
);



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },

    buttonText: {
        color: 'white', 
        textAlign: 'center',
        fontSize: 16,
    }

});

export default PermissionsButton;