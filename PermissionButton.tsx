import { View, StyleSheet, Text } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';
//setLocationInfo ei ole käytössä

//Muista katsoa tarviiko android manifestiin
//tehdä jotain paikannuslupia

const BACKGROUND_LOCATION = 'background-location-task';

let setLocationInfo = null; //tämä uusi kohta

//callback-funktio, joka suoritetaan, kun sijaintitietoja saapuu taustalla. Se on nimetty BACKGROUND_LOCATION, ja se käsittelee data-objektin, joka sisältää sijainnit.
//TaskManager.defineTask rekisteröi tehtävän, joka aktivoituu kun Location.startLocationUpdatesAsync saa uusia sijaintipäivityksiä.
//Funktio tarkistaa, onko tullut virhe (error) tai dataa (data).
//Jos dataa on, se tulostaa sijainnit konsoliin.
TaskManager.defineTask(BACKGROUND_LOCATION, ({ data, error }) => {
  if (error) {
    console.error("Location task error: ", error.message)
    return;
  }
  if (data) {
    const { locations } = data;
    console.log("Received background locations: ", locations)
    // do something with the locations captured in the background
  }
});

const PermissionsButton = () => {
  const [location, setLocation] = useState<Location.LocationObject |null>(null);

  useEffect(() => {
    setLocationInfo = setLocation;
  }, []);

  const requestPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    console.log("Foreground permission: ", foregroundStatus)

    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log("Background permissions: ", backgroundStatus)

      if (backgroundStatus === 'granted') {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION, {
          accuracy: Location.Accuracy.Balanced,
          //showsBackgroundLocationIndicator: true, //TARKISTA
          //distanceInterval: 10, //TARKISTA

        });
        console.log("Debuggausta, taustalla tapahtuva paikannus aloitettu")
      }
    }
  }

  return (
    <View style={styles.container}>
      <Button style={styles.button} onPress={requestPermissions} >ALOITA PAIKANNUSTIETOJEN KERÄÄMINEN</Button>
      {location && (
        <Text>
          Viimeisin sijainti: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
    </View>


  )
}

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