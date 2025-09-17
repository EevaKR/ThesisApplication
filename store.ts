import {create } from 'zustand'
import type { LocationObject } from 'expo-location';

//ei tarvitse määritellä types:ts:ssa olevia tyyppejä uudelleen, 
// jos ne on määritelty jo. 
// usein store tarvitsee oman interfacen, 
// koska se sisältää enemmän kuin pelkkiä tietorakenteita 
// mm. funktioita, kuten setLocations, addLocation, setModalVisible jne.

//interfacessa määritellään tietorakenne, eli mitä kenttiä ja arvoja 
//jokin objekti voi sisältää
interface LocationStore {
    locations: LocationObject[];
    modalVisible: boolean;
    setLocations: (locations: LocationObject[]) => void;
    addLocation: (location: LocationObject) => void;
    setModalVisible: (visible: boolean) => void;
    
}

export const useLocationStore = create<LocationStore>((set) => ({
locations: [],
modalVisible: true,
setLocations: (locations) => set({ locations }),
addLocation: (location) =>
    set((state) => ({
        locations: [...state.locations, location],
    })),
    setModalVisible: (visible) => set({ modalVisible: visible })
}))