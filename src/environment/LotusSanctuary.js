import * as THREE from "three";
import { EnvironmentLoader } from "./EnvironmentLoader.js";

export class LotusSanctuary {

    constructor(scene){


        this.scene = scene;


        this.group =
            new THREE.Group();


        this.group.name =
            "Lotus Sanctuary";


        scene.add(
            this.group
        );


        this.loader =
            new EnvironmentLoader(
                scene
            );


        this.createPlaceholderWorld();


        this.loadAssets()
            .catch(error => {

                console.error(
                    "Asset loading failed:",
                    error
                );

            });


    }

    async loadAssets(){


        await this.loader.load(

            "Main Tree",

            "/models/vegetation/treeGN.glb",

            [-8,0,-5],

            0.15

        );



        await this.loader.load(

            "Forest Tree",

            "/models/vegetation/forestPack.glb",

            [8,0,-8],

            0.12

        );



        await this.loader.load(

            "Lotus Flower",

            "/models/flowers/lotus.glb",

            [0,0,1],

            0.08

        );



        await this.loader.load(

            "Butterfly",

            "/models/creatures/butterfly.glb",

            [2,2,0],

            0.05

        );


    }



    createTerrain(){


        const geometry =
            new THREE.CircleGeometry(
                20,
                64
            );


        const material =
            new THREE.MeshStandardMaterial({

                color:0x557755,

                roughness:1

            });



        const terrain =
            new THREE.Mesh(
                geometry,
                material
            );


        terrain.rotation.x =
            -Math.PI/2;


        terrain.name =
            "Sanctuary Ground";


        this.group.add(
            terrain
        );


    }



    createPond(){

        const geometry = new THREE.CircleGeometry(
            7,
            64
        );


        const material = new THREE.MeshPhysicalMaterial({

            color:0x2299aa,

            transparent:true,

            opacity:0.65,

            roughness:0.1,

            metalness:0.1

        });



        const pond = new THREE.Mesh(
            geometry,
            material
        );


        pond.rotation.x=-Math.PI/2;


        pond.position.set(
            0,
            0.03,
            2
        );


        pond.name="Lotus Pond";


        this.group.add(pond);


        this.pond = pond;

    }



    createWaterfallArea(){


        const rockGeometry =
            new THREE.BoxGeometry(
                5,
                4,
                2
            );


        const rockMaterial =
            new THREE.MeshStandardMaterial({

                color:0x555555

            });



        const waterfallRock =
            new THREE.Mesh(
                rockGeometry,
                rockMaterial
            );


        waterfallRock.position.set(
            0,
            2,
            -8
        );


        waterfallRock.name=
        "Waterfall Rock Formation";



        this.group.add(
            waterfallRock
        );



        const waterGeometry =
            new THREE.PlaneGeometry(
                2,
                4
            );



        const waterMaterial =
            new THREE.MeshPhysicalMaterial({

                color:0x66ccff,

                transparent:true,

                opacity:0.8

            });



        const waterfall =
            new THREE.Mesh(
                waterGeometry,
                waterMaterial
            );



        waterfall.position.set(
            0,
            2,
            -6.9
        );


        waterfall.name="Waterfall";


        this.group.add(waterfall);



    }

    
    createPlaceholderWorld(){

        // Temporary placeholder world
        // Real assets will replace these

        this.createPond();

        this.createTerrain();

    }


    createForestBoundary(){


        const treeMaterial =
            new THREE.MeshStandardMaterial({

                color:0x226622

            });



        for(let i=0;i<25;i++){


            const tree =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        1,
                        5,
                        8
                    ),

                    treeMaterial

                );



            const angle =
                Math.random()*Math.PI*2;



            const radius =
                12 + Math.random()*5;



            tree.position.set(

                Math.cos(angle)*radius,

                2.5,

                Math.sin(angle)*radius

            );


            tree.name=
            "Sanctuary Tree";


            this.group.add(tree);


        }



    }


}