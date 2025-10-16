import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { styles } from '../styles/styles';
import ModalOne from '../components/ModalOne';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Region } from 'react-native-maps';
import { useLocationStore, useSettingsStore, usePauseStore, useModalStore } from '../store/store';
import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useLocationActions } from '../src/hooks/useLocationActions'
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList, PauseEvent } from '../src/types';
import type { LocationObject } from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { Modal } from 'react-native-paper';
import * as Location from 'expo-location'
import { Alert } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import ModalTwo from '../components/ModalTwo';
import { Button } from 'react-native-paper';

//TODO: tee nappi reaktiiviseksi että väri muuttuu tms kun sitä painetaan
//TODO: distanceInterval voisi korreloida ajonopeuden kanssa

export default function MapScreen() {

    //temp modaltypen tilalta
    const { isModalTwoVisible, 
        hideModalTwo
        , isModalOneVisible,
        hideModalOne,
        showModalOne,
        showModalTwo
     } = useModalStore();


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
    const { updateGyroStatus, checkPauseCondition } = usePauseStore();

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

    //headerin ikoni, joka ohjaa options-sivulle
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

    //PAUSE OPTION, BETA, lasketaan etäisyys matemaattisella kaavalla (ei käytetä haversinea koska matka ei tarpeeksi pitkä)
    const distanceForPause = (
        loc1: Location.LocationObject,
        loc2: Location.LocationObject,
        thresholdMeters = 10
    ): number => {
        const R = 6371000; //Maapallon säde (m)
        const dLat = (loc2.coords.latitude - loc1.coords.latitude) * Math.PI / 180;
        const dLon = (loc2.coords.longitude - loc1.coords.longitude) * Math.PI / 180;
        const lat1 = loc1.coords.latitude * Math.PI / 180;
        const lat2 = loc2.coords.latitude * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    //gyroskoopin seuranta (toiminnallisuus storessa)
    useEffect(() => {
        const subscription = Gyroscope.addListener(({ x, y, z }) => {
            const rotation = Math.sqrt(x * x + y * y + z * z);
            updateGyroStatus(rotation < 1.00); // päivittää Zustand storeen
        });

        Gyroscope.setUpdateInterval(10000); //päivittää 10s välein

        return () => subscription.remove();
    }, [updateGyroStatus]);

    // Pause save functions
    const LOCATIONS_FILE = FileSystem.documentDirectory + 'background_locations.json';

    const savePauseStart = async () => {
        try {
            const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
            if (!fileExists.exists) return;

            const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE);
            const data = JSON.parse(fileContent);

            // Initialize pauseEvents array if it doesn't exist
            if (!data.pauseEvents) {
                data.pauseEvents = [];
            }

            const lastLoc = locations[locations.length - 1];
            if (!lastLoc) return;

            data.pauseEvents.push({
                startTime: Date.now(),
                endTime: null,
                latitude: lastLoc.coords.latitude,
                longitude: lastLoc.coords.longitude,
            });

            await FileSystem.writeAsStringAsync(LOCATIONS_FILE, JSON.stringify(data, null, 2));
            console.log("Pause start saved");
        } catch (error) {
            console.error("Failed to save pause start:", error);
        }
    };

    const savePauseEnd = async () => {
        try {
            const fileExists = await FileSystem.getInfoAsync(LOCATIONS_FILE);
            if (!fileExists.exists) return;

            const fileContent = await FileSystem.readAsStringAsync(LOCATIONS_FILE);
            const data = JSON.parse(fileContent);

            if (data.pauseEvents && data.pauseEvents.length > 0) {
                const lastPause = data.pauseEvents[data.pauseEvents.length - 1];
                if (lastPause && !lastPause.endTime) {
                    lastPause.endTime = Date.now();
                    await FileSystem.writeAsStringAsync(LOCATIONS_FILE, JSON.stringify(data, null, 2));
                    console.log("Pause end saved");
                }
            }
        } catch (error) {
            console.error("Failed to save pause end:", error);
        }
    };

    // Pause-tilan tunnistus (toiminnallisuus storessa)
    useEffect(() => {
        //jos switch-nappi ei ole päällä --> return
        if (!isAutoPauseEnabled) return;
        console.log("Pause-tilan tarkistus käynnistyi");

        //checkpausecondition kutsutaan 30s välein --> tarkastaa tilat
        const interval = setInterval(() => {
            checkPauseCondition(
                locations,
                lastLocationTimestamp,
                distanceForPause,
                savePauseStart,
                savePauseEnd
            );
        }, 30 * 1000); // 30 seconds

        return () => clearInterval(interval);
    }, [isAutoPauseEnabled, locations, lastLocationTimestamp, checkPauseCondition]); // mountaa vain kun nämä arvot muuttuvat


    // Kartan koordinantit
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

    // funktio, joka tarkastaa onko paikannus päällä, kutsutaan pressable-buttonista
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

    //funktio joka yhdistää requestPermissions ja checkLocationEnabled=
    const pressStartButton = async () => {
        await requestPermissions();
        await checkLocationEnabled();
        useLocationStore.getState().startTracking(); //käynnistää hookin logiikan
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

    // //asettaa modalin === settings, jos locations on tyhjä 
    // //TODO KEKSI TÄLLE JOKU ERI EHTO MILLON TULEE SETTINGS, esim jos ei saa locationseja lainkaan
    useEffect(() => {
        if (locations.length === 0) {
            showModalOne();
        }
    }, []);

    // // Hide modal function for pause modal
    // const hideModal = () => {
    //     setModalVisible(false);
    //     setModalType(null);
    // };

    



    return (
        <View style={styles.screen}>
            <StatusBar style="light" />
            <ModalOne
                visible={modalType === 'settings'}
                onClose={() => {
                    setModalVisible(false);
                    setModalType(null);
                }}
            />

            <View style={styles.topButtonContainer}>
                <Button
                    mode="contained"
                    onPress={pressStartButton}
                    icon="crosshairs-gps"
                    style={{ margin: 0.5 }}
                    contentStyle={{ paddingVertical: 4 }}
                >
                    ALOITA
                
            </Button>
            <Button 
                mode="contained"
                    onPress={clearLocationData}
                    icon="close-circle-outline"
                    style={{ margin: 0.5 }}
                    contentStyle={{ paddingVertical: 4 }}
                >
                    POISTA
            </Button>
            <Button 
                mode="contained"
                    onPress={stopLocationTracking}
                    icon="stop-circle"
                    style={{ margin: 0.5}}
                    contentStyle={{ paddingVertical: 4 }}
                >
                    LOPETA
            </Button>
          
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
            <ModalTwo
                visible={isModalTwoVisible}
                //onDismiss={hideModal}
                onClose={hideModalTwo}
            >
            </ModalTwo>
        </View >
    )
}
