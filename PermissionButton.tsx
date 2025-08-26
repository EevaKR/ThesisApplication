import { View, StyleSheet, Text, ScrollView } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';
import React, { useRef } from 'react';

//MA:  JOS EI AUTA NIIN TEE NOTIFICAATIO

//Yksi tapa lähestyä tätä ongelmaa voisi olla lähettää push-ilmoitus, jos sovelluksesi odottaa taustasijainnin seurantaa, mutta sitä ei ole tapahtunut hetkeen. Tällöin käyttäjä voi halutessaan reagoida ilmoitukseen ja kytkeä seurannan takaisin päälle.
//timestamp logiin, näkee toimiiko background location
//muista uusi branch
//aloittaa nyt jo tietojen keräämisen vaikka nappia ei ole painettu
//debuggaa!!!!! voisko johtua että lupa on jo annettu
//painike ei siis siihen että aloittaa sijaintitietojen
//keräämisen vaan lupien saamiseen
//lisää expo file system
//lisää google maps ja lokaation mukaan reitti
//POLYLINELLA reitti näkymään kartalle

//Muista katsoa tarviiko android manifestiin tehdä jotain paikannuslupia

//mieti jatkossa mihin tiedot tallentuu(expo-file-system, sqlite, oma server, firebase)??
//kartan toteutus

// ei toimi taustalla, lupaongelma??--> ei voi olla, luvat kunnossa

//ajastettu do nothing background task 
TaskManager.defineTask('DO_NOTHING_TASK', async () => {
  console.log('DO_NOTHING_TASK executed at', new Date().toISOString());
  console.log('Taustatehtävä suoritettu!');
  //TÄSTÄ PUUTTUU AJASTUS
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
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    console.log("Received background locations: ", locations);
    if (setLocationInfo) {
      locations.forEach((loc: Location.LocationObject) => setLocationInfo!(loc));
    }
  }
});


//avaa mitä tämä tekee
let setLocationInfo: ((location: Location.LocationObject) => void) | null = null;

const PermissionsButton = () => {
  //const [location, setLocation] = useState<Location.LocationObject |null>(null);
  const [locations, setLocations] = useState<Location.LocationObject[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  /*useEffect(() => {
    setLocationInfo = setLocation; 
  }, []); */

  useEffect(() => {
    setLocationInfo = (newLocation: Location.LocationObject) => {
      setLocations((prev) => [...prev, newLocation]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    // Note: TaskManager tasks are automatically registered when defined
    // The DO_NOTHING_TASK will run based on system scheduling, not a timer
    console.log("DO_NOTHING_TASK is defined and ready");

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
          //distanceInterval: 1, //päivittää sijainnin kun liikutaan 5metriä
          timeInterval: 10000, //tai 5sekunnin välein
          //hoxxx!!! Molempien ehtojen pitää täyttyä, jotta uusi sijainti lähetetään
        });
        console.log("Debuggausta, taustalla tapahtuva paikannus aloitettu")
      }
    }
  }

  return (
    <View style={styles.container}>
      <Button style={styles.button} onPress={requestPermissions} >ALOITA PAIKANNUSTIETOJEN KERÄÄMINEN</Button>
      <ScrollView
        style={styles.scrollContainer}
        ref={scrollViewRef}
      >
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
