import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import MapScreen from './screens/MapScreen'
import OptionsScreen from './screens/OptionsScreen'
import { useFonts } from 'expo-font';


const Stack = createStackNavigator();


//TODO: Siirrä värit ja fontit omaan tiedostoon
export default function MainStack() {



  return (
    <Stack.Navigator initialRouteName='Map'>
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Ajopiirturi',
            headerStyle: {
              backgroundColor: '#2d658a',
            },
            headerTintColor: '#d9e4ec',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontFamily: 'Oswald'
            },
          }}
        />
        <Stack.Screen name="Options" component={OptionsScreen}
          options={{
            title: 'Asetukset',
            headerStyle: {
              backgroundColor: '#2d658a',
            },
            headerTintColor: '#d9e4ec',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        ></Stack.Screen>
    </Stack.Navigator>
  )
}
