export default class AnimationLoop {


    constructor(renderer, callback){

        this.renderer = renderer;
        this.callback = callback;

        this.start();

    }


    start(){

        this.renderer.setAnimationLoop(
            () => {

                this.callback();

            }
        );

    }


}