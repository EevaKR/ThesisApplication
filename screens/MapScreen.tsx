import { useEffect, useLayoutEffect } from 'react';
import { styles } from '../styles/styles';
import ModalOne from '../components/ModalOne';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Region } from 'react-native-maps';
import { useLocationStore } from '../store/store';
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
        setModalType
    } = useLocationStore(); //toimii react-komponentissa

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
    }, []);


    //pause-tilan tunnistustoiminto, käynnistyy automaattisesti
    //TODO: LISÄÄ TÄHÄN HAVERSINE!!!!!!!!!!
    //toistaa 2min välein toimintaa
    useEffect(() => {
        const interval =
            setInterval(() => {
                const now = Date.now();
                const lastUpdate = useLocationStore.getState().lastLocationTimestamp;

                if (lastUpdate && now - lastUpdate > 2 * 60 * 1000) {
                    console.log("Tauko havaittu");

                    useLocationStore.getState().setModalVisible(true);
                    useLocationStore.getState().setModalType('pause');
                }
            }, 2 * 60 * 1000);

            return () => clearInterval(interval); //tyhjentää arvon kun komponentti unmount
    }, [lastLocationTimestamp])



    ////////////////////////////
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
    }

    useEffect(() => {
        const checkLocation = async () => {
            const enabled = await Location.hasServicesEnabledAsync();
            if (!enabled) {
                Alert.alert(
                    "Paikannus ei ole käytössä",
                    "Laitteen, sijaintipalvelut eivät ole käytössä. Ota ne käyttöön asetuksista."
                );
            }
        };
        checkLocation();
    }, [])

  
    return (
        <View style={styles.screen}>
            <ModalOne
                visible={modalType === 'settings'}
                onClose={() => setModalVisible(false)}
            />
            <Modal visible={modalType === 'pause'}><Text>Taukotila havaittu, lähde liikkeelle niin paikannustoiminto jatkuu</Text></Modal>
            <View style={styles.topButtonContainer}>
                <Pressable style={styles.topButton} onPress={requestPermissions}>
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
            <ScrollView
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
            </ScrollView>
            <MapView
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                region={region} //tällä voi säätää sen et näyttää koko ajan reaaliaikaisen paikan
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