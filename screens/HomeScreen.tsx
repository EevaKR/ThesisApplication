import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Button, IconButton } from 'react-native-paper'
import { NavigationContainer, useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../src/types'
import { Pressable } from 'react-native-gesture-handler'
import { useAuthStore } from '../store/authStore'
import * as AuthSession from 'expo-auth-session'
import { exchangeCodeAsync, makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'

//tarvii tehdä uusi realm keycloakiin, nyt käytössä test-realm

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  //tän pitäis olla komponentin ulkopuolella mutta antaa erroria:
  //voi ratkaista sillä et kovakoodaa osoitteet ja laittaa ne .enviin
  const discovery = AuthSession.useAutoDiscovery('https://auth.rontti.org/realms/test');

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  //uusi:
  const [authError, setAuthError] = useState<string | null>(null);



  const redirectUri = makeRedirectUri({
    scheme: undefined, //vaihda tämä ja laita se myös app.config.js:aan, scheme: thesisapp
    path: 'callback'
  });

  console.log('Generated redirect URI: ', redirectUri)

  //auth request hook

  const [request, response, promptAsync] =
    useAuthRequest(
      {
        clientId: 'thesis',
        usePKCE: true,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
      },
      discovery
    )

  useEffect(() => {
    if (response?.type === 'success') {
      //tokenien tallennus expo-secure-storeen
      //refresh tokenin handlaus
      //const {accessToken} = response.authentication;
      //staten muutos isSignedIn == true
      useAuthStore.getState().signIn()
      navigation.navigate('Map')
    }
  }, [response]);


  return (
    <View>
      <Text>{isSignedIn ? "Olet kirjautunut" : "Et ole kirjautunut "} </Text>
      <Pressable
        onPress={() => promptAsync()}
        

        style={{
          backgroundColor: 'blue',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginVertical: 10,
        }}

      ><Text>LOGIN</Text></Pressable>
      <IconButton
        icon="camera"
        iconColor='blue'

        size={20}
        onPress={() => navigation.navigate('Map')}
      />
    </View>
  )
}