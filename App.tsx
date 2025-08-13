import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { Button } from 'react-native';
import PermissionsButton from './PermissionButton';




//yläpalkkiin "seurataan sijaintia" --> pysyy paremmin hengissä
//eli status bariin notifikaatio
//background job ajastetusti 30 sekunnin välein, mikä ei tee mitään
//miten background jobin ajastus tehdään
//lisää location 1 min välein päivitys TAI niin et kun sijainti muuttuu tarpeeksi


const BACKGROUND_LOCATION = 'BACKGROUND_LOCATION'

const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};



TaskManager.defineTask(BACKGROUND_LOCATION, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    // do something with the locations captured in the background --> save
  }
});






//locations = taulukko sijaintiobjekteja
//Kun käytät expo-location-moduulin taustapaikannusta, Expo automaattisesti lähettää sijaintipäivitykset taustatehtävälle. Nämä päivitykset tulevat data.locations-kenttään, joka on taulukko sijaintiobjekteja (LocationObject[]).
/*TaskManager.defineTask(BACKGROUND_LOCATION, async ({ data, error }) => {
 if (error) {
   console.error('Failed', error) 
   return;
 }
if (data) {
 const {locations} = data as { locations: Location.LocationObject[]};
 console.log('Received new locations', locations);
 }
}); */

//määritellään taustatehtävä, defining background task
//Kun haluat käyttää taustapaikannusta, sinun täytyy ensin määritellä tehtävä TaskManager.defineTask-metodilla sovelluksen ylimmällä tasolla – eli ei komponentin sisällä, vaan esimerkiksi tiedoston alussa.
/*TaskManager.defineTask(BACKGROUND_LOCATION, async () => {
  try {
    const now = Date.now();
    console.log(`Location ..., now time as a example: ${new Date(now).toISOString()}`);
  } catch (error) {
    console.error('Failed', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
  return BackgroundTask.BackgroundTaskResult.Success;
}) */
/*
 */ 


export default function App() {



  /*await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION, {
    accuracy: Location.Accuracy.Balanced,
  }) */ 



  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>text</Text>
      <PermissionsButton></PermissionsButton>
      
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  }
});
