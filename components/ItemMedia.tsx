
import React, { useState } from 'react';

interface ItemMediaProps {
  source: string;
  className?: string;
  alt?: string;
  fit?: 'cover' | 'contain' | 'scale-down';
}

const ItemMedia: React.FC<ItemMediaProps> = ({ source, className = "", alt = "Item", fit = 'contain' }) => {
  const [hasError, setHasError] = useState(false);

  // Robustes Erkennen, ob es sich um einen Bildpfad/URL handelt.
  const isUrl =
    typeof source === 'string' && (
      source.startsWith('http') ||
      source.startsWith('data:') ||
      source.startsWith('/') ||
      source.startsWith('./') ||
      source.startsWith('../') ||
      /\.(png|jpe?g|gif|webp|svg)$/i.test(source)
    );

  const fitClass = fit === 'contain' ? 'object-contain object-center' : fit === 'scale-down' ? 'object-scale-down object-center' : 'object-cover';

  // Wenn ein Bild angegeben ist und noch kein Ladefehler passiert ist, zeige <img>
  if (isUrl && !hasError) {
    return (
      <img
        src={source}
        alt={alt}
        className={`w-full h-full ${fitClass} ${className}`}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  // Fallback: Zeige Alt-Text oder ein Emoji, statt das Element komplett zu verstecken.
  return <span className={`flex items-center justify-center text-center ${className}`}>{alt}</span>;
};

export default ItemMedia;
