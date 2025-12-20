import Markdown from 'react-native-markdown-display'
import { useTheme, Text } from 'react-native-paper'
import { Linking } from 'react-native'
import { useToast } from '../../contexts/Toast.context';
import * as Clipboard from 'expo-clipboard';

/**
 * Componente para renderizar texto con formato Markdown.
 * Usado principalmente para mensajes del chatbot Gemini.
 * 
 * @param {Object} props
 * @param {string} props.children - Texto en formato Markdown
 * @param {Object} props.style - Estilos adicionales
 * @returns {JSX.Element}
 */
export default ({ children, style }) => {
  const theme = useTheme()
  const { showToast } = useToast()

  const handleLinkLongPress = async (url) => {
    let cleanUrl = url
    if (url.startsWith('mailto:'))
      cleanUrl = url.replace('mailto:', '')
    else if (url.startsWith('tel:'))
      cleanUrl = url.replace('tel:', '')

    await Clipboard.setStringAsync(cleanUrl)
    showToast('Enlace copiado al portapapeles', 'success')
  }

  const handleLinkPress = (url) => {
    Linking.openURL(url)
  }


  const markdownStyles = {
    body: {
      color: theme.colors.onSurface,
      fontSize: 14,
    },
    heading1: {
      color: theme.colors.primary,
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 8,
    },
    heading2: {
      color: theme.colors.primary,
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 6,
    },
    code_inline: {
      backgroundColor: theme.colors.surfaceVariant,
      color: theme.colors.onSurfaceVariant,
      padding: 4,
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: 'monospace',
    },
    fence: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: 'monospace',
    },
    link: {
      fontWeight: 'bold',
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: theme.colors.surfaceVariant,
      borderLeftColor: theme.colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 4,
      marginVertical: 8,
    },
    list_item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 2,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
  }

  const rules = {
    link: (node, children, parent, styles) => {
      const url = node.attributes.href
      return (
        <Text  
          key={node.key}
          style={styles.link}
          onPress={() => handleLinkPress(url)}
          onLongPress={() => handleLinkLongPress(url)}
        >
          {children}
        </Text>
      )
    }
  }

  return (
    <Markdown style={{ ...markdownStyles, ...style }} rules={rules}>
      {children}
    </Markdown>
  )
}