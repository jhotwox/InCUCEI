export const createFileObjectFromUrl = (url, type) => {
  if (!url) return null

  return {
    uri: url.startsWith("http")
      ? url
      : `http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/${url}`,
    name: `${type}_image.jpg`,
    type: "image/jpeg",
    isUploaded: true,
    uploadedUrl: url,
  }
}