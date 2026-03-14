import { Button, Text } from "react-native-paper"
import { memo, useState, useRef, useEffect } from "react"
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { PLACES } from '../../constants/places';
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken('pk.eyJ1IjoiZ2Vyc29uMzAiLCJhIjoiY21mZGZxZ3ppMDc2YzJxcHo2enQxbnNwayJ9.uvEc9toQvd04tBlJ6Ko5iA');

const MapScreen = () => {
  const [search, setSearch] = useState('');
  const [showRestrooms, setShowRestrooms] = useState(false);
  const cameraRef = useRef(null);
  const params = useLocalSearchParams();

  const centerCampus = [-103.32473086798036, 20.657210257040575];

  const searchResults = search
    ? PLACES.filter(place => place.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const goToLocation = (coordinates) => {
    cameraRef.current?.setCamera({
      centerCoordinate: coordinates,
      zoomLevel: 18,
      animationDuration: 1500,
    });
    setSearch('');
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
          goToLocation(place.coord)
        }, 1000)
      }
    }
  }, [params.focusPlace, params.placeId])

  // 🛠️ TRUCO DE DESARROLLADOR: Obtener coordenadas exactas
  const onTouchCoordinates = (event) => {
    const coordinates = event.geometry.coordinates;
    console.log(`📍 Coordenadas tocadas: [${coordinates[0]}, ${coordinates[1]}]`);
  };

  const restroomsGeoJSON = {
    type: 'FeatureCollection',
    features: PLACES.filter(l => l.type === 'baño').map(bano => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: bano.coord },
      properties: { nombre: bano.name }
    }))
  };
  
  return (
    <View style={styles.container}>
      
      <StatusBar style={"dark"} />
      
      <Mapbox.MapView 
        style={styles.map} 
        styleURL={Mapbox.StyleURL.Street}
        onPress={onTouchCoordinates} // <-- El sensor que detecta tus toques
      >
        <Mapbox.LocationPuck
          puckBearing="heading"
        />
        
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
              onChangeText={setSearch}
            />
            {/* Show X if they are text */}
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.botonLimpiar}>
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
                <TouchableOpacity style={styles.resultadoItem} onPress={() => goToLocation(item.coord)}>
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
  }
});

export default memo(MapScreen)