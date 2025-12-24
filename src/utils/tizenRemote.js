// Tizen Remote Control Utility
const isTizen = () => {
  return typeof window !== 'undefined' && 
         (window.tizen || navigator.userAgent.includes('Tizen'));
};

const TIZEN_KEYS = {
  10009: 'Return',
  37: 'ArrowLeft',
  38: 'ArrowUp', 
  39: 'ArrowRight',
  40: 'ArrowDown',
  13: 'Enter',
  27: 'Escape',
  415: 'Play',
  19: 'Pause',
  413: 'Stop',
  417: 'FastForward',
  412: 'Rewind',
  10252: 'PlayPause',
  427: 'ChannelUp',
  428: 'ChannelDown'
};

const mapTizenKey = (keyCode) => {
  return TIZEN_KEYS[keyCode] || null;
};

export const createKeyHandler = (handlers) => {
  return (event) => {
    let key = event.key;
    
    if (isTizen() && event.keyCode) {
      const tizenKey = mapTizenKey(event.keyCode);
      if (tizenKey) {
        key = tizenKey;
      }
    }
    
    if (handlers[key]) {
      handlers[key](event);
    }
  };
};

export const registerTizenKeys = () => {
  if (isTizen() && window.tizen) {
    try {
      const keys = [
        'Return', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Enter', 'Escape',
        'MediaPlay', 'MediaPause', 'MediaStop', 'MediaPlayPause', 'MediaRewind', 'MediaFastForward'
      ];
      keys.forEach(key => {
        try {
          window.tizen.tvinputdevice.registerKey(key);
        } catch (e) {
          console.warn(`Failed to register Tizen key: ${key}`);
        }
      });
    } catch (error) {
      console.warn('Tizen key registration failed:', error);
    }
  }
};

export { isTizen };