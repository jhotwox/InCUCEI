// generaNombresMateria.js
function quitarTildes(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function capitalizar(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

function generarVariantes(nombreMateria) {
  let base = quitarTildes(nombreMateria.trim());
  // Quitar 'La' en cualquier parte
  base = base.replace(/\bLa\b/gi, '').replace(/ +/g, ' ').trim();
  // Unificar 'de' (no duplicar)
  base = base.replace(/(de)( de)+/gi, 'de');
  // Descapitalizar 'de' (si aparece como 'De')
  base = base.replace(/\bDe\b/g, 'de');

  const palabras = base.split(' ');
  const variantes = new Set();

  // Frases completas
  variantes.add(capitalizar(base));
  variantes.add(capitalizar(base.replace(/ de /gi, ' ')));
  variantes.add(capitalizar(base.replace(/ de /gi, '')));

  // Variaciones con "de"
  if (palabras.length > 2) {
    let resto = palabras.slice(1).join(' ');
    resto = resto.replace(/\bLa\b/gi, '').replace(/ +/g, ' ').trim();
    resto = resto.replace(/(de)( de)+/gi, 'de').replace(/\bDe\b/g, 'de');
    variantes.add(capitalizar(`Admin de ${resto}`));
    variantes.add(capitalizar(`Admin ${resto}`));
    variantes.add(capitalizar(`Ad. de ${resto}`));
    variantes.add(capitalizar(`Ad. ${resto}`));
    variantes.add(capitalizar(`Ad de ${resto}`));
    variantes.add(capitalizar(`Ad ${resto}`));
  }

  // Abreviaciones
  const iniciales = palabras.map(p => p[0] ? p[0].toUpperCase() : '').join('');
  variantes.add(iniciales);
  variantes.add(`A${palabras.map(p => p[0] ? p[0].toUpperCase() : '').join('')}`);

  // Variaciones con puntos
  variantes.add(capitalizar(base.replace(/(\w)\w*/g, m => m[0] + '.')));

  // Variaciones con "Admin" y "Ad."
  variantes.add(capitalizar(base.replace(palabras[0], 'Admin')));
  variantes.add(capitalizar(base.replace(palabras[0], 'Ad.')));
  variantes.add(capitalizar(base.replace(palabras[0], 'Ad')));

  // Singular/plural si aplica
  if (palabras[palabras.length - 1].endsWith('s')) {
    variantes.add(capitalizar(base.replace(/s$/, '')));
  }

  // Variaciones con "de" y sin "de"
  variantes.add(capitalizar(base.replace(/ de /gi, ' ')));
  variantes.add(capitalizar(base.replace(/ de /gi, '')));

  // Variaciones con "de" y "de la" (pero quitando 'La' si aparece)
  variantes.add(capitalizar(base.replace(/ de /gi, ' de la ').replace(/\bLa\b/gi, '').replace(/ +/g, ' ').trim()));

  // Variaciones con "Servidores" a "Servidor" si aplica
  if (base.includes('Servidores')) {
    variantes.add(capitalizar(base.replace('Servidores', 'Servidor')));
  }

  // Post-procesar variantes para quitar 'La', duplicados de 'de', y descapitalizar 'de'
  const procesadas = Array.from(variantes).map(v =>
    v.replace(/\bLa\b/gi, '').replace(/ +/g, ' ').trim()
     .replace(/(de)( de)+/gi, 'de')
     .replace(/\bDe\b/g, 'de')
  );
  // Quitar duplicados y devolver como array
  return Array.from(new Set(procesadas));
}

// Ejemplo de uso:
const nombreMateria = "administracion de servidores";
console.log(JSON.stringify(generarVariantes(nombreMateria), null, 2));