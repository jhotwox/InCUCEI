import { Input } from '../'
import { useTheme } from 'react-native-paper';

export default ({ search, setSearch, placeholder, rightIcon = "magnify", style = {} }) => {
  const theme = useTheme()
  
  return (
    <Input
      placeholder={placeholder}
      rightIcon={rightIcon}
      value={search}
      onChangeText={setSearch}
      style={{
        // SearchInput styles
        backgroundColor: theme.colors.surfaceVariant, // Fondo claro
        borderRadius: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        fontSize: 14,
        fontWeight: "bold",
        color: theme.colors.onSurfaceVariant,
        ...style,
      }}
      underlineColor="transparent"
      activeUnderlineColor="transparent"
    />
  )
}