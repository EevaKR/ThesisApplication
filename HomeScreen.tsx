import { View, Text } from 'react-native'
import React from 'react'
import { Button, IconButton } from 'react-native-paper'
import {NavigationContainer, useNavigation, NavigationProp } from '@react-navigation/native'


//sivu toimii, sisäänkirjautuminen puuttuu
//tee planoran ohjeella keycloak-sisäänkirjautuminen oauth2:lla
//tarvii tehdä uusi realm keycloakiin

//siirrä types-tiedostoon
type RootStackParamList = {
    Home: undefined,
    Map: undefined,
    Options: undefined,
}

export default function HomeScreen() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View>
       <IconButton
    icon="camera"
    iconColor='blue'
    size={20}
    onPress={() => navigation.navigate('Map')}
  />
    </View>
  )
}