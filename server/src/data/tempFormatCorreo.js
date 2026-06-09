// Script to read contact.json and format it to be used in the chatbot responses with markdown
import contact from './contact.json' with { type: "json" }
import { writeFileSync } from 'fs'

// Usamos reduce para mantener la estructura de OBJETO y no un Array
export const formattedContactData = Object.entries(contact).reduce((acc, [key, value]) => {
  
  // Verificamos si el valor es un objeto y si contiene la propiedad 'correo'
  if (value && typeof value === 'object' && value.correo) {
    acc[key] = {
      ...value,
      correo: `[${value.correo}](mailto:${value.correo})` // Sobrescribimos 'correo' con markdown
    }
  } else {
    // Si no tiene correo (como redes_sociales o cucei), lo dejamos exactamente igual
    acc[key] = value
  }

  return acc;
}, {})

// Guardamos manteniendo el formato de objeto original
writeFileSync('./formattedContactData.json', JSON.stringify(formattedContactData, null, 2))

console.log('Formatted contact data saved to formattedContactData.json')