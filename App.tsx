import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import React, { useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { } from './src/types';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation, NavigationProp } from '@react-navigation/native'
import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen';
import OptionsScreen from './screens/OptionsScreen';
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';

//HUOM!! TAUOTUKSEEN MYÖS FOREGROUNDLOCATION, EI PELKKÄÄ BACKGROUNDLOCATIONIA!!!!

//TEE TIEDOSTON TALLENNUS UUDELLEEN YKSINKERTAISEMMAKSI JA YHDISTÄ SE ZUSTANDIIN!!!

const Stack = createStackNavigator();
//splash screen puuttuu
//background taskit pitää olla app-sivulla
//yksinkertaista vielä filestoragen tallennusta
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
    //schedulePushNotification()
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

  //TODO: siirrä types-tiedostoon
  type RootStackParamList = {
    Home: undefined,
    Map: undefined,
    Options: undefined,
  }

  //const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'AJOPIIRTURI',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold'
            },
          }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Ajopiirturi',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen name="Options" component={OptionsScreen}
        options={{
            title: 'Asetukset',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer >
  );
}