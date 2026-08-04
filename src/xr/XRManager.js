import { XRButton } from "three/examples/jsm/webxr/XRButton.js";


export default class XRManager {


    constructor(renderer){


        this.renderer = renderer;


        this.enableXR();


    }



    enableXR(){


        this.renderer.xr.enabled = true;


        document.body.appendChild(
            XRButton.createButton(
                this.renderer
            )
        );


    }


}