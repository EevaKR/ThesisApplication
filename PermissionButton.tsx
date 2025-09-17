import { useEffect } from "react";
import { styles } from './styles';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationStore } from "./store";


//TODO: lopeta-buttonin teko
const LOCATIONS_FILE = FileSystem.documentDirectory + 'background_locations.json';
const BACKGROUND_LOCATION = 'background-location-task';

const PermissionButton = () => {
  const {
    locations,
    setLocations,
    addLocation,
  } = useLocationStore();

  // Loads locations from file when uses component at the first time
  const loadLocationsFromFile = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
      if (fileExists.exists) {
        const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE);
        const parsedLocations = JSON.parse(fileContent);
        
        // Changes file format to store format
        const storeLocations = parsedLocations.map((loc: any) => ({
          ...loc,
          timestamp: new Date(loc.receivedAt).getTime()
        }));
        
        setLocations(storeLocations);
        console.log(`Loaded ${storeLocations.length} locations from file`)
      } else {
        console.log("No locations file found");
        setLocations([]);
      }
    } catch (error) {
      console.error("Failed to load locations: ", error);
    }
  };

  // Loading locations 
  useEffect(() => {
    loadLocationsFromFile();
  }, []);

  const setLocationInfo = (newLocation: Location.LocationObject) => {
    setLocations(prev => [...prev, newLocation])
  };

  const requestPermissions = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      console.log("Foreground permission: ", foregroundStatus)

      if (foregroundStatus === 'granted') {

        //aloitetaan foregroundLocation-paikannus
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 5
          },
          (location) => {
            addLocation(location); //tallennetaan paikkatieto storeen 
          }
        )
        //haetaan background locationille myös lupa
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        console.log("Background permissions: ", backgroundStatus)

        if (backgroundStatus === 'granted') {
          // checks if the background task is already running at the background
          const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION);

          if (isRegistered) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION);
          }
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION, {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 5, //sijainnin täytyy muuttua yli 5m ennen kuin päivittää sijaintitiedon
            foregroundService: {
              //ei tarvii tehdä notifikaatiota erikseen, tämä riittää
              notificationTitle: 'Sijainnin seuranta',
              notificationBody: 'Sovellus seuraa sijaintiasi taustalla.',
            },
            activityType: Location.LocationActivityType.Fitness,
            timeInterval: 10000, //10 sekunnin päivitysväli
            deferredUpdatesInterval: 10000, //akkua säästävä päivitystoiminto joka asettaa päivityksen tuleen vain 10 s välein
          });
          console.log("Debuggausta, taustalla tapahtuva paikannus aloitettu")
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
    }
  };
  //clears location data
  const clearLocationData = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
      if (fileExists.exists) {
        await FileSystem.deleteAsync(LOCATIONS_FILE);
        setLocations([]);
      }
    } catch (error) {
      console.error("Failed to clear location data:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.topButtonContainer, { zIndex: 1000, elevation: 1000 }]}>
          <Pressable style={({ pressed }) => [styles.topButton, pressed &&
            { opacity: 0.7 }]} onPress={requestPermissions}>

            <Text style={styles.buttonText}> <Ionicons name="location-sharp" size={20}></Ionicons> ALOITA PAIKANNUS </Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.topButton, pressed &&
            { opacity: 0.7 }]} onPress={clearLocationData}>

            <Text style={styles.buttonText}> <Ionicons name="close-circle-outline" size={20}></Ionicons> TYHJENNÄ TIEDOT </Text>
          </Pressable>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          scrollEventThrottle={16}
        >
          {locations.length > 0 ? (
            locations.map((loc: Location.LocationObject, index: number) => (
              <Text key={index} style={styles.locationText}>
                {index + 1}. Leveysaste: {loc.coords.latitude}, Pituusaste: {loc.coords.longitude}
                {loc.timestamp ? ` (${new Date(loc.timestamp).toLocaleTimeString()})` : ''}
              </Text>
            ))
          ) : (
            <Text>Ei sijaintitietoja vielä</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PermissionButton;