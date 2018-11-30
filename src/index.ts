module BABYLON {
    export class Main {
        // Public members
        public engine: Engine;
        public scene: Scene;

        public camera: FreeCamera;
        public light: PointLight;

        public ground: GroundMesh;
        public skybox: Mesh;

        /**
         * Constructor
         */
        constructor () {
            this.engine = new Engine(<HTMLCanvasElement> document.getElementById('renderCanvas'));

            this.scene = new Scene(this.engine);
            this.scene.enablePhysics(new Vector3(0, -50.81, 0), new CannonJSPlugin());

            this.camera = new FreeCamera('camera', new Vector3(35, 35, 35), this.scene);
            this.camera.attachControl(this.engine.getRenderingCanvas());
            this.camera.setTarget(new Vector3(0, 15, 0));

            this.light = new PointLight('light', new Vector3(150, 150, 150), this.scene);

            this.ground = <GroundMesh> Mesh.CreateGround('ground', 512, 512, 32, this.scene);
            // Create materials
            var groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
            this.ground.material = groundMaterial;
            var grassTexture = new BABYLON.Texture("assets/grass.jpg", this.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            grassTexture.uScale = grassTexture.vScale = 100;
            groundMaterial.diffuseTexture = grassTexture;
            groundMaterial.diffuseColor = BABYLON.Color3.Yellow();
            groundMaterial.specularColor = BABYLON.Color3.Black(); // new Color3(0, 0, 0);
            this.ground.physicsImpostor = new PhysicsImpostor(this.ground, PhysicsImpostor.BoxImpostor, {
                mass: 0,
                restitution: 1,
                friction: 0.5
            });

            // Skybox
            this.skybox = Mesh.CreateBox("skybox", 1000, this.scene, false, Mesh.BACKSIDE);

            var skyboxMaterial = new StandardMaterial("skyboxMaterial", this.scene);
            skyboxMaterial.reflectionTexture = new CubeTexture("assets/TropicalSunnyDay", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            skyboxMaterial.disableLighting = true;
            this.skybox.infiniteDistance = true;

            this.skybox.material = skyboxMaterial;

            const cube = Mesh.CreateBox('cube', 10, this.scene);
            cube.position = new Vector3(20, 10, 20);
            cube.physicsImpostor = new PhysicsImpostor(cube, PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution: 0                
            }, this.scene);

            const sphere = Mesh.CreateSphere('sphere', 32, 5, this.scene);
            sphere.position = new Vector3(0, 10, 0);
            sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
                mass: 1,
                restitution: 1
            }, this.scene);
            // Create cubes

            // Shadows
            //var shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light);

            // Dude
            BABYLON.SceneLoader.ImportMesh("", "./scenes/", "alduin-dragon.babylon", this.scene, function (newMeshes) {

                var dragon = newMeshes[0];
                
                //for (var index = 0; index < newMeshes.length; index++) {
                //    this.shadowGenerator.getShadowMap().renderList.push(newMeshes[index]);
                //}
                dragon.rotation.y = 0;
                // (Math.PI);
                dragon.position = new BABYLON.Vector3(0, 0, -80);
                   
                //this.scene.beginAnimation(newMeshes[0], 0, 100, true, 1.0);
            });

            const diffuse = new Texture('./assets/diffuse.png', this.scene);
            const normal = new Texture('./assets/normal.png', this.scene);

            const material = new StandardMaterial('cubemat', this.scene);
            material.bumpTexture = normal;
            material.diffuseTexture = diffuse;
            sphere.material = material;
            cube.material = material;

            this.setupActions(sphere);
            //this.setupPhysics(sphere);
        }

        /**
         * Setup action for the given cube
         */
        public setupActions (sphere: Mesh): void {
            sphere.actionManager = new ActionManager(this.scene);
            sphere.actionManager.registerAction(new ExecuteCodeAction(
                ActionManager.OnLeftPickTrigger,
                (evt) => {
                    const direction = sphere.position.subtract(this.scene.activeCamera.position);
                    sphere.applyImpulse(direction, new Vector3(0, -1, 0));
                }
            ));
        }

        /**
         * Setup physics for the given cube
         */
        //public setupPhysics (cube: Mesh): void {
        //    cube.physicsImpostor = new PhysicsImpostor(cube, PhysicsImpostor.BoxImpostor, {
        //        mass: 1
        //    });
        //}

        /**
         * Runs the engine to render the scene into the canvas
         */
        public run () {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        }
    }
}
