import { useEffect, useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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

//TODO: tee nappi reaktiiviseksi että väri muuttuu tms kun sitä painetaan

export default function MapScreen() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    //palauttaa tilan ja toimintoja jotka liittyy location/modal
    //haetaan 3 asiaa zustand storesta, locations, modalVisible, setModalVisible
    const {
        locations,
        modalVisible,
        setModalVisible,
        isTracking
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

    const coordinates = locations.map(loc => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
    }));

    const start = coordinates[0];
    const end = coordinates[coordinates.length - 1];

    return (
        <View style={styles.screen}>
            <ModalOne
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />

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