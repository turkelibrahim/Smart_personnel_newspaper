import type { SVGProps } from 'react'
import { cn } from '@/lib/ui/cn'

export type IconName =
  | 'newspaper'
  | 'search'
  | 'arrow-right'
  | 'arrow-left'
  | 'settings'
  | 'menu'
  | 'close'
  | 'bookmark'
  | 'bookmark-filled'
  | 'print'
  | 'external-link'
  | 'image'
  | 'chevron-down'
  | 'globe'
  | 'chart'
  | 'trophy'
  | 'chip'
  | 'heart'
  | 'palette'
  | 'graduation'
  | 'flask'
  | 'pin'
  | 'sparkles'
  | 'inbox'
  | 'triangle-alert'
  | 'check-circle'
  | 'info'
  | 'refresh'

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
}

export default function Icon({ name, className, ...props }: IconProps) {
  const shared = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: cn('h-4 w-4 shrink-0', className),
    'aria-hidden': true,
    ...props,
  }

  switch (name) {
    case 'search':
      return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
    case 'arrow-right':
      return <svg {...shared}><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></svg>
    case 'arrow-left':
      return <svg {...shared}><path d="M19 12H5" /><path d="m11 19-7-7 7-7" /></svg>
    case 'settings':
      return <svg {...shared}><path d="M12 3v2.5" /><path d="M12 18.5V21" /><path d="m4.9 4.9 1.8 1.8" /><path d="m17.3 17.3 1.8 1.8" /><path d="M3 12h2.5" /><path d="M18.5 12H21" /><path d="m4.9 19.1 1.8-1.8" /><path d="m17.3 6.7 1.8-1.8" /><circle cx="12" cy="12" r="3.5" /></svg>
    case 'menu':
      return <svg {...shared}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>
    case 'close':
      return <svg {...shared}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></svg>
    case 'bookmark':
      return <svg {...shared}><path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3-6 3V5.5a1 1 0 0 1 1-1Z" /></svg>
    case 'bookmark-filled':
      return <svg viewBox="0 0 24 24" fill="currentColor" className={cn('h-4 w-4 shrink-0', className)} aria-hidden={true} {...props}><path d="M7.5 4A1.5 1.5 0 0 0 6 5.5v14a.5.5 0 0 0 .76.43L12 16.7l5.24 3.23a.5.5 0 0 0 .76-.43v-14A1.5 1.5 0 0 0 16.5 4Z" /></svg>
    case 'print':
      return <svg {...shared}><path d="M7 8V4h10v4" /><rect x="5" y="10" width="14" height="7" rx="2" /><path d="M8 17h8v3H8z" /><path d="M17 12.5h.01" /></svg>
    case 'external-link':
      return <svg {...shared}><path d="M14 5h5v5" /><path d="M10 14 19 5" /><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
    case 'image':
      return <svg {...shared}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m21 15-4.5-4.5L7 20" /></svg>
    case 'chevron-down':
      return <svg {...shared}><path d="m6 9 6 6 6-6" /></svg>
    case 'globe':
      return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15.3 15.3 0 0 1 0 18" /><path d="M12 3a15.3 15.3 0 0 0 0 18" /></svg>
    case 'chart':
      return <svg {...shared}><path d="M4 19h16" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-6" /></svg>
    case 'trophy':
      return <svg {...shared}><path d="M8 4h8v3a4 4 0 0 1-8 0Z" /><path d="M6 6H4a2 2 0 0 0 2 4h1" /><path d="M18 6h2a2 2 0 0 1-2 4h-1" /><path d="M12 11v4" /><path d="M9 21h6" /><path d="M10 15h4v3h-4z" /></svg>
    case 'chip':
      return <svg {...shared}><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M9 1v3" /><path d="M15 1v3" /><path d="M9 20v3" /><path d="M15 20v3" /><path d="M20 9h3" /><path d="M20 14h3" /><path d="M1 9h3" /><path d="M1 14h3" /></svg>
    case 'heart':
      return <svg {...shared}><path d="m12 20-1.1-1C6 14.6 3 11.9 3 8.5A4.5 4.5 0 0 1 7.5 4 5 5 0 0 1 12 6.2 5 5 0 0 1 16.5 4 4.5 4.5 0 0 1 21 8.5c0 3.4-3 6.1-7.9 10.5Z" /></svg>
    case 'palette':
      return <svg {...shared}><path d="M12 4a8 8 0 1 0 0 16h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h1a5 5 0 0 0 0-10Z" /><circle cx="7.5" cy="10" r="1" /><circle cx="9.5" cy="7.5" r="1" /><circle cx="14.5" cy="7.5" r="1" /><circle cx="16.5" cy="10" r="1" /></svg>
    case 'graduation':
      return <svg {...shared}><path d="m3 9 9-5 9 5-9 5Z" /><path d="M7 11.5v4.2c0 1.3 2.2 2.3 5 2.3s5-1 5-2.3v-4.2" /></svg>
    case 'flask':
      return <svg {...shared}><path d="M10 3v5l-5.5 9.2A2 2 0 0 0 6.2 20h11.6a2 2 0 0 0 1.7-2.8L14 8V3" /><path d="M8.5 12h7" /></svg>
    case 'pin':
      return <svg {...shared}><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>
    case 'sparkles':
      return <svg {...shared}><path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z" /><path d="m19 14 .8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z" /><path d="m5 14 1 2.3L8.3 17 6 18l-1 2.3L4 18l-2.3-1L4 16.3Z" /></svg>
    case 'inbox':
      return <svg {...shared}><path d="M4 12.5 6.2 6A2 2 0 0 1 8.1 4.5h7.8A2 2 0 0 1 17.8 6l2.2 6.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" /><path d="M4 13h4l1.5 2h5L16 13h4" /></svg>
    case 'triangle-alert':
      return <svg {...shared}><path d="m12 4 8 14H4L12 4Z" /><path d="M12 9v4" /><path d="M12 16h.01" /></svg>
    case 'check-circle':
      return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.3 2.3 4.7-4.8" /></svg>
    case 'info':
      return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="M12 10v5" /><path d="M12 7h.01" /></svg>
    case 'refresh':
      return <svg {...shared}><path d="M20 5v5h-5" /><path d="M4 19v-5h5" /><path d="M6.5 9A7 7 0 0 1 18 6l2 4" /><path d="M17.5 15A7 7 0 0 1 6 18l-2-4" /></svg>
    case 'newspaper':
    default:
      return <svg {...shared}><path d="M6 5.5h10A2.5 2.5 0 0 1 18.5 8V18a2 2 0 0 1-2 2H8a3 3 0 0 1-3-3V8.5A3 3 0 0 1 8 5.5h8.5" /><path d="M8.5 9.5h6" /><path d="M8.5 12.5h6" /><path d="M8.5 15.5h3" /><path d="M5 17a2 2 0 0 0 2 2h10" /></svg>
  }
}
