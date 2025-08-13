import { View, StyleSheet, Text, ScrollView } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';


//aloittaa nyt jo tietojen keräämisen vaikka nappia ei ole painettu
//debuggaa!!!!! voisko johtua että lupa on jo annettu
//painike ei siis siihen että aloittaa sijaintitietojen
//keräämisen vaan lupien saamiseen



//Muista katsoa tarviiko android manifestiin
//tehdä jotain paikannuslupia

//mieti jatkossa mihin tiedot tallentuu(expo-file-system, sqlite, oma server, firebase)??
//kartan toteutus

const BACKGROUND_LOCATION = 'background-location-task';

//setLocationInfo ei ole käytössä
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
    if (setLocationInfo) {
      locations.forEach((loc) => setLocationInfo(loc));
    }
  }
});

const PermissionsButton = () => {
  //const [location, setLocation] = useState<Location.LocationObject |null>(null);
  const [locations, setLocations] = useState<Location.LocationObject[]>([]);

  /*useEffect(() => {
    setLocationInfo = setLocation; 
  }, []); */

  useEffect(() => {
    setLocationInfo = (newLocation: Location.LocationObject) => {
      setLocations((prev) => [...prev, newLocation]);
    };
  }, [])

  const requestPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    console.log("Foreground permission: ", foregroundStatus)

    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log("Background permissions: ", backgroundStatus)

      if (backgroundStatus === 'granted') {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION, {
          accuracy: Location.Accuracy.Highest,
          activityType: Location.LocationActivityType.Fitness,
          //distanceInterval:5, //päivittää sijainnin kun liikutaan 5metriä
          timeInterval: 5000, //tai 5sekunnin välein

        });
        console.log("Debuggausta, taustalla tapahtuva paikannus aloitettu")
      }
    }
  }

  return (
    <View style={styles.container}>
      <Button style={styles.button} onPress={requestPermissions} >ALOITA PAIKANNUSTIETOJEN KERÄÄMINEN</Button>
      <ScrollView style={styles.scrollContainer}>
        {locations.length > 0 ? (
          locations.map((loc, index) => (
            <Text key={index} style={styles.locationText}>
              {index + 1}. Leveysaste: {loc.coords.latitude}, Pituusaste: {loc.coords.longitude}
            </Text>
          ))
        ) : (
          <Text>Ei sijaintitietoja vielä</Text>
        )}
      </ScrollView>



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
  }


});

export default PermissionsButton;