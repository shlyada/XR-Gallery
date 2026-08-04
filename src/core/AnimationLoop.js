export default class AnimationLoop {


    constructor(callback){

        this.callback = callback;

    }


    start(){

        const loop = () => {

            this.callback();

            requestAnimationFrame(loop);

        };


        loop();

    }

}