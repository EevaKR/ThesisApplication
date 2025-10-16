import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import React, { useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { } from './src/types';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation, NavigationProp } from '@react-navigation/native'
import { useLocationStore } from './store/store';
import { useAuthStore } from './store/authStore';
import MainStack from './MainStack';
import AuthStack from './AuthStack';
import * as Updates from 'expo-updates'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font';
import { useEffect, useCallback, useState } from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

// Custom theme with your color scheme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#37609d',           // Napit
    onPrimary: '#d9e4ec',         // Nappi-teksti
    surfaceVariant: '#b7cfdc',    // Pressed-tila
  },
};
//TODO: splash screen puuttuu
//background taskit pitää olla app-sivulla
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
    //tallentaa storeen
    try {
      //reading existing locations
      let existingLocations = [];
      const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
      if (fileExists.exists) {
        const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE)
        existingLocations = JSON.parse(fileContent)
      }
      //Adding new locations with timestamps 
      /*
      const newLocations = locations.map(loc => ({
        ...loc,
        //receivedAt: new Date().toISOString(),
        //backgroundTask: true
      })); 
*/
      //Tallentaa puhelimen muistiin, tallennus säilyy niin kauan kunnes käyttäjä poistaa sen
      const updatedLocations = [...existingLocations, ...locations];
      await FileSystem.writeAsStringAsync(
        LOCATIONS_FILE,
        JSON.stringify(updatedLocations, null, 2)
      );
      console.log(`Saved ${locations.length} new locations. Total: ${updatedLocations.length}`);
    } catch (storageError) {
      console.error("Failed to save locations: ", storageError);
    }
  }
}
);




export default function App() {

  const [fontsLoaded] = useFonts({
    Oswald: require('./assets/fonts/Oswald-VariableFont_wght.ttf'),
  });

  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const makeAppReady = async () => {
      if (fontsLoaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Error hiding splash screen:', error);
        } finally {
          // Always set app as ready even if hiding splash fails
          setAppReady(true);
        }
      }
    };
    makeAppReady();
  }, [fontsLoaded]);

  // Fallback timeout to prevent infinite splash screen
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!appReady) {
        console.warn('Splash screen timeout - forcing app to show');
        setAppReady(true);
        SplashScreen.hideAsync().catch(err => console.warn('Splash hide error:', err));
      }
    }, 3000); // 3 second fallback

    return () => clearTimeout(timeout);
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  console.log('Is signed in: ', isSignedIn)
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {isSignedIn ? <MainStack /> : <AuthStack />}
      </NavigationContainer >
    </PaperProvider>
  );
}
