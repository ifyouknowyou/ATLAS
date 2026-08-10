/**
 * Fresnel atmosphere glow (BackSide + additive). Gives the planet a thin,
 * tech-rim lighting signature consistent with the ATLAS visual language.
 */
export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 viewDir = normalize(-vViewPosition);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 3.0);
    float alpha = fresnel * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;