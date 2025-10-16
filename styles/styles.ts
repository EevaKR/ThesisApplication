import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

//const screenHeight = Dimensions.get('window').height;


//TODO: TEE VÄRIT ERILLISIKSI!!!
//TODO: LAJITTELE TYYLIT
//TODO: tee fontit


export const styles = StyleSheet.create({
    optionsContainer: {
    padding: 20,
  },
  optionsLabel: {
    fontSize: 20,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 10,
    fontSize: 16,
  },

    screen: {
        flex: 1,
        backgroundColor: '#FFFAFA',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        color: '#1d3537',
        fontWeight: 'bold',
    },
    topButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    topButton: {
        backgroundColor: '#37609d',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 100,
        gap: 6,
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
        backgroundColor: '#37609d',
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
        color: '#d9e4ec',
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
