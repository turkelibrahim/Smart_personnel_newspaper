import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.hurimg.com' },
      { protocol: 'https', hostname: 'iaahbr.tmgrup.com.tr' },
      { protocol: 'https', hostname: 'iatkv.tmgrup.com.tr' },
      { protocol: 'https', hostname: 'media.cumhuriyet.com.tr' },
      { protocol: 'https', hostname: 'trthaberstatic.cdn.wp.trt.com.tr' },
      { protocol: 'https', hostname: 'sozcu01.sozcucdn.com' },
      { protocol: 'https', hostname: 'im.haberturk.com' },
      { protocol: 'https', hostname: 'images.ntv.com.tr' },
      { protocol: 'https', hostname: 'i20.haber7.net' },
    ],
  },
}

export default nextConfig
