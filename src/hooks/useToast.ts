import { useIonToast } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { HEADER_ID } from '../data/constants';

interface ToastOptions {
  icon?: string;
  color?: string;
  undo?: () => void;
}

export const useToast = () => {
  const [presentToast, dismissToast] = useIonToast();

  return async (message: string, options: ToastOptions = {}) => {
    await dismissToast();
    return presentToast({
      message,
      duration: 2500,
      position: 'top',
      positionAnchor: HEADER_ID,
      cssClass: 'k-toast',
      icon: options.icon ?? checkmarkCircleOutline,
      color: options.color,
      swipeGesture: 'vertical',
      buttons: options.undo ? [{ text: 'Undo', handler: options.undo }] : undefined,
    });
  };
};
