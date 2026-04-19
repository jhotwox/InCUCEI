import { Button, Text, FAB } from "react-native-paper"
import { memo, useState, useRef, useEffect } from "react"
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import * as Location from 'expo-location';
import { PLACES } from '../../constants/places';
import Mapbox from '@rnmapbox/maps';
import { useLayout } from "../../layout/providers.layout";
Mapbox.setAccessToken('pk.eyJ1IjoiZ2Vyc29uMzAiLCJhIjoiY21mZGZxZ3ppMDc2YzJxcHo2enQxbnNwayJ9.uvEc9toQvd04tBlJ6Ko5iA');

const MapScreen = () => {
  const [search, setSearch] = useState('');
  const [showRestrooms, setShowRestrooms] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  const cameraRef = useRef(null);
  const params = useLocalSearchParams();
  const { tabBarHeight } = useLayout();

  const centerCampus = [-103.32473086798036, 20.657210257040575];

  const searchResults = search
    ? PLACES.filter(place => place.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const goToLocation = (coordinates) => {
    setSelectedPlace(coordinates);

    cameraRef.current?.setCamera({
      centerCoordinate: coordinates.coord,
      zoomLevel: 18,
      animationDuration: 1500,
    });
    setSearch('');
    Keyboard.dismiss();
  };

  // Centrar en la ubicación actual del usuario
  const centerOnUserLocation = () => {
    if (!userLocation) {
      console.log('❌ No hay ubicación disponible');
      return;
    }

    cameraRef.current?.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: 18,
      animationDuration: 1500,
    });

    Keyboard.dismiss();
  };

  // Manejar navegación desde el chatbot
  useEffect(() => {
    if (params.focusPlace === "true" && params.placeId) {
      console.log("[+] Focusing place from chatbot:", params.placeName)

      const place = PLACES.find(p => p.id === params.placeId)
      if (place) {
        // Esperar un momento para que el mapa esté listo
        setTimeout(() => {
          goToLocation(place)
        }, 1000)
      }
    }
  }, [params.focusPlace, params.placeId])

  // Solicitar permisos y rastrear ubicación
  useEffect(() => {
    let locationSubscription = null;

    (async () => {
      try {
        // Solicitar permisos de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');

        if (status !== 'granted') {
          console.log('❌ Permiso de ubicación denegado');
          return;
        }

        // Obtener ubicación inicial
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Rastrear ubicación en tiempo real
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Actualizar cada 10 metros
            timeInterval: 5000, // Actualizar cada 5 segundos
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );
      } catch (error) {
        console.error('❌ Error al obtener ubicación:', error);
      }
    })();

    // Cleanup: detener el rastreo cuando el componente se desmonte
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // 🛠️ TRUCO DE DESARROLLADOR: Obtener coordenadas exactas
  const onTouchCoordinates = (event) => {
    const coordinates = event.geometry.coordinates;
    console.log(`📍 Coordenadas tocadas: [${coordinates[0]}, ${coordinates[1]}]`);
  };

  const geoJSONSearchPoint = selectedPlace ? {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Point', coordinates: selectedPlace.coord },
      properties: { nombre: selectedPlace.name }
    }]
  } : null;

  const restroomsGeoJSON = {
    type: 'FeatureCollection',
    features: PLACES.filter(l => l.type === 'baño').map(bano => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: bano.coord },
      properties: { nombre: bano.name }
    }))
  };

  const handleSetSearch = (text) => {
    setSearch(text);
    if (selectedPlace) setSelectedPlace(null);
  };

  return (
    <View style={styles.container}>
      
      <StatusBar style={"dark"} />
      
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        // onPress={onTouchCoordinates} // <-- El sensor que detecta tus toques
      >
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Mapbox.LocationPuck
            puckBearingEnabled
            puckBearing="heading"
            pulsing={{ isEnabled: true, color: '#007AFF', radius: 30 }}
          />
        )}
        
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={16}
          centerCoordinate={centerCampus}
          pitch={60}
          heading={20}
          maxBounds={{
            sw: [-103.32922256142743, 20.65239162947517],
            ne: [-103.31834352200687, 20.662471745839945]
          }}
        />

        <Mapbox.FillExtrusionLayer
          id="edificios-3d"
          sourceLayerID="building"
          belowLayerID="poi-label"
          style={{
            fillExtrusionHeight: ['get', 'height'],
            fillExtrusionColor: '#e0e0e0',
            fillExtrusionOpacity: 0.9,
            fillExtrusionBase: 0,
          }}
        />

        {selectedPlace && (
          <Mapbox.ShapeSource id="seleccionSource" shape={geoJSONSearchPoint}>
            <Mapbox.CircleLayer 
              id="seleccionCapa" 
              style={{ 
                circleColor: '#007AFF',
                circleRadius: 10,
                circleStrokeColor: '#ffffff',
                circleStrokeWidth: 3,
                circleOpacity: 0.9,
              }} 
            />
          </Mapbox.ShapeSource>
        )}

        {showRestrooms && (
          <Mapbox.ShapeSource id="restroomsSource" shape={restroomsGeoJSON}>
            <Mapbox.CircleLayer
              id="restroomsLayer"
              style={{
                circleColor: '#007AFF',
                circleRadius: 8,
                circleStrokeColor: '#ffffff',
                circleStrokeWidth: 2
              }} 
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>

      <View style={styles.uiContainer}>
        <View style={styles.topRow}>
          
          {/* -- Input -- */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Buscar edificio..."
              placeholderTextColor="#888"
              value={search}
              onChangeText={handleSetSearch}
            />
            {/* Show X if they are text */}
            {search.length > 0 && (
              <TouchableOpacity onPress={() => {setSearch(''); setSelectedPlace(null); }} style={styles.botonLimpiar}>
                <Text style={styles.textoLimpiar}>✖</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* -- Search button -- */}
          <Button 
            style={[styles.botonBanos, showRestrooms && styles.botonBanosActivo]} 
            onPress={() => setShowRestrooms(!showRestrooms)}
          >
            <Text style={styles.botonTexto}>Baños</Text>
          </Button>
        </View>

        {/* -- Search results -- */}
        {searchResults.length > 0 && (
          <View style={styles.resultadosContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultadoItem} onPress={() => goToLocation(item)}>
                  <Text style={styles.resultadoTexto}>
                    {item.type === 'baño' ? '🚽 ' : '🏢 '}
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Botón flotante para centrar en ubicación actual */}
      {locationPermission && userLocation && (
        <FAB
          icon="crosshairs-gps"
          style={[styles.fab, { bottom: tabBarHeight + 20 }]} // Ajustar margen inferior según altura del tab bar
          onPress={centerOnUserLocation}
          color="#fff"
        />
      )}
    </View>
  )
}

// 3. ESTILOS ACTUALIZADOS (Con texto negro para evitar invisibilidad)
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  
  uiContainer: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
    // padding: 6,
  },
  input: {
    flex: 1,
    color: '#000000', // Texto oscuro siempre
    padding: 12,
    // padding: 16,
  },
  botonLimpiar: {
    padding: 8,
    marginBottom: 2,
  },
  textoLimpiar: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold'
  },
  botonBanos: {
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 5,
  },
  botonBanosActivo: {
    backgroundColor: '#007AFF', 
  },
  botonTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultadosContainer: {
    backgroundColor: 'white',
    marginTop: 5,
    borderRadius: 8,
    maxHeight: 150,
    elevation: 5,
  },
  resultadoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultadoTexto: {
    fontSize: 16,
    color: '#333333', // Texto oscuro para los resultados
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: '#007AFF',
    borderRadius: 50,
  }
});

export default memo(MapScreen)