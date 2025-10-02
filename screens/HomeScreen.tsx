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
import * as SecureStore from 'expo-secure-store'
import MapScreen from './MapScreen'

//tarvii tehdä uusi realm keycloakiin, nyt käytössä test-realm
// TARVIIKO TUOHON useEffectiin tehdä joku tokenin saamisjuttu vai tuleeko nyt automaattisesti???
//eri kuin viimeksi!!!
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
    scheme: 'thesisapp',
    path: 'callback'
  });

//auth request hook - only call when discovery is loaded
  const [request, response, promptAsync] =
    useAuthRequest(
      {
        clientId: 'thesis',
        usePKCE: true,
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        redirectUri,
      },
      discovery ?? null
    )


  useEffect(() => {
    if (response?.type === 'success') {
      //tokenien tallennus expo-secure-storeen
      //refresh tokenin handlaus
      //const {accessToken} = response.authentication;
      //staten muutos isSignedIn == true
      useAuthStore.getState().signIn()
      
    }
  }, [response]);

  //TODO: HOXXX TÄTÄ EI KUTSUTA VIELÄ, kts tuleeko tuossa uudistetussa discoveryssa automaattisesti refreshtokent
  //TODO: usePKCE: true ja Standard Flow, kts planora-apista mallia
  const refreshAccessToken = async (refreshToken: string): Promise<any> => {
    try {
      console.log('Kokeilee saada R_tokenia')

      //token refresh request
      const tokenRequest = new URLSearchParams({
        client_id: 'thesis',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      //varmistetaan et discovery ei oo null
      if (!discovery || !discovery.tokenEndpoint) {
        console.warn("Missing discovery url")
        return;
      }
      const response = await fetch(discovery.tokenEndpoint, {

        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },
        body: tokenRequest.toString()
      });

      if (!response.ok) {
        const errorData = await response.text
        console.error('Ei saanut R_tokenia: ', response.status, errorData);
        throw new Error(`Token refresh failed:${response.status}`)
      }

      const tokenResponse = await response.json();
      console.log("Token refresh onnistui, expires in: ", tokenResponse.expires_in)

      //storing tokens

      const newTokens = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || refreshToken, // uses new refresh token if it gets one
        idToken: tokenResponse.id_token,
        expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000
      }

      await SecureStore.setItemAsync('auth_tokens', JSON.stringify(newTokens));
      return newTokens;
    } catch (error) {
      console.error('Error refreshing token: ', error)
      throw error;
    }
  }

  // TODO: testaa toimiiko ja tee sitten check if existing authentication funktio
  //
  /*
  useEffect(() => {
      const checkExistingAuth = async () => {
        try {
          const tokensString = await SecureStore.getItemAsync('auth_tokens');
          if (tokensString) {
            const tokens = JSON.parse(tokensString);
            console.log('Tokens from SecureStore:', tokens);
  
            // Check if token is expired
            if (tokens.expiresAt > Date.now()) {
              // Token is still valid
              console.log('Access token is still valid');
              setIsSignedIn(true);
              navigation.navigate('Home');
              return;
            }
            // Token is expired, try to refresh it
            else if (tokens.refreshToken) {
              console.log('Access token expired, attempting to refresh');
              try {
                const newTokens = await refreshAccessToken(tokens.refreshToken);
                console.log('Token refresh successful');
                setIsSignedIn(true);
                navigation.navigate('Home');
                return;
              } catch (refreshError) {
                console.error('Failed to refresh token, user needs to login again:', refreshError);
                // Clear stored tokens because those are not working
                await SecureStore.deleteItemAsync('auth_tokens');
              }
            }
          }
        } catch (error) {
          console.error('Error checking existing authorization: ', error);
    
          await SecureStore.deleteItemAsync('auth_tokens');
        } finally {
          setIsCheckingAuth(false);
        }
      };
  
      if (isCheckingAuth) {
        checkExistingAuth();
      }
    }, [isCheckingAuth])
  
  */

  // Show loading while discovery is being fetched
  if (!discovery) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>{isSignedIn ? "Olet kirjautunut" : "Et ole kirjautunut "} </Text>
      <Pressable
        onPress={() => promptAsync()}
        disabled={!request}
        style={{
          backgroundColor: !request ? 'gray' : 'blue',
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
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  )
}
