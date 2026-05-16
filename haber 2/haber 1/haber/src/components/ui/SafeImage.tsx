'use client'

import Image from 'next/image'
import { useState } from 'react'
import Icon from '@/components/ui/Icon'

const ALLOWED_IMAGE_HOSTS = new Set([
  'image.hurimg.com',
  'iaahbr.tmgrup.com.tr',
  'iatkv.tmgrup.com.tr',
  'media.cumhuriyet.com.tr',
  'trthaberstatic.cdn.wp.trt.com.tr',
  'sozcu01.sozcucdn.com',
  'im.haberturk.com',
  'images.ntv.com.tr',
  'i20.haber7.net',
])

type SafeImageProps = {
  src?: string | null
  alt: string
  className?: string
  wrapperClassName?: string
  mode?: 'optimized' | 'native'
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  fallbackLabel?: string
}

function canOptimize(src: string) {
  try {
    return ALLOWED_IMAGE_HOSTS.has(new URL(src).hostname)
  } catch {
    return false
  }
}

function Placeholder({
  alt,
  className,
  fallbackLabel,
}: Pick<SafeImageProps, 'alt' | 'className' | 'fallbackLabel'>) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#1a2531,#0a1018)] text-white/20 ${className || ''}`}
    >
      <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(120deg,rgba(255,255,255,0.06)_0%,transparent_30%,rgba(56,189,248,0.12)_66%,transparent_100%)]" />
      <div className="absolute inset-x-8 bottom-8 top-10 rounded-[32px] border border-white/10 bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.22)]" />
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <span className="z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-100 backdrop-blur-xl">
          <Icon name="image" className="h-5 w-5" />
        </span>
        <span className="z-10 text-[11px] font-black uppercase tracking-[0.22em] text-white/55">
          {fallbackLabel || alt}
        </span>
      </div>
    </div>
  )
}

export default function SafeImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  mode = 'optimized',
  width,
  height,
  priority = false,
  sizes,
  fallbackLabel,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false)
  const normalizedSrc = typeof src === 'string' && src.trim() ? src.trim() : null
  const useOptimized = Boolean(normalizedSrc && mode === 'optimized' && canOptimize(normalizedSrc))

  return (
    <div className={wrapperClassName}>
      {!normalizedSrc || failed ? (
        <Placeholder alt={alt} className={className} fallbackLabel={fallbackLabel} />
      ) : useOptimized ? (
        <Image
          src={normalizedSrc}
          alt={alt}
          fill={!width || !height}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={className}
          onError={() => setFailed(true)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalizedSrc}
          alt={alt}
          className={className}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
