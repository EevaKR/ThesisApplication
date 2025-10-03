import { useEffect, useLayoutEffect, useRef } from 'react';
import { styles } from '../styles/styles';
import ModalOne from '../components/ModalOne';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Region } from 'react-native-maps';
import { useLocationStore, useSettingsStore } from '../store/store';
import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useLocationActions } from '../src/hooks/useLocationActions'
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../src/types';
import type { LocationObject } from 'expo-location';
import { Modal } from 'react-native-paper';
import * as Location from 'expo-location'
import { Alert } from 'react-native';

//TODO: tee nappi reaktiiviseksi että väri muuttuu tms kun sitä painetaan
//TODO: koordinantit, debug-mielessä niiden tulisi näkyä jotta näkee toimiiko pausetus
//TODO: distanceInterval voisi korreloida ajonopeuden kanssa


export default function MapScreen() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    //palauttaa tilan ja toimintoja jotka liittyy location/modal
    //haetaan 3 asiaa zustand storesta, locations, modalVisible, setModalVisible

    const {
        locations,
        modalVisible,
        setModalVisible,
        isTracking,
        lastLocationTimestamp,
        modalType,
        setModalType,

    } = useLocationStore(); //toimii react-komponentissa

    const { isAutoPauseEnabled } = useSettingsStore();

    const {
        requestPermissions,
        clearLocationData,
        stopLocationTracking
    } = useLocationActions();

    //määritellään viimeisin location
    const lastLocation = locations[locations.length - 1];

    //tehdään region jotta kartta olisi koko ajan ajantasalla
    const region: Region | undefined = lastLocation
        ? {
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        }
        : undefined

    //määritellään karttaan kartan aloituspiste
    /*const initialRegion = {
      latitude: 65,
      longitude: 26,
      latitudeDelta: 0.05, //zoomauksen taso
      longitudeDelta: 0.05,
    }; */
    /*
        //tauotus-option
        const usePauseOption = () => {
            useEffect(() => {
                const pauseTime = setInterval(() => {
                    if (lastLocationTimestamp) {
                        const now = Date.now();
                        const diff = now - lastLocationTimestamp;
                        if (diff < 2 * 60 * 1000 && modalType !== 'pause') {
                            setModalType('pause')
                        }
    
                        if (diff <= 2 * 60 * 1000 && modalType === 'pause') {
                            setModalType(null); //modal ei näy kun liike jatkuu
                        }
                    }
                }, 10000); //tarkistaa tilaa 10 sekunnin välein
    
                return () => clearInterval(pauseTime)
            }, [lastLocationTimestamp, modalType, setModalType])
        } */

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Options')}
                    style={{ marginRight: 15 }}
                >
                    <Ionicons name='settings-outline' size={24} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);


    useEffect(() => {
        // TODO: Muokkaa et modalin vain kerran sovelluksen käynnistyessä
        //pitäisikö näyttää vain jos background locaatiota ei saa?
        //muokkaa modaaliin myös linking, jotta menee valikkoon
        //EI LINKING VAAN INTENT LAUNCHER!!! kts koodi readme.txt
    }, []);

    //PAUSE OPTION, BETA, lasketaan etäisyys matemaattisella kaavalla (ei käytetä haversinea koska matka ei tarpeeksi pitkä)
    const distanceForPause = (loc1: Location.LocationObject,
        loc2: Location.LocationObject,
        thresholdMeters = 10): number => {
        const R = 6371000; //Maapallon säde (m)
        const dLat = (loc2.coords.latitude - loc1.coords.latitude) * Math.PI / 180;
        const dLon = (loc2.coords.longitude - loc1.coords.longitude) * Math.PI / 180;
        const lat1 = loc1.coords.latitude * Math.PI / 180;
        const lat2 = loc2.coords.latitude * Math.PI / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    //pause-tilan tunnistustoiminto, käynnistyy automaattisesti
    //toistaa 2min välein toimintaa
    useEffect(() => {
        if (!isAutoPauseEnabled) return;

        const interval = setInterval(() => {

            if (locations.length >= 2) {
                const loc1 = locations[locations.length - 2];
                const loc2 = locations[locations.length - 1];

                const distance = distanceForPause(loc1, loc2);
                console.log(`Etäisyys kahden viimeisimmän sijainnin välillä: ${distance.toFixed(2)}m`)
            

            //jos etäisyys on alle 5 metriä ja viime päivityksestä on yli 2 minuuttia, näytä
            //Modal('pause'), TODO: ONKO JÄRKEVÄT ARVOT!!!
            //if distance < 5 eli jos etäisyys on alle 5 metriä && 
            const now = Date.now();

            if (distance < 5 && 
                lastLocationTimestamp && 
                now - lastLocationTimestamp > 2 * 60 * 1000 &&
                !modalVisible
            ) {
                console.log("Tauko havaittu");

                setModalVisible(true);
                setModalType('pause')
                //useLocationStore.getState().setModalVisible(true);
                //useLocationStore.getState().setModalType('pause');
            }
            if( distance >= 5 && modalVisible && modalType === 'pause') {
                console.log("Tauko päättynyt");
                setModalVisible(false);
                setModalType(null)
            }
        }
        }, 2 * 60 * 1000);

    return () => clearInterval(interval); //tyhjentää arvon kun komponentti unmount
}, [locations, lastLocationTimestamp, isAutoPauseEnabled, modalVisible, modalType
]);



//////////////////////////// Kartan koordinantit
const coordinates = locations.map(loc => ({
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude
}));
//markereiden alku- ja loppukoordinantit
const start = coordinates[0];
const end = coordinates[coordinates.length - 1];

const checkIsLocationEnabled = async () => {
    const locationEnabled = await Location.hasServicesEnabledAsync();
    if (locationEnabled) {
        console.log("Laitteen paikannus päällä")
    } else {
        console.warn("Laitteen paikannus ei päällä")
    }
}

// const joka tarkastaa onko paikannus enabled kutsutaan pressable-buttonista

const checkLocationEnabled = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
        Alert.alert(
            "Paikannus ei ole käytössä",
            "Laitteen sijaintipalvelut eivät ole käytössä. Ota ne käyttöön asetuksista."
        );
        return false;
    }
    return true;
};

//yhdistää requestPermissions ja checkLocationEnabled=
const pressStartButton = async () => {
    await requestPermissions();
    await checkLocationEnabled();
}

const mapRef = useRef<MapView>(null);

//tämä useEffect säätää sitä että kartta ei nyi
useEffect(() => {
    if (lastLocation && mapRef.current) {
mapRef.current.animateToRegion({
    latitude: lastLocation.coords.latitude,
    longitude: lastLocation.coords.longitude,
    latitudeDelta: 2,
    longitudeDelta: 2,
}, 1000) //hallittu siirtymä
    }
}, [lastLocation])




return (
    <View style={styles.screen}>
        <ModalOne
            visible={modalType === 'settings'}
            onClose={() => setModalVisible(false)}
        />
        <Modal visible={modalType === 'pause'}><Text>Taukotila havaittu, lähde liikkeelle niin paikannustoiminto jatkuu</Text></Modal>
        <View style={styles.topButtonContainer}>
            <Pressable style={styles.topButton} onPress={pressStartButton}>
                <Text style={styles.buttonText}>
                    <Ionicons name="location-sharp" size={20} /> ALOITA
                </Text>
            </Pressable>
            <Pressable style={styles.topButton} onPress={clearLocationData}>
                <Text style={styles.buttonText}>
                    <Ionicons name="close-circle-outline" size={20} /> TYHJENNÄ
                </Text>
            </Pressable>
            <Pressable style={styles.topButton} onPress={stopLocationTracking}>
                <Text style={styles.buttonText}>
                    <Ionicons name="stop-circle-sharp" size={20} /> LOPETA
                </Text>
            </Pressable>
        </View>
        {/*<ScrollView
            style={{ flex: 1, marginTop: 100 }}
            contentContainerStyle={{ padding: 16 }}
            scrollEventThrottle={16}
        >
            {locations.length > 0 ? (
                locations.map((loc: LocationObject, index: number) => (
                    <Text key={index} style={styles.locationText}>
                        {index + 1}. Leveysaste: {loc.coords.latitude}, Pituusaste: {loc.coords.longitude}
                        {loc.timestamp ? ` (${new Date(loc.timestamp).toLocaleTimeString()})` : ''}
                    </Text>
                ))
            ) : (
                <Text>Ei sijaintitietoja vielä</Text>
            )}
        </ScrollView> */}
        <MapView
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            //region={region} //tällä voi säätää sen et näyttää koko ajan reaaliaikaisen paikan
            style={styles.map}
            showsUserLocation
            showsMyLocationButton={false}
        >

            <Polyline
                coordinates={coordinates}
                strokeColor="#FF0000"
                strokeWidth={4}
            />

            {!isTracking && start && (
                <Marker
                    coordinate={start}
                    title="Reitin aloituspiste"
                    pinColor='#10bc10'
                />
            )}

            {!isTracking && end && (
                <Marker
                    coordinate={end}
                    title="Reitin päätepiste"
                    pinColor='red'
                />
            )}
        </MapView>
    </View>
)
}