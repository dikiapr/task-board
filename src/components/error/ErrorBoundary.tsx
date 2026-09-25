import { Component, type ErrorInfo, type ReactNode } from 'react';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { useBoardStore } from '../../store/useBoardStore';
import Button from '../button/Button';
import './error.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Shows a recovery screen instead of a blank page when rendering throws. The usual
 * culprit is board data in storage the app cannot render, so it offers a reset too.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  private retry = () => this.setState({ error: null });

  private resetBoard = () => {
    useBoardStore.getState().resetBoard();
    this.retry();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="k-error" role="alert">
        <IonIcon icon={alertCircleOutline} className="k-error__icon" aria-hidden="true" />
        <h1 className="k-error__title">Something went wrong</h1>
        <p className="k-error__message">
          The board could not be displayed. Try again, or reset the board if the problem keeps coming back.
        </p>
        <p className="k-error__detail">{error.message}</p>
        <div className="k-error__actions">
          <Button variant="primary" icon={refreshOutline} onClick={this.retry}>
            Try again
          </Button>
          <Button variant="danger" onClick={this.resetBoard}>
            Reset board
          </Button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
