
async function loadEntities() {
    try {
        const response = await fetch('./entities.json');
        const json = await response.json();

        const entities = Object.values(json.entities)
            .flatMap(category => Object.values(category));

        entities.forEach(validateAndAddModel);


    } catch (error) {
        console.error('Error loading entities:', error);
    }
}

function validateAndAddModel(entity) {
    const { latitude, longitude, model, scale, name } = entity;

    if (!latitude || !longitude || !model || !scale) {
        console.warn(`Skipping invalid entity: ${name}`, entity);
        return;
    }

    addModelToMap(entity);
}

function createModelTransform(entity) {
    const { latitude, longitude, scale } = entity;
    const modelOrigin = [longitude, latitude];
    const modelAltitude = 0;

    const mercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
    const scaleFactor = mercatorCoordinate.meterInMercatorCoordinateUnits() * parseFloat(scale.split(' ')[0] || 1);

    return {
        translateX: mercatorCoordinate.x,
        translateY: mercatorCoordinate.y,
        translateZ: mercatorCoordinate.z,
        rotateX: Math.PI / 2,
        rotateY: 0,
        rotateZ: 0,
        scale: scaleFactor
    };
}

function loadTexture(url) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(url);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

function addModelToMap(entity) {
    const { model, name } = entity;
    const modelTransform = createModelTransform(entity);
    const gradientMap = loadTexture('asset/middle_button/threeTone.jpg');

    const customLayer = {
        id: `3d-model-${name}`,
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            this.map = map;
            this.scene = new THREE.Scene();
            this.camera = new THREE.Camera();
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });
            this.renderer.autoClear = false;
            this.clock = new THREE.Clock();
            this.mixer = null;

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(10, 10, 0);
            this.scene.add(directionalLight);

            const ambientLight = new THREE.AmbientLight(0x404040, 1);
            this.scene.add(ambientLight);

            const loader = new THREE.GLTFLoader();
            loader.load(
                model,
                (gltf) => {
                    const loadedModel = gltf.scene;
                    loadedModel.traverse(child => {
                        if (child.isMesh) {
                            const originalMaterial = child.material;
                            child.material = new THREE.MeshToonMaterial({
                                color: originalMaterial.color || 0xffffff,
                                map: originalMaterial.map || null,
                                gradientMap: gradientMap,
                                emissive: originalMaterial.emissive || 0x000000,
                                emissiveMap: originalMaterial.emissiveMap || null
                            });
                        }
                    });

                    this.scene.add(loadedModel);

                    if (gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(loadedModel);
                        gltf.animations.forEach(clip => this.mixer.clipAction(clip).play());
                    }
                },
                undefined,
                (error) => console.error(`Error loading model for ${name}:`, error)
            );
        },
        render: function (gl, matrix) {
            const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
            const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
            const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
                .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);

            if (this.mixer) {
                const delta = this.clock.getDelta();
                this.mixer.update(delta);
            }

            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };

    map.addLayer(customLayer);
}

map.on('style.load', loadAndScatterTrees);
loadEntities();
async function loadAndScatterTrees() {
    try {
        const randomCoordinates = await fetch('asset/VR/random_coordinates (1).json').then(res => res.json());
        const treeModelUrl = 'asset/VR/tree.glb';

        let batchIndex = 0;
        const BATCH_SIZE = 5;

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function loadBatch() {
            while (batchIndex < randomCoordinates.coordinates.length) {
                for (let i = 0; i < BATCH_SIZE && batchIndex < randomCoordinates.coordinates.length; i++, batchIndex++) {
                    const coordinate = randomCoordinates.coordinates[batchIndex];
                    addModelToMap({
                        latitude: coordinate[0],
                        longitude: coordinate[1],
                        model: treeModelUrl,
                        scale: (0.6 + Math.random() * 0.4).toFixed(2),
                        name: `tree-${batchIndex}`
                    });
                }
                await delay(100); // Pause for 50ms before processing the next batch
            }
        }


        loadBatch();
    } catch (error) {
        console.error('Error scattering trees:', error);
    }
}


