import React from 'react';

class ModelErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            message: ''
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            message: error?.message || 'Model loading failed.'
        };
    }

    componentDidCatch(error) {
        if (typeof this.props.onError === 'function') {
            this.props.onError(error?.message || 'Model loading failed.');
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false, message: '' });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full w-full flex items-center justify-center p-6 text-center text-sm text-red-200 bg-red-950/40 rounded-xl border border-red-800/50">
                    Could not render the model. Upload a valid .glb or self-contained .gltf file.
                    {this.state.message ? ` (${this.state.message})` : ''}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ModelErrorBoundary;
