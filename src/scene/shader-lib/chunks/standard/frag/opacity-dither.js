export default /* glsl */`

const float blueNoiseSize = 32.0;
const float blueNoiseDepth = 4.0;

#ifndef DITHER_BAYER8
#ifdef WEBGPU
    precision highp sampler2DArray;
    uniform sampler2DArray blueNoiseTex32;
    const float depthDivisor = 1.0;
#else
    precision highp sampler3D;
    uniform sampler3D blueNoiseTex32;
    const float depthDivisor = blueNoiseDepth;
#endif
uniform float blueNoiseFrame;
#endif

uniform vec4 blueNoiseJitter;



void opacityDither(float alpha, float id) {
    #ifdef DITHER_BAYER8

        float noise = bayer8(floor(mod(gl_FragCoord.xy + blueNoiseJitter.xy + id, 8.0))) / 64.0;

    #else   // blue noise

        float depthTime = float(int(blueNoiseFrame) % int(blueNoiseDepth)) / depthDivisor;

        vec2 uv2D = fract(gl_FragCoord.xy / blueNoiseSize + blueNoiseJitter.xy + id);
        vec3 uv3D = vec3(uv2D, depthTime);
        float noise = texture(blueNoiseTex32, uv3D).r;

    #endif

    if (alpha < noise)
        discard;
}
`;
