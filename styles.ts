import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";


//TARKASTA TYYLIT VIELÄ, FLEXIT POIS OSASTA!!!!!!!!!!
const screenHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
    topButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 12,
        paddingVertical: 10,
        paddingRight: 150,
        paddingLeft: 1,
        //alignItems: 'flex-start',
        gap: 10,
        width: '100%',
        position: 'relative',
        zIndex: 1000,
    },
    topButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        width: '100%',
        flexDirection: 'row',
        minWidth: 100,
        alignItems: 'center',   
    },
    mapContainer: {
        flexGrow: 1,
        backgroundColor: '#007AFF'
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFAFA',
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFAFA',
        padding: 20,
    },
    text: {
        fontFamily: 'sans-serif-light',
        padding: 10,
        borderRadius: 10,
        fontSize: 18,
        textAlign: 'center',
        color: '#1d3537',
    },
    button: {
        backgroundColor: '#10bc10',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 10,
    },
    buttonText: {
        color: '#FFFAFA',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    scrollContainer: {
        marginTop: 20,
        width: '90%',
        maxHeight: '60%',
        height: 1,
    },
    locationText: {
        marginBottom: 5,
        fontSize: 16,
        textAlign: 'center',
        color: 'black'
    },
    map: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        marginTop: 10,
    },
    box: {
    width: 100,
    height: 80,
    backgroundColor: 'black',
    margin: 30,
  },
  optionsScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e8ad3'
  },
   modalView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'

  },

});
