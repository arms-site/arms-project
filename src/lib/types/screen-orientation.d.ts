// src/lib/types/screen-orientation.d.ts
// Type definitions for Screen Orientation and Fullscreen APIs

declare global {
  interface Screen {
    orientation?: {
      lock?: (orientation: OrientationLockType) => Promise<void>;
      unlock?: () => void;
      angle?: number;
      type?: string;
    };
    // Legacy orientation APIs
    lockOrientation?: (orientation: string | string[]) => boolean;
    unlockOrientation?: () => boolean;
    // Mozilla-specific
    mozLockOrientation?: (orientation: string | string[]) => boolean;
    mozUnlockOrientation?: () => boolean;
    // Microsoft-specific
    msLockOrientation?: (orientation: string | string[]) => boolean;
    msUnlockOrientation?: () => boolean;
  }

  interface Document {
    // Webkit-specific fullscreen
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void>;
    webkitFullscreenEnabled?: boolean;
    
    // Mozilla-specific fullscreen
    mozFullScreenElement?: Element | null;
    mozCancelFullScreen?: () => Promise<void>;
    mozFullScreenEnabled?: boolean;
    
    // Microsoft-specific fullscreen
    msFullscreenElement?: Element | null;
    msExitFullscreen?: () => Promise<void>;
    msFullscreenEnabled?: boolean;
  }

  interface Element {
    // Webkit-specific fullscreen
    webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
    webkitRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
    
    // Mozilla-specific fullscreen
    mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
    
    // Microsoft-specific fullscreen
    msRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
  }

  // Standard orientation lock types
  type OrientationLockType = 
    | 'any'
    | 'natural'
    | 'landscape'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';
}

export {};