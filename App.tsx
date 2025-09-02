import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { Button } from 'react-native-paper';
import { ScrollView } from 'react-native';
import React, { useRef } from 'react';
import * as Notifications from 'expo-notifications'
import * as FileSystem from 'expo-file-system';
import Notification, { schedulePushNotification } from './notifications';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { LocationWithTimestamp, PermissionsButtonProps } from './types';
import ModalOne from './ModalOne';


//eli viimeisenä, poista debug-data ja muokkaa simppeli expo-file-system
//versio paikkatiedon tallennuksesta.
//VARAA TÄLLE 2VIIKKOA!!!!

//ei toimi buildattu versio
//tee production ympäristöön oma eas:create secret google maps api keysta 
//build ei toimi koska .gitignore == easignore
//siirrä avain eri paikkaan ja app.json pois .gitignoresta
//MAANANTAI: 
//sit aloita testaaminen, piirtääkö luotettavasti reittiä




//VIKA VIIKKO

//huomioi että nyt api-avain app.jsonissa ja app.json .gitignoressa 
// --> tallenna joko eas.secretiin tai käytä env-muuttujia
//JAA KOODI OSIIN SITTEN KUN TOIMII LOPULTA
//SIIVOA YLIMÄÄRÄISET DEBUGGAUKSET JA 
//EXPO_FILE_SYSTEM TALLENNUKSET POIS
//hoxxx google maps voi vaatia modausta tuonne android kansioon
//--> kts vanhoista matskuista mallia
//--> ei siis välttis suostu buildaan tai ei toimi oikein
//splash screen puuttuu
//jaa eri sivuihin toiminnot mm importaa permission button, 
//background taskit pitää olla app-sivulla
//kuvien lähteet oppariin
//poista debuggaustiedot lopuksi
//yksinkertaista vielä filestoragen tallennusta
//ja testaa sen jälkeen toimiiko
//tarkasta että kuvien numerointi pitää myös tekstissä paikkansa
const LOCATIONS_FILE = FileSystem.documentDirectory + 'background_locations.json';
const DEBUG_LOG_FILE = FileSystem.documentDirectory + 'debug_logs.json';
const ERROR_LOG_FILE = FileSystem.documentDirectory + 'error_logs.json';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  })
})

//Expo tuki: (huono ohje)
//Yksi tapa lähestyä tätä ongelmaa voisi olla lähettää push-ilmoitus, 
//jos sovelluksesi odottaa taustasijainnin seurantaa, mutta sitä ei ole tapahtunut hetkeen. 
// Tällöin käyttäjä voi halutessaan reagoida ilmoitukseen ja kytkeä seurannan takaisin päälle.
//timestamp logiin, näkee toimiiko background location


//Muista katsoa tarviiko android manifestiin tehdä jotain paikannuslupia

//ajastettu do nothing background task , TESTAA TOIMIIKO ILMAN TÄTÄ!!!!!!
TaskManager.defineTask('DO_NOTHING_TASK', async () => {
  console.log('DO_NOTHING_TASK executed at', new Date().toISOString());
  console.log('Taustatehtävä suoritettu!');
  //TÄSTÄ PUUTTUU AJASTUS --> ei voi laittaa ajastusta, deprecated
  return;
});

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
        receivedAt: new Date().toISOString(),
        backgroundTask: true
      }));
      //Saving
      const updatedLocations = [...existingLocations, ...newLocations];
      await FileSystem.writeAsStringAsync(LOCATIONS_FILE, JSON.stringify(updatedLocations, null, 2));

      console.log(`Saved ${newLocations.length} new locations. Total: ${updatedLocations.length}`);

      //debug logging
      await logDebugInfo(`Background task: saved ${newLocations.length} locations.`);
    } catch (storageError) {
      console.error("Failed to save locations: ", storageError);
      await logDebugInfo("Failed to save locations, ", storageError);
    }
  }
});

//debug-data
const logDebugInfo = async (message: string, data?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    data
  }
  console.log(`[DEBUG] ${message}`, data)

  try {
    let existingLogs = [];
    const fileExists = await FileSystem.getInfoAsync(DEBUG_LOG_FILE);
    if (fileExists.exists) {
      const fileContent = await FileSystem.readAsStringAsync(DEBUG_LOG_FILE);
      existingLogs = JSON.parse(fileContent);
    }
    existingLogs.push(logEntry);

    //last 100 logs, tarviiko rajata???
    if (existingLogs.length > 100) {
      existingLogs = existingLogs.slice(-100);
    }
    await FileSystem.writeAsStringAsync(DEBUG_LOG_FILE, JSON.stringify(existingLogs, null, 2));
  } catch (error) {
    console.error("Failed to save debuglog: ", error);
  }
};


//avaa mitä tämä tekee
let setLocationInfo: ((location: Location.LocationObject) => void) | null = null;


//TÄMÄ PITÄISI OLLA ERI PAIKASSA
const PermissionsButton = ({ setLocations, locations }: PermissionsButtonProps) => {
  //const [location, setLocation] = useState<Location.LocationObject |null>(null);
  //const [locations, setLocations] = useState<Location.LocationObject[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const scrollViewRef = useRef<ScrollView>(null);

  const loadLocationsFromFile = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
      if (fileExists.exists) {
        const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE);
        const parsedLocations = JSON.parse(fileContent);
        setLocations(parsedLocations);
        console.log(`Loaded ${parsedLocations.length} locations from file`)
      } else {
        console.log("No locations file found");
        setLocations([]);
      }
    } catch (error) {
      console.error("Failed to load locations: ", error);
      await logDebugInfo("Failed to load locations from file ", error)
    }
  };

  // Loading locations
  useEffect(() => {
    loadLocationsFromFile();

    // Checking new locations
    const interval = setInterval(loadLocationsFromFile, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLocationInfo = (newLocation: Location.LocationObject) => {
      setLocations((prev) => [...prev, newLocation]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    // Note: TaskManager tasks are automatically registered when defined
    // The DO_NOTHING_TASK will run based on system scheduling, not a scheduled time
    console.log("DO_NOTHING_TASK is defined and ready");

  }, [])

  const requestPermissions = async () => {
    try {
      await logDebugInfo("Starting permission request");

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      console.log("Foreground permission: ", foregroundStatus)
      await logDebugInfo("Foreground permission result", foregroundStatus);

      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        console.log("Background permissions: ", backgroundStatus)
        await logDebugInfo("Background permission result", backgroundStatus);

        if (backgroundStatus === 'granted') {
          // Check if already running
          const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION);
          await logDebugInfo("Task registration status", isRegistered);

          if (isRegistered) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION);
            await logDebugInfo("Stopped existing location tracking");
          }

          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION, {
            accuracy: Location.Accuracy.Highest,
            //tämä uusi, testaa toimiiko!!!
            foregroundService: {
              notificationTitle: 'Sijainnin seuranta',
              notificationBody: 'Sovellus seuraa sijaintiasi taustalla.',
            },

            activityType: Location.LocationActivityType.Fitness,
            timeInterval: 10000,
            deferredUpdatesInterval: 10000,
            showsBackgroundLocationIndicator: true, // iOS only
          });

          await logDebugInfo("Background location tracking started");
          console.log("Debuggausta, taustalla tapahtuva paikannus aloitettu")

          // Send confirmation notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Location Tracking Started",
              body: "Background location tracking is now active",
            },
            trigger: null,
          });
        }
      }
    } catch (error) {
      console.error("Permission request failed:", error);
      await logDebugInfo("Permission request failed", error);
    }
  }

  const showDebugInfo = async () => {
    try {
      let info = "=== DEBUG INFO ===\n";

      // Check file existence and sizes
      const locationsFileInfo = await FileSystem.getInfoAsync(LOCATIONS_FILE);
      const debugFileInfo = await FileSystem.getInfoAsync(DEBUG_LOG_FILE);
      const errorFileInfo = await FileSystem.getInfoAsync(ERROR_LOG_FILE);

      info += `Locations file: ${locationsFileInfo.exists ? 'EXISTS' : 'NOT FOUND'}\n`;
      if (locationsFileInfo.exists) {
        info += `Size: ${Math.round(locationsFileInfo.size / 1024)}KB\n`;
      }

      info += `Debug log file: ${debugFileInfo.exists ? 'EXISTS' : 'NOT FOUND'}\n`;
      info += `Error log file: ${errorFileInfo.exists ? 'EXISTS' : 'NOT FOUND'}\n\n`;

      // Show recent debug logs
      if (debugFileInfo.exists) {
        const debugContent = await FileSystem.readAsStringAsync(DEBUG_LOG_FILE);
        const logs = JSON.parse(debugContent);
        info += `Recent logs (${logs.length}):\n`;
        logs.slice(-5).forEach((log: any) => {
          info += `${log.timestamp}: ${log.message}\n`;
        });
      }

      // Show errors if any
      if (errorFileInfo.exists) {
        const errorContent = await FileSystem.readAsStringAsync(ERROR_LOG_FILE);
        const errorData = JSON.parse(errorContent);
        info += `\nLast error: ${errorData.error} at ${errorData.timestamp}\n`;
      }

      // Check task registration status
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION);
      info += `\nBackground task registered: ${isRegistered}`;

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo(`Failed to load debug info: ${error}`);
    }
  };

  const clearLocationData = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
      if (fileExists.exists) {
        await FileSystem.deleteAsync(LOCATIONS_FILE);
        await logDebugInfo("Cleared all location data");
        setLocations([]);
      }
    } catch (error) {
      console.error("Failed to clear location data:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Button style={styles.button} onPress={requestPermissions} >ALOITA PAIKANNUSTIETOJEN KERÄÄMINEN</Button>
      <View style={styles.debugButtonsContainer}>
        <Button style={styles.debugButton} onPress={showDebugInfo}>NÄYTÄ DEBUG INFO</Button>
        <Button style={styles.debugButton} onPress={clearLocationData}>TYHJENNÄ DATA</Button>
      </View>
      {debugInfo ? (
        <ScrollView style={styles.debugContainer}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </ScrollView>
      ) : null}
      <ScrollView
        style={styles.scrollContainer}
        ref={scrollViewRef}
      >
        {locations.length > 0 ? (
          locations.map((loc: LocationWithTimestamp, index: number) => (
            <Text key={index} style={styles.locationText}>
              {index + 1}. Leveysaste: {loc.coords.latitude}, Pituusaste: {loc.coords.longitude}
              {loc.receivedAt ? ` (${new Date(loc.receivedAt).toLocaleTimeString()})` : ''}
            </Text>
          ))
        ) : (
          <Text>Ei sijaintitietoja vielä</Text>
        )}
      </ScrollView>
    </View>
  )
}



export default function App() {
  const [locations, setLocations] = useState<LocationWithTimestamp[]>([]);
  const [modalVisible, setModalVisible] = useState(true);

  //määritellään karttaan kartan aloituspiste
  const initialRegion = {
    latitude: 65,
    longitude: 26,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };



 //TEE TÄHÄN USE_EFFECT JOTTA NÄYTTÄÄ MODALIN VAIN KERRAN



  return (
    <View style={styles.container}>
      <Text style={styles.text}>AJOPIIRTURI</Text>
      <ModalOne visible={modalVisible} onClose={() => setModalVisible(false)}></ModalOne>
      <PermissionsButton setLocations={setLocations} locations={locations}></PermissionsButton>
      <MapView
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Polyline
          coordinates={locations.map(loc => ({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          }))}
          strokeColor="#FF0000"
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
}

//Blue #043bb1
//Blue Grotto #1e8ad3
//Navy Blue #1d3537
const styles = StyleSheet.create({
  text: {
    fontFamily: 'sans-serif-light',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    fontSize: 18,
    textAlign: 'center',

  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  },
  button: {
    backgroundColor: '#10bc10',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'sans-serif-light',
    flexDirection: 'row',
    marginTop: 0,
    gap: 10,
  },
  debugButtonsContainer: {

  },
  debugButton: {
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  debugContainer: {
    marginTop: 10,
    width: '90%',
    maxHeight: '30%',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  scrollContainer:
  {
    marginTop: 20,
    width: '90%',
    maxHeight: '60%',
  },
  locationText: {
    marginBottom: 5,
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: '50%'
  }
});
