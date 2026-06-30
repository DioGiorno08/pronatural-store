export function getCloudinaryUrl(publicId, options = 'f_auto,q_auto,w_800') {
  if (!publicId) {
    return 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=800&auto=format&fit=crop';
  }
  let idToUse = publicId;
  if (Array.isArray(idToUse)) {
    if (idToUse.length === 0) return 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=800&auto=format&fit=crop';
    idToUse = idToUse[0];
  }
  if (typeof idToUse === 'object' && idToUse !== null) {
     idToUse = idToUse.url || idToUse.publicId || idToUse.public_id || '';
  }
  if (typeof idToUse !== 'string') {
     return 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=800&auto=format&fit=crop';
  }
  if (idToUse.startsWith('http://') || idToUse.startsWith('https://') || idToUse.startsWith('data:')) {
    return idToUse;
  }
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'pronatural';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${options}/${idToUse}`;
}
