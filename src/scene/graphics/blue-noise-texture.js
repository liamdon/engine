import { blueNoiseData } from "../../core/math/blue-noise.js";
import { ADDRESS_REPEAT, FILTER_NEAREST, PIXELFORMAT_L8, TEXTURETYPE_DEFAULT } from "../../platform/graphics/constants.js";
import { DeviceCache } from "../../platform/graphics/device-cache.js";
import { Texture } from "../../platform/graphics/texture.js";

// device cache storing the blue noise texture for the device
const deviceCache = new DeviceCache();

function getBlueNoiseTexture(device) {

    return deviceCache.get(device, () => {

        const data = blueNoiseData();
        const size = 32;
        const depth = 4;

        // On WebGPU we use a 2D texture array, while on WebGL2 we use a 3D texture
        // This is because:
        // * WebGPU still has poor for support 3D textures, engine hasn't implemented them yet
        // * WebGL2 did not like using L8 format in an array texture - possible that engine doesn't handle this correctly
        let texture;
        if (device.isWebGPU) {
            texture = new Texture(device, {
                name: `BlueNoise${size}`,
                width: size,
                height: size,
                volume: false,
                arrayLength: depth,
                format: PIXELFORMAT_L8,
                addressU: ADDRESS_REPEAT,
                addressV: ADDRESS_REPEAT,
                type: TEXTURETYPE_DEFAULT,
                magFilter: FILTER_NEAREST,
                minFilter: FILTER_NEAREST,
                anisotropy: 1,
                mipmaps: false,
                levels: [data]
            });
        } else {
            texture = new Texture(device, {
                name: `BlueNoise${size}`,
                width: size,
                height: size,
                depth: depth,
                volume: true,
                format: PIXELFORMAT_L8,
                addressU: ADDRESS_REPEAT,
                addressV: ADDRESS_REPEAT,
                type: TEXTURETYPE_DEFAULT,
                magFilter: FILTER_NEAREST,
                minFilter: FILTER_NEAREST,
                anisotropy: 1,
                mipmaps: false
            });
            const textureData = texture.lock();
            for (let i = 0; i < depth; i++) {
                textureData.set(data[i], i * size * size);
            }
            texture.unlock();
        }

        return texture;
    });
}

export { getBlueNoiseTexture };
