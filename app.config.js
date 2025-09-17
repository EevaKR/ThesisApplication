
export default {
    expo: {
        name: "thesisapp",
        slug: "thesisapp",
        android: {
            package: "com.eevakr.thesisapp",
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY,
                }
            },
        },
        extra: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            eas: {
                projectId: "1af773f1-6cb2-4f24-9dd5-99181f7e9f4c"
            }
        }
    }
}
