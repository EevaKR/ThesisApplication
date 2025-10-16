import { View, Text, Alert } from 'react-native'
import React, {useState} from 'react'
import { styles } from '../styles/styles'
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../src/types';
import { Button, Switch } from 'react-native-paper';
import { useSettingsStore } from '../store/store';
import * as Updates from 'expo-updates'

//TODO: TUO switch-nappula ei vielä vaihda sitä pause-optionia
// TODO: tee kielituki, suomi/englanti
//TODO: asetuksiin linkki "oma profiili" --> josta linkki käyttäjätietoihin
// TODO: tee liukukytkin josta tulee onpress ==> state = automatic pause option enabled tms

//update-nappulan toiminnallisuus

const UpdateChecker = () => {
  const handleUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert("Päivitys saatavilla", "Sovellus käynnistyy uudelleen päivityksen asentamiseksi.");
        await Updates.reloadAsync();
      } else {
        Alert.alert("Uutta päivitystä ei tarjolla.", "Sovellus on jo ajan tasalla.");
      }
    } catch (e) {
      Alert.alert("Virhe", "Päivityksen tarkastaus epäonnistui.");
      console.log("Update check failed.", e)
    }
  };

  return ( 
    <View style = {{ padding: 20}}>
 <Button onPress={handleUpdate} >Päivitä sovellus</Button>
    </View>
  )
}



export default function OptionsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  // TODO: tee 
  //const [isSwitchOn, setIsSwitchOn] = React.useState(false);

  //const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

  const { isAutoPauseEnabled, setAutoPauseEnabled } = useSettingsStore();



//TODO: tee tämä. <Text>Aseta arvo sille kuinka nopeasti tauko tulee päälle, tämö saisi näkyä vasta kun liukukytkin on enabled</Text>
  return (
    <View style={styles.optionsContainer}>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Tauko-ominaisuus käyttöön</Text>
        <Switch
          value={isAutoPauseEnabled}
          onValueChange={(value) => {
            setAutoPauseEnabled(value);
            console.log(value ? "Automaattinen taukotila laitettu päälle" : "Automaattinen tauko päättynyt ja paikkatietoseuranta jatkuu");
          }} />
      </View>
      
   <UpdateChecker></UpdateChecker>
    </View>
  );
}