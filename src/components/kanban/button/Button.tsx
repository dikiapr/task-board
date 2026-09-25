import { IonIcon } from '@ionic/react';
import './button.css';

type Variant = 'primary' | 'soft' | 'ghost' | 'danger' | 'overlay';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant;
  icon?: string;
  block?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant, icon, block, type = 'button', className, children, ...rest }) => (
  <button
    type={type}
    className={['k-btn', `k-btn--${variant}`, block && 'k-btn--block', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {icon && <IonIcon icon={icon} aria-hidden="true" />}
    {children}
  </button>
);

export default Button;
