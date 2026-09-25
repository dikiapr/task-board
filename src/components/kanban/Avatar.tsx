import type { Member } from '../../types/task';
import { getMember } from '../../data/constants';

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

type Size = 'sm' | 'md';

export const MemberAvatar: React.FC<{ member: Member; size?: Size }> = ({ member, size = 'sm' }) => (
  <span
    className={`k-avatar k-avatar--${size}`}
    style={{ backgroundColor: member.color }}
    title={member.name}
    aria-label={member.name}
  >
    {initials(member.name)}
  </span>
);

interface AvatarStackProps {
  memberIds: string[];
  max?: number;
  size?: Size;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ memberIds, max = 3, size = 'sm' }) => {
  const members = memberIds.map(getMember).filter((m): m is Member => Boolean(m));
  if (members.length === 0) return null;

  const visible = members.slice(0, max);
  const hidden = members.slice(max);

  return (
    <span className="k-avatar-stack">
      {visible.map((m) => (
        <MemberAvatar key={m.id} member={m} size={size} />
      ))}
      {hidden.length > 0 && (
        <span
          className={`k-avatar k-avatar--${size} k-avatar--more`}
          title={hidden.map((m) => m.name).join(', ')}
        >
          +{hidden.length}
        </span>
      )}
    </span>
  );
};
