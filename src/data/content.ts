export interface Discipline {
  id: 'video' | 'motion' | 'voice';
}

/** Copy lives in `i18n/translations.ts` under `disc.<id>.*`. */
export const DISCIPLINES: Discipline[] = [{ id: 'video' }, { id: 'motion' }, { id: 'voice' }];

export interface ServiceFrame {
  /** Art-directed 16:9 crop for desktop and tablet. */
  src: string;
  /** Art-directed 4:3 crop for narrow screens. */
  srcPhone: string;
  altKey: string;
}

/** Studio stills in the order the Services frame crossfades through. */
export const SERVICE_FRAMES: ServiceFrame[] = [
  {
    src: 'images/service-video.jpg',
    srcPhone: 'images/service-video-phone.jpg',
    altKey: 'services.frame.video',
  },
  {
    src: 'images/service-motion.jpg',
    srcPhone: 'images/service-motion-phone.jpg',
    altKey: 'services.frame.motion',
  },
  {
    src: 'images/service-voice.jpg',
    srcPhone: 'images/service-voice-phone.jpg',
    altKey: 'services.frame.voice',
  },
  {
    src: 'images/service-delivery.jpg',
    srcPhone: 'images/service-delivery-phone.jpg',
    altKey: 'services.frame.delivery',
  },
];

/** Copy lives in `i18n/translations.ts` under `process.<index>.*`. */
export const PROCESS_STEPS = [{ index: '1' }, { index: '2' }, { index: '3' }, { index: '4' }, { index: '5' }];

/** Mailto recipient for the Contact brief. Not rendered as visible-copy text. */
export const EMAIL = 'hello@valkyhyn.com';
