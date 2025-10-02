import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import MapScreen from './screens/MapScreen'
import OptionsScreen from './screens/OptionsScreen'

const Stack = createStackNavigator();

export default function MainStack() {

  return (
    <Stack.Navigator initialRouteName='Map'>
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Ajopiirturi',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen name="Options" component={OptionsScreen}
          options={{
            title: 'Asetukset',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        ></Stack.Screen>
    </Stack.Navigator>
  )
}