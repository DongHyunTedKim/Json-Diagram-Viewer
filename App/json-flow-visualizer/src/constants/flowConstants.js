export const FLOW_CONSTANTS = {
    NODE: {
        SIZE: {
            MIN_WIDTH: 120,
            MIN_HEIGHT: 60,
            DEFAULT_WIDTH: 150,
            DEFAULT_HEIGHT: 40
        },
        PADDING: {
            HORIZONTAL: 40,
            VERTICAL: 30
        },
        CHILD_SPACING: 30,
        LAYOUT: {
            RANKDIR: 'LR',
            RANKSEP: 250,
            NODESEP: 80,
            MARGIN: {
                X: 30,
                Y: 50
            }
        },
        STYLE: {
            BORDER_RADIUS: '3px',
            SHADOW: '0 1px 4px rgba(0, 0, 0, 0.1)',
            HOVER_SHADOW: '0 3px 8px rgba(0, 0, 0, 0.15)',
            BORDER_COLOR: '#1a192b',
            HOVER_BORDER_COLOR: '#ff0072',
            BACKGROUND_COLORS: {
                LAYER1: 'rgba(255, 0, 0, 0.2)',
                LAYER2: 'rgba(0, 255, 0, 0.2)',
                LAYER3: 'rgba(255, 255, 255, 0.2)',
                LAYER4: 'rgba(0, 0, 255, 0.2)',
                LAYER5: 'rgba(255, 255, 0, 0.2)',
                LAYER6: 'rgba(255, 0, 255, 0.2)',
                LAYER7: 'rgba(0, 255, 255, 0.2)',
                LAYER8: 'rgba(128, 0, 0, 0.2)',
                LAYER9: 'rgba(0, 128, 0, 0.2)',
                LAYER10: 'rgba(0, 0, 128, 0.2)'
            }
        }
    },
    EDGE: {
        STYLE: {
            STROKE_WIDTH: 1.5,
            STROKE_COLOR: '#333',
            HOVER_STROKE_WIDTH: 2,
            HOVER_STROKE_COLOR: '#ff0072',
            SELECTED_STROKE_WIDTH: 2.5,
            OPACITY: 0.7,
            HOVER_OPACITY: 1
        },
        MARKER: {
            WIDTH: 20,
            HEIGHT: 20,
            COLOR: '#333'
        }
    },
    HANDLE: {
        SIZE: {
            WIDTH: 8,
            HEIGHT: 8
        },
        STYLE: {
            BACKGROUND_COLOR: '#000000',
            BORDER: '2px solid white',
            BORDER_RADIUS: '50%',
            HOVER_SCALE: 1.1
        }
    }
}; 