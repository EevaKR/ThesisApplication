import React, { useEffect } from 'react'
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { useLocationStore } from "../../store/store";


//TODO: tee ensin yksinkertainen pausetus jossa tulee modal kun location ei ole päivittynyt kahteen minuuttiin
//sit voi miettiä toteuttaisiko Haversinella tuon ios-mallin mukaisen pausetuksen

//TODO: iosilla pausetus voidaan tehdä näin: pausesUpdatesAutomatically
const LOCATIONS_FILE = FileSystem.documentDirectory + 'background_locations.json';
const BACKGROUND_LOCATION = 'background-location-task';

export const useLocationActions = () => {
  const {
    locations,
    setLocations,
    addLocation,
    startTracking,
    stopTracking,
    setLastLocationTimestamp
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
            //timeInterval: 5000,
            distanceInterval: 2,
            //TODO: voiko tähän määrittää activityType: Location.LocationActivityType.AutomotiveNavigation,
          }, 
          async (location) => {
            addLocation(location); //tallennetaan paikkatieto storeen 
            setLastLocationTimestamp(Date.now()); //updating latest timestamp

            try {
              let existingLocations = [];
              const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
              if (fileExists.exists) {
                const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE);
                existingLocations = JSON.parse(fileContent);
              }
              const updatedLocations = [...existingLocations, location];
              await FileSystem.writeAsStringAsync(LOCATIONS_FILE, JSON.stringify(updatedLocations, null, 2));
            } catch (storageError) {
              console.error("Failed to save locations: ", storageError);
            }
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
            distanceInterval: 2, //sijainnin täytyy muuttua yli 5m ennen kuin päivittää sijaintitiedon
            //tämä mahdollistaa sen että Android ei rajoita päivitystiheyttä samalla tavalla kuin normaalissa taustatilassa.
            foregroundService: {
              notificationTitle: 'Sijainnin seuranta',
              notificationBody: 'Sovellus seuraa sijaintiasi taustalla.',
            },
            activityType: Location.LocationActivityType.AutomotiveNavigation,
            //timeInterval: 10000, //10 sekunnin päivitysväli
            //deferredUpdatesInterval: 5000, //akkua säästävä päivitystoiminto joka asettaa päivityksen tuleen vain 10 s välein vaikka sijainti muuttuisi aiemmin tai muut päivitysehdot täyttyisivät
          });
          console.log("Debug: Taustalla tapahtuva paikannus aloitettu")
          //TODO: fix--> toimiiko tämä notifikaatio???
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
