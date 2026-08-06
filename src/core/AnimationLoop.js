export class AnimationLoop {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
    }

    start(rendererInstance) {
        rendererInstance.setAnimationLoop((timestamp, frame) => {
            if (this.updateCallback) {
                this.updateCallback(timestamp, frame);
            }
        });
    }

    stop(rendererInstance) {
        rendererInstance.setAnimationLoop(null);
    }
}

export default AnimationLoop;