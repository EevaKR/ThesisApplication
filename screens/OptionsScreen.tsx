import { View, Text } from 'react-native'
import React, {useState} from 'react'
import { styles } from '../styles/styles'
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../src/types';
import { Switch } from 'react-native-paper';
import { useSettingsStore } from '../store/store';



// TODO: tee kielituki, suomi/englanti
//TODO: asetuksiin linkki "oma profiili" --> josta linkki käyttäjätietoihin
// TODO: tee liukukytkin josta tulee onpress ==> state = automatic pause option enabled tms
export default function OptionsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [isSwitchOn, setIsSwitchOn] = React.useState(false);

  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

  const { isAutoPauseEnabled, setAutoPauseEnabled } = useSettingsStore();

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
      <Text>Aseta arvo sille kuinka nopeasti tauko tulee päälle, tämö saisi näkyä vasta kun liukukytkin on enabled</Text>
    </View>
  );
}