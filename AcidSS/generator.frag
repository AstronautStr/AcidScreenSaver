#version 330 core

layout(origin_upper_left) in vec4 gl_FragCoord;

uniform float time;
uniform float screenWidth;
uniform float screenHeight;

out vec4 color;

#define M_PI 3.1415926535897932384626433832795
#define M_2PI 6.283185307179586476925286766559
#define M_PI_2 (M_PI / 2)

#define NORMSIN(x)                  ((sin(x) + 1.0) / 2)
#define NORMSIN_T(x)                (NORMSIN(x * time))
#define NORMSIN_HZ(x)               (NORMSIN(2 * M_PI * x))
#define NORMSIN_HZ_T(x)             (NORMSIN(2 * M_PI * x * time))
#define NORMSIN_HZ_T_PH(x, phase)   (NORMSIN(M_2PI * x * time + phase))

vec2 hpolar(vec2 dPoint)
{
    return vec2((dPoint.x * dPoint.x + dPoint.y * dPoint.y), atan(dPoint.y, dPoint.x));
}

vec2 polar(vec2 dPoint)
{
    return vec2(sqrt(dPoint.x * dPoint.x + dPoint.y * dPoint.y), atan(dPoint.y, dPoint.x));
}

vec2 bitcrashFragment(vec2 fragCoord, vec2 originalScreen, float downscale)
{
    vec2 halfScreen = originalScreen / 2;
    return floor( (fragCoord - halfScreen) / downscale) + halfScreen / downscale;
}

float rand(vec2 co)
{
    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 acidDemoHz(vec2 fragPoint, vec2 screen, float hz)
{
    const float viewPortH = 1080.0;
    float viewPortW = viewPortH * screen.x / screen.y;
    vec2 viewPort = vec2(viewPortW, viewPortH);
    
    float iGlobalTime = time;
    vec2 iResolution = screen;
    
    float halfWidth = 0.5 * viewPort.x;
    float halfHeight = 0.5 * viewPort.y;
    vec2 fragmentPoint = (fragPoint.xy + vec2(0.5, 0.5)) / iResolution.xy * viewPort;
    
    float phase = 2.0 * M_PI * iGlobalTime;
    float radius = halfHeight;
    
    vec2 center = vec2(halfWidth, halfHeight);
    vec2 dPoint = fragmentPoint - center;
    vec2 pPoint = polar(dPoint);
    
    float maxRadius = length(vec2(halfWidth, halfHeight));
    float dist = pPoint.x / maxRadius;
    
    vec4 sphere;
    {
        pPoint = hpolar(dPoint);
        pPoint.x *= dist * dist * dist * dist;
        
        const float speed = 8.0;
        float delay = 0.5 * NORMSIN(phase);
        
        float valueRed = NORMSIN(pPoint.x / 10.0 + iGlobalTime * speed);
        float valueBlue = NORMSIN(pPoint.x / 10.0 + (iGlobalTime - delay) * speed);
        float farFading = clamp(pPoint.x / maxRadius, 0.0, 1.0);
        
        sphere = vec4(farFading * valueRed, 0.0, farFading * valueBlue, 0.0);
    }
    
    vec2 camera = vec2(halfWidth, halfHeight) + vec2(cos(phase * hz / 2), sin(phase * hz / 2)) * radius;
    const float magic = 0.0625;
    center = center + dist * (center - camera) * magic;
    
    dPoint = fragmentPoint - center;
    pPoint = polar(dPoint);
    pPoint.x *= 1.0 - dist;
    
    float speed = 2.0 * hz;
    float delay = 0.5 * NORMSIN_HZ_T(0.25);
    
    float eps = 0.15;
    float valueRed = smoothstep(-eps, eps, sin(pPoint.x / 10.0 + iGlobalTime * speed));
    float valueBlue = smoothstep(-eps, eps, sin(pPoint.x / 10.0 + (iGlobalTime - delay) * speed));
    
    vec4 color = vec4(valueRed, valueBlue, valueBlue, 1.0);
    
    float merge = length(dPoint) / maxRadius;
    merge = 0.75 + 0.25 * merge * NORMSIN(phase + M_PI);
    
    return merge * color + (1.0 - merge) * sphere;
}

vec4 trackBPMDemo(float demoTimeSec, float bpm)
{
    vec2 centeredFragPoint = gl_FragCoord.xy + vec2(0.5, 0.5);
    
    const float fadeFromWhiteTime = 8.0;
    const float bitcrashFadeInTime = 2.0;
    
    float mainLFO = NORMSIN_HZ_T_PH(1.0 / demoTimeSec, 0);
    float hzBpm = bpm / 60.0;
    float bitcrashHz = hzBpm / 4;
    float noiseHz = hzBpm / 32;
    float shiverHz = hzBpm / 16;
    
    //float shiverPhase = shiverHz * sin(M_2PI * time * shiverHz);
    // float shiver = NORMSIN(M_2PI * time * shiverPhase);
    
    float SHRange = 3.0;
    float freqSH = rand(vec2(floor(time * shiverHz), M_PI));
    float baseFreq = 10.0;
    float shiverPhase = (1 + floor(freqSH * SHRange * 0.25)) * baseFreq;
    
    float minMod = 1.0;
    float maxMod = 20.0;
    float shiver = rand(vec2(floor(time * shiverPhase), -M_PI));
    shiver *= shiver;
    
    const float bitcrashLowTreshold = 1.0;
    const float bitcrashHightTreshold = 100;
    float bitcrashRythm = NORMSIN_HZ_T_PH(bitcrashHz * clamp(-1.0 + time / bitcrashFadeInTime, 0.0, 1.0), -M_PI_2);
    float acidDemoBitcrash = (0.125 * mainLFO * bitcrashHightTreshold + bitcrashLowTreshold) + (bitcrashHightTreshold - bitcrashLowTreshold) * (mainLFO * shiver);
    
    const float noiseFadeFromWhitePower = 0.0;
    const float noiseLowTreshold = 0.0;
    const float noiseHightTreshold = 1.0;
    float fading = clamp(-1.0 + time / fadeFromWhiteTime, 0.0, 1.0);
    float noiseRythm = mix(shiver, NORMSIN_HZ_T_PH(noiseHz, M_PI_2) * mainLFO * fading, 0.75) * 0.5;
    float noisePower = mix(noiseLowTreshold, noiseHightTreshold, noiseRythm) - noiseFadeFromWhitePower;// * (1.0 - fading);
    
    vec3 value = vec3(0.0, 0.0, 0.0);
    vec2 screen = vec2(screenWidth, screenHeight);
    float radialFade = length((gl_FragCoord.xy - vec2(0.5, 0.5)) - screen / 2) / length(screen / 2);
    radialFade *= radialFade;
    
    float powMod = 6.0 + floor(2.0 * rand(vec2(floor(time / shiverPhase), M_PI)));
    const float log2value = log(2.0);
    float N = pow(2, powMod);
    float scaledLogN = (powMod * log2value);
    
    for (float i = N; i > 1; i /= 2)
    {
        value += (rand((bitcrashFragment(gl_FragCoord.xy, vec2(screenWidth, screenHeight), i) + vec2(0.5, 0.5)) * sin(time)) * (hsv2rgb(vec3(NORMSIN_HZ_T(0.25), 0.15, 0.75 + 0.25 * (i / scaledLogN))) * 1.0 * radialFade) - 0.0);
    }
    value /= scaledLogN + abs(noisePower);
    
    //return vec4(value, 1.0);
    const float mergingFactor = 0.7;
    vec4 acidD = acidDemoHz(bitcrashFragment(gl_FragCoord.xy, vec2(screenWidth, screenHeight), acidDemoBitcrash), vec2(screenWidth, screenHeight) / acidDemoBitcrash, hzBpm / 2);
    //return (0.75 + (0.25 * (1.0 - mainLFO)) + mergingFactor) * acidD - mergingFactor * vec4(value, 1.0);
    return sqrt(acidD) - vec4(value * value, 1.0);
}

void main()
{
    const float bpm = 180;
    const float time = 60 * 5;
    color = trackBPMDemo(time, bpm);
}