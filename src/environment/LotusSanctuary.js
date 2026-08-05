import * as THREE from "three";


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


        this.createPlaceholderWorld();


    }



    createPlaceholderWorld(){

        this.createTerrain();

        this.createPond();

        this.createWaterfallArea();

        this.createForestBoundary();

    }



    createPond(){

        const geometry = new THREE.CircleGeometry(
            5,
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