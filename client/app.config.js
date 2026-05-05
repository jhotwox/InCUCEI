// Dynamic Expo config to avoid hard failing when google-services.json isn't present.
// When you add ./google-services.json, this will automatically enable it for Android builds.

const fs = require('fs')
const path = require('path')

module.exports = ({ config }) => {
  const googleServicesPath = path.join(__dirname, 'google-services.json')

  if (fs.existsSync(googleServicesPath)) {
    config.android = config.android || {}
    config.android.googleServicesFile = './google-services.json'
  }

  return config
}
