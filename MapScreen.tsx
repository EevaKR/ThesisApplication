import { View } from 'react-native'
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import ModalOne from './ModalOne';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import PermissionButton from './PermissionButton';
import { useLocationStore } from './store';


export default function MapScreen() {

  //palauttaa tilan ja toimintoja jotka liittyy location/modal
  //haetaan 3 asiaa zustand storesta, locations, modalVisible, setModalVisible
  const {
    locations,
    modalVisible,
    setModalVisible
  } = useLocationStore(); //toimii react-komponentissa

  //määritellään karttaan kartan aloituspiste
  const initialRegion = {
    latitude: 65,
    longitude: 26,
    latitudeDelta: 0.05, //zoomauksen taso
    longitudeDelta: 0.05,
  };


  useEffect(() => {
    // TODO: Muokkaa et modalin vain kerran sovelluksen käynnistyessä
    //pitäisikö näyttää vain jos background locaatiota ei saa?
    //muokkaa modaaliin myös linking, jotta menee valikkoon
  }, []);

  

  return (
      <View style={styles.mapContainer}>
        <ModalOne
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
        <PermissionButton />
        <MapView
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          //region= {} tällä voi säätää sen et näyttää koko ajan reaaliaikaisen paikan
          style={styles.map}
          showsUserLocation
          showsMyLocationButton={false}
        >
            
          <Polyline
          //tee marker reitin alkuun ja loppuun!!!
            coordinates={locations.map(loc => ({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude
            }))}
            strokeColor="#FF0000"
            strokeWidth={4}
          />
        </MapView>
      </View>
  )
}