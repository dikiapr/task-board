import { useState } from 'react';

export const usePopover = () => {
  const [state, setState] = useState<{ isOpen: boolean; event?: Event }>({ isOpen: false });

  return {
    open: (e: React.MouseEvent) => setState({ isOpen: true, event: e.nativeEvent }),
    close: () => setState({ isOpen: false }),
    props: {
      isOpen: state.isOpen,
      event: state.event,
      onDidDismiss: () => setState({ isOpen: false }),
    },
  };
};
