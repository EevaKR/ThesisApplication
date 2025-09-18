// useLocationActions.ts
import { useEffect } from "react";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { useLocationStore } from "../../store/store";

const LOCATIONS_FILE = FileSystem.documentDirectory + 'background_locations.json';
const BACKGROUND_LOCATION = 'background-location-task';

export const useLocationActions = () => {
  const {
    locations,
    setLocations,
    addLocation,
    startTracking,
    stopTracking
  } = useLocationStore();

  useEffect(() => {
    const loadLocationsFromFile = async () => {
      try {
        const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
        if (fileExists.exists) {
          const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE);
          const parsedLocations = JSON.parse(fileContent);
          const storeLocations = parsedLocations.map((loc: any) => ({
            ...loc,
            timestamp: new Date(loc.receivedAt).getTime()
          }));
          setLocations(storeLocations);
        } else {
          setLocations([]);
        }
      } catch (error) {
        console.error("Failed to load locations: ", error);
      }
    };

    loadLocationsFromFile();
  }, []);

  const requestPermissions = async () => {
      try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        console.log("Foreground permission: ", foregroundStatus)
  
        if (foregroundStatus === 'granted') {
          startTracking(); //boolean isTracking => true
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

  const stopLocationTracking = async () => {
     try {
       stopTracking(); // isTracking boolean => false
       await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION);
       await FileSystem.writeAsStringAsync(LOCATIONS_FILE, JSON.stringify(locations))
       console.log("Reitti tallennettu ja seuranta lopetettu")
 
       await Notifications.scheduleNotificationAsync({
         content: {
           title: "Paikannus lopetettu",
           body: "Reitti tallennettu onnistuneesti.",
         },
         trigger: null
       });
     } catch (error) {
       console.error("Failed to stop tracking ", error);
     }
   }

  return {
    requestPermissions,
    clearLocationData,
    stopLocationTracking
  };
};
