// npm run webserver   npm run watch
var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        /**
         * Constructor
         */
        function Main() {
            this.engine = new BABYLON.Engine(document.getElementById('renderCanvas'));
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.enablePhysics(new BABYLON.Vector3(0, -50.81, 0), new BABYLON.CannonJSPlugin());
            this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(35, 35, 35), this.scene);
            this.camera.attachControl(this.engine.getRenderingCanvas());
            this.camera.setTarget(new BABYLON.Vector3(0, 15, 0));
            this.light = new BABYLON.PointLight('light', new BABYLON.Vector3(150, 150, 150), this.scene);
            this.ground = BABYLON.Mesh.CreateGround('ground', 512, 512, 32, this.scene);
            // Create materials
            var groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
            this.ground.material = groundMaterial;
            var grassTexture = new BABYLON.Texture("assets/grass.jpg", this.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            grassTexture.uScale = grassTexture.vScale = 100;
            groundMaterial.diffuseTexture = grassTexture;
            groundMaterial.diffuseColor = BABYLON.Color3.Yellow();
            groundMaterial.specularColor = BABYLON.Color3.Black(); // new Color3(0, 0, 0);
            this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0,
                restitution: 1,
                friction: 0.5
            });
            // Skybox
            this.skybox = BABYLON.Mesh.CreateBox("skybox", 10000, this.scene, false, BABYLON.Mesh.BACKSIDE);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyboxMaterial", this.scene);
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/TropicalSunnyDay", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.disableLighting = true;
            this.skybox.infiniteDistance = true;
            this.skybox.material = skyboxMaterial;
            var cube = BABYLON.Mesh.CreateBox('cube', 10, this.scene);
            cube.position = new BABYLON.Vector3(20, 10, 20);
            cube.physicsImpostor = new BABYLON.PhysicsImpostor(cube, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution: 0
            }, this.scene);
            var sphere = BABYLON.Mesh.CreateSphere('sphere', 32, 5, this.scene);
            sphere.position = new BABYLON.Vector3(0, 10, 0);
            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
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
                dragon.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
                // (Math.PI);
                dragon.position = new BABYLON.Vector3(0, 0, -80);
                //this.scene.beginAnimation(newMeshes[0], 0, 100, true, 1.0);
            });
            BABYLON.SceneLoader.ImportMesh("", "./scenes/", "Girl.babylon", this.scene, function (newMeshes2) {
                var loli = newMeshes2[0];
                loli.rotation.y = Math.PI;
                loli.scaling = new BABYLON.Vector3(2, 2, 2);
                loli.position = new BABYLON.Vector3(100, 20, 0);
            });
            var diffuse = new BABYLON.Texture('./assets/diffuse.png', this.scene);
            var normal = new BABYLON.Texture('./assets/normal.png', this.scene);
            var material = new BABYLON.StandardMaterial('cubemat', this.scene);
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
        Main.prototype.setupActions = function (sphere) {
            var _this = this;
            sphere.actionManager = new BABYLON.ActionManager(this.scene);
            sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (evt) {
                var direction = sphere.position.subtract(_this.scene.activeCamera.position);
                sphere.applyImpulse(direction, new BABYLON.Vector3(0, -1, 0));
            }));
        };
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
        Main.prototype.run = function () {
            var _this = this;
            this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    var OceanMaterial = /** @class */ (function () {
        /**
         * Constructor
         * @param scene the scene where to add the material
         */
        function OceanMaterial(scene) {
            var _this = this;
            this.time = 0;
            this.material = new BABYLON.ShaderMaterial('ocean', scene, {
                vertexElement: './shaders/ocean',
                fragmentElement: './shaders/ocean',
            }, {
                attributes: ['position', 'uv'],
                uniforms: ['worldViewProjection', 'time'],
                samplers: ['diffuseSampler1', 'diffuseSampler2'],
                defines: [],
            });
            // Textures
            this.diffuseSampler1 = new BABYLON.Texture('./assets/diffuse.png', scene);
            this.diffuseSampler2 = this.diffuseSampler1.clone(); // new Texture('./assets/diffuse.png', scene);
            // Bind
            this.material.onBind = function (mesh) {
                _this.time += scene.getEngine().getDeltaTime() * 0.003;
                _this.material.setFloat('time', _this.time);
                _this.material.setTexture('diffuseSampler1', _this.diffuseSampler1);
                _this.material.setTexture('diffuseSampler2', _this.diffuseSampler2);
            };
        }
        return OceanMaterial;
    }());
    BABYLON.OceanMaterial = OceanMaterial;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=index.js.map