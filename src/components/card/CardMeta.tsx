import { IonIcon } from '@ionic/react';
import './card.css';

interface CardMetaProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

const CardMeta: React.FC<CardMetaProps> = ({ icon, title, children }) => (
  <span className="k-meta" title={title}>
    <IonIcon icon={icon} aria-hidden="true" />
    {children}
  </span>
);

export default CardMeta;
