import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'nootain.id - Kasir Sahabat UMKM',
    short_name: 'nootain.id',
    description: 'Aplikasi Kasir dan Manajemen Produk Terbaik untuk UMKM.',
    start_url: '/',
    display: 'fullscreen',
    background_color: '#ffffff',
    theme_color: '#44ACFF',
    icons: [
      {
        src: '/logo.webp',
        sizes: 'any',
        type: 'image/webp',
      },
    ],
  }
}
