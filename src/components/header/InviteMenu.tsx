import { useState } from 'react';
import { IonPopover } from '@ionic/react';
import { personAddOutline } from 'ionicons/icons';
import { MEMBERS } from '../../data/constants';
import MemberAvatar from '../avatar/MemberAvatar';
import Button from '../button/Button';
import { usePopover } from '../../hooks/usePopover';

const InviteMenu: React.FC<{ onInvite: (email: string) => void }> = ({ onInvite }) => {
  const menu = usePopover();
  const [email, setEmail] = useState('');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <>
      <Button variant="soft" icon={personAddOutline} onClick={menu.open}>
        Invite
      </Button>

      <IonPopover {...menu.props} className="k-popover k-popover--wide">
        <div className="k-pop">
          <h3 className="k-pop__title">Team members</h3>
          <ul className="k-member-list">
            {MEMBERS.map((m) => (
              <li key={m.id}>
                <MemberAvatar member={m} size="md" />
                <span>{m.name}</span>
              </li>
            ))}
          </ul>
          <form
            className="k-pop__row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!emailValid) return;
              onInvite(email.trim());
              setEmail('');
              menu.close();
            }}
          >
            <input
              className="k-input"
              type="email"
              placeholder="name@company.com"
              aria-label="Email to invite"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={!emailValid}>
              Invite
            </Button>
          </form>
        </div>
      </IonPopover>
    </>
  );
};

export default InviteMenu;
