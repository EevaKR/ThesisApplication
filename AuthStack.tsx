import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from './screens/HomeScreen';


const Stack = createStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'AJOPIIRTURI',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        backgroundColor: '#2d658a',
                    },
                    headerTintColor: '#d9e4ec',
                    headerTitleStyle: {
                        fontWeight: 'bold'
                    },
                }}
            />
        </Stack.Navigator>
    )
}
