import { create } from 'zustand'
import type { LocationObject } from 'expo-location';
import { setStatusBarTranslucent } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';

//ei tarvitse määritellä types:ts:ssa olevia tyyppejä uudelleen, 
// jos ne on määritelty jo. 
// usein store tarvitsee oman interfacen, 
// koska se sisältää enemmän kuin pelkkiä tietorakenteita 
// mm. funktioita, kuten setLocations, addLocation, setModalVisible jne.

//interfacessa määritellään tietorakenne, eli mitä kenttiä ja arvoja 
//jokin objekti voi sisältää

//siirrä types.ts:aan
type ModalType = 'settings' | 'pause' | null;


interface LocationStore {
    locations: LocationObject[];
    isTracking: boolean,
    modalVisible: boolean;
    setLocations: (locations: LocationObject[]) => void;
    addLocation: (location: LocationObject) => void;
    setModalVisible: (visible: boolean) => void;
    startTracking: () => void;
    stopTracking: () => void;
    lastLocationTimestamp: number | null;
    setLastLocationTimestamp: (timestamp: number) => void;
    modalType: ModalType,
    setModalType: (type: ModalType) => void;

}

export const useLocationStore = create<LocationStore>((set) => ({
    locations: [],
    isTracking: false,
    modalVisible: true,
    setLocations: (locations) => set({ locations }),
    addLocation: (location) =>
        set((state) => ({
            locations: [...state.locations, location],
        })),
    setModalVisible: (visible) => set({ modalVisible: visible }),
    startTracking: () => set({ isTracking: true }),
    stopTracking: () => set({ isTracking: false }),
    lastLocationTimestamp: null,
    setLastLocationTimestamp: (timestamp) => set({ lastLocationTimestamp: timestamp }),
    modalType: null,
    setModalType: (type) => set({ modalType: type }),
}));


// Pause detection store
interface PauseStore {
    lastRealLocationTimestamp: number | null;
    gyroStill: boolean;
    setLastRealLocationTimestamp: (timestamp: number) => void;
    updateGyroStatus: (isStill: boolean) => void;
    checkPauseCondition: (
        locations: LocationObject[],
        lastLocationTimestamp: number | null,
        distanceCalculator: (loc1: LocationObject, loc2: LocationObject) => number,
        savePauseStart: () => Promise<void>,
        savePauseEnd: () => Promise<void>
    ) => void;
}

export const usePauseStore = create<PauseStore>((set, get) => ({
    lastRealLocationTimestamp: null,
    gyroStill: true,

    setLastRealLocationTimestamp: (timestamp) =>
        set({ lastRealLocationTimestamp: timestamp }),

    updateGyroStatus: (isStill) =>
        set({ gyroStill: isStill }),

    checkPauseCondition: (
        locations,
        lastLocationTimestamp,
        distanceCalculator,
        savePauseStart,
        savePauseEnd
    ) => {
        const state = get();
        const { showModalTwo, hideModalTwo, isModalTwoVisible } = useModalStore.getState();

        if (locations.length < 2) return;

        const loc1 = locations[locations.length - 2];
        const loc2 = locations[locations.length - 1];
        const distance = distanceCalculator(loc1, loc2);

        // Alusta lastRealLocationTimestamp jos se on null
        if (state.lastRealLocationTimestamp === null) {
            set({ lastRealLocationTimestamp: Date.now() });
        }

        // päivittää ajan jos oikeasti liikkunut
        if (distance > 10) {
            set({ lastRealLocationTimestamp: Date.now() });
        }

        const now = Date.now();

        console.log({
            distance,
            lastLocationTimestamp,
            lastRealLocationTimestamp: state.lastRealLocationTimestamp,
            gyroStill: state.gyroStill,
            isModalTwoVisible
        });

        // Näyttää modalin jos ehdot täyttyy
        if (
            distance < 10 &&
            state.gyroStill &&
            !isModalTwoVisible
        ) {
            console.log("*********************************************DEBUG:Tauko havaittu*************************");
            showModalTwo();
            savePauseStart(); // Save pause start
        }

        // Hide pause modal if movement detected
        if (
            (distance >= 5 || !state.gyroStill) &&
            isModalTwoVisible
        ) {
            console.log("Tauko päättynyt (Zustand)");
            hideModalTwo();
            savePauseEnd(); // Save pause end
        }
    }
}))


//Asetukset-valikon store
export type SettingsState = {
    isAutoPauseEnabled: boolean,
    setAutoPauseEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    isAutoPauseEnabled: false,
    setAutoPauseEnabled: (value: boolean) => set({ isAutoPauseEnabled: value })
}));


//temp modal store modalTypen sijasta

type ModalStore = {
    isModalOneVisible: boolean,
    isModalTwoVisible: boolean,
    showModalOne: () => void;
    hideModalOne: () => void;
    showModalTwo: () => void;
    hideModalTwo: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
    isModalOneVisible: false,
    isModalTwoVisible: false,
    showModalOne: () => set({ isModalOneVisible: true }),
    hideModalOne: () => set({ isModalOneVisible: false }),
    showModalTwo: () => set({ isModalTwoVisible: true }),
    hideModalTwo: () => set({ isModalTwoVisible: false }),
}));
