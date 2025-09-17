import { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { Button } from 'react-native-paper';
import { ScrollView } from 'react-native';
import React, { useRef } from 'react';
import * as Notifications from 'expo-notifications'
import * as FileSystem from 'expo-file-system';
import  { schedulePushNotification } from './notifications';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import {  } from './types';
import ModalOne from './ModalOne';
import { styles } from './styles';
import { createStackNavigator } from '@react-navigation/stack';
import {NavigationContainer } from '@react-navigation/native'
import HomeScreen from './HomeScreen'
import MapScreen from './MapScreen';
import OptionsScreen from './OptionsScreen';
//HUOM!! TAUOTUKSEEN MYÖS FOREGROUNDLOCATION, EI PELKKÄÄ BACKGROUNDLOCATIONIA!!!!

//TEE TIEDOSTON TALLENNUS UUDELLEEN YKSINKERTAISEMMAKSI JA YHDISTÄ SE ZUSTANDIIN!!!


//YLÄPALKKIIN/ALAPALKKIIN RATTAAN KUVA JOSTA OHJAA OPTIONS-SIVULLE!

const Stack = createStackNavigator();
//KORJAA
//huomioi että nyt api-avain app.jsonissa ja app.json .gitignoressa 
// --> tallenna joko eas.secretiin tai käytä env-muuttujia
//JAA KOODI OSIIN SITTEN KUN TOIMII LOPULTA
//SIIVOA YLIMÄÄRÄISET DEBUGGAUKSET POIS!!!
//splash screen puuttuu
//jaa eri sivuihin toiminnot mm importaa permission button, 
//background taskit pitää olla app-sivulla
//yksinkertaista vielä filestoragen tallennusta
//ja testaa sen jälkeen toimiiko
const LOCATIONS_FILE = FileSystem.documentDirectory + 'background_locations.json';
const ERROR_LOG_FILE = FileSystem.documentDirectory + 'error_logs.json';

//määritellään background task
const BACKGROUND_LOCATION = 'background-location-task';
//callback-funktio, joka suoritetaan, kun sijaintitietoja saapuu taustalla. Se on nimetty BACKGROUND_LOCATION, ja se käsittelee data-objektin, joka sisältää sijainnit.
//TaskManager.defineTask rekisteröi tehtävän, joka aktivoituu kun Location.startLocationUpdatesAsync saa uusia sijaintipäivityksiä.
//Funktio tarkistaa, onko tullut virhe (error) tai dataa (data).
//Jos dataa on, se tulostaa sijainnit konsoliin.
TaskManager.defineTask(BACKGROUND_LOCATION, async ({ data, error }) => {
  if (error) {
    console.error("Location task error: ", error.message);
    // Saving error to file
    try {
      const errorData = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
      //sijainti tallentuu
      await FileSystem.writeAsStringAsync(ERROR_LOG_FILE, JSON.stringify(errorData));

    } catch (fileError) {
      console.error("Failed to save error to file: ", fileError);
    }

    return;
  }
  if (data) {
    //tallentaa locations-taulukon jossa alkiot Location.LocationObject
    const { locations } = data as { locations: Location.LocationObject[] };
    //notification send to user
    schedulePushNotification()
    console.log("Received background locations: ", locations);

    try {
      //reading existing locations
      let existingLocations = [];
      const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
      if (fileExists.exists) {
        const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE)
        existingLocations = JSON.parse(fileContent)
      }
      //Adding new locations with timestamps
      const newLocations = locations.map(loc => ({
        ...loc,
        //receivedAt: new Date().toISOString(),
        //backgroundTask: true
      }));
      //Tallentaa puhelimen muistiin, tallennus säilyy niin kauan kunnes käyttäjä poistaa sen
      const updatedLocations = [...existingLocations, ...newLocations];
      await FileSystem.writeAsStringAsync(LOCATIONS_FILE, JSON.stringify(updatedLocations, null, 2));

      console.log(`Saved ${newLocations.length} new locations. Total: ${updatedLocations.length}`);
    } catch (storageError) {
      console.error("Failed to save locations: ", storageError);
    }
  }
});



export default function App() {

    return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" component={HomeScreen}
          options={{
            title: 'AJOPIIRTURI',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold'
            }
          }} />
          <Stack.Screen name= "Map" component={MapScreen}
          ></Stack.Screen>
          <Stack.Screen name= "Options" component={OptionsScreen}
          ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}