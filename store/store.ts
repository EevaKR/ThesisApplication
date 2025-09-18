import { create } from 'zustand'
import type { LocationObject } from 'expo-location';
import { setStatusBarTranslucent } from 'expo-status-bar';


//ei tarvitse määritellä types:ts:ssa olevia tyyppejä uudelleen, 
// jos ne on määritelty jo. 
// usein store tarvitsee oman interfacen, 
// koska se sisältää enemmän kuin pelkkiä tietorakenteita 
// mm. funktioita, kuten setLocations, addLocation, setModalVisible jne.

//interfacessa määritellään tietorakenne, eli mitä kenttiä ja arvoja 
//jokin objekti voi sisältää
interface LocationStore {
    locations: LocationObject[];
    isTracking: boolean,
    modalVisible: boolean;
    setLocations: (locations: LocationObject[]) => void;
    addLocation: (location: LocationObject) => void;
    setModalVisible: (visible: boolean) => void;
    startTracking: () => void;
    stopTracking: () => void;

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
    stopTracking: () => set({ isTracking: false })
}))


//TODO: onko tämä käytössä???
export const usePauseStore = create((set) => ({
    isPaused: false,
    setPaused: (value: boolean) => set({ isPaused: value })
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