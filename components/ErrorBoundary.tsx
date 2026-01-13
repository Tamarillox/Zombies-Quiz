import React from 'react';

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  props: React.PropsWithChildren<{}>;
  state: State;
  // Minimal typing for setState used in this simple boundary
  setState: (s: Partial<State>) => void;

  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log so devs can see it in the terminal / devtools
    console.error('Uncaught error in component tree:', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-grungeGray/90 border-2 border-bloodRed p-6 rounded-lg text-left max-w-2xl w-full">
            <h2 className="font-horror text-3xl text-bloodRed mb-4">Unerwarteter Fehler</h2>
            <p className="text-sm text-gray-300 mb-4">Es ist ein Fehler aufgetreten. Details werden unten angezeigt.</p>
            <details className="bg-black/60 p-3 rounded text-xs text-gray-200" style={{ whiteSpace: 'pre-wrap' }}>
              <summary className="cursor-pointer">Fehlerdetails anzeigen</summary>
              {this.state.error && <div className="mt-2">{this.state.error.toString()}</div>}
              {this.state.info && <div className="mt-2">{this.state.info.componentStack}</div>}
            </details>
            <div className="mt-4 flex gap-2">
              <button onClick={() => location.reload()} className="px-4 py-2 bg-bloodRed text-white rounded">Neu laden</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;
