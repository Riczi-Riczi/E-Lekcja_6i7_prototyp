import * as THREE from 'three';
import {colorHex} from './color-picker.js';
export const patternTypes=[['none','Bez wzoru','-'],['circles','Kółka','●'],['squares','Kwadraty','■'],['stars','Gwiazdki','★'],['organic','Organiczne',''],['rectangles','Prostokąty','▬'],['hearts','Serca','♥'],['zigzag','Zygzak','ϟ']];
export const makePattern=()=>({type:'none',color:'navy',size:3});
const declarations=/* glsl */`
varying vec3 vPatternPosition;
varying vec3 vPatternNormal;
uniform float patternKind;
uniform float patternScale;
uniform vec3 patternInk;
float softUnion(float a,float b,float k){float h=max(k-abs(a-b),0.0)/k;return min(a,b)-h*h*k*0.25;}
float lineDistance(vec2 p,vec2 a,vec2 b){vec2 ab=b-a;return length(p-a-ab*clamp(dot(p-a,ab)/dot(ab,ab),0.0,1.0));}
float heartDistance(vec2 p){p.x=abs(p.x);if(p.y+p.x>1.0)return length(p-vec2(.25,.75))-.35355339;vec2 a=p-vec2(0.,1.);vec2 b=p-.5*max(p.x+p.y,0.);return sqrt(min(dot(a,a),dot(b,b)))*sign(p.x-p.y);}
float shapeMask(vec2 p) {
  vec2 q=fract(p*patternScale)-0.5;
  float d=1.0;
  if(patternKind<1.5) d=length(q)-0.24;
  else if(patternKind<2.5) d=max(abs(q.x),abs(q.y))-0.235;
  else if(patternKind<3.5) {
    float angle=mod(atan(q.y,q.x)-1.5707963268+6.2831853072,6.2831853072);
    float stepAngle=0.6283185307;
    float sector=floor(angle/stepAngle);
    float localAngle=angle-sector*stepAngle;
    float r0=mod(sector,2.0)<0.5?0.34:0.145;
    float r1=mod(sector,2.0)<0.5?0.145:0.34;
    vec2 edge=vec2(r1*cos(stepAngle)-r0,r1*sin(stepAngle));
    float radius=r0*r1*sin(stepAngle)/(cos(localAngle)*edge.y-sin(localAngle)*edge.x);
    d=length(q)-radius;
  } else if(patternKind<4.5) {
    float a=length(q-vec2(-0.16,-0.06))-0.15;
    float b=length(q-vec2(0.10,-0.12))-0.18;
    float c=length(q-vec2(0.075,0.17))-0.135;
    d=softUnion(softUnion(a,b,0.16),c,0.16);
  } else if(patternKind<5.5) d=max(abs(q.x)-0.31,abs(q.y)-0.145);
  else if(patternKind<6.5)d=heartDistance(q*3.1+vec2(0.,.52))/3.1;
  else {d=min(lineDistance(q,vec2(-.31,-.18),vec2(-.12,.18)),min(lineDistance(q,vec2(-.12,.18),vec2(.10,-.18)),lineDistance(q,vec2(.10,-.18),vec2(.31,.18))))-.043;}
  float aa=max(fwidth(d),0.008);
  return 1.0-smoothstep(-aa,aa,d);
}
`;
export function attachPattern(material,state,palette){
  const uniforms={patternKind:{value:0},patternScale:{value:7},patternInk:{value:new THREE.Color('#123E6B')}};
  function update(){uniforms.patternKind.value=patternTypes.findIndex(p=>p[0]===state.type);uniforms.patternScale.value=16-state.size*2.5;uniforms.patternInk.value.set(colorHex(state.color));}
  update();material.userData.updatePattern=update;
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader='varying vec3 vPatternPosition;\nvarying vec3 vPatternNormal;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
      vPatternPosition=transformed+vec3(0.125,0.0,0.0);
      vPatternNormal=normalize(objectNormal);`);
    shader.fragmentShader=declarations+shader.fragmentShader;
    // Apply pigment before the original badge map: its alpha and dark stitching survive.
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
      if(patternKind>0.5) {
        vec3 weights=pow(abs(normalize(vPatternNormal)),vec3(12.0));
        weights/=max(dot(weights,vec3(1.0)),0.0001);
        float mask=shapeMask(vPatternPosition.yz)*weights.x+shapeMask(vPatternPosition.xz)*weights.y+shapeMask(vPatternPosition.xy)*weights.z;
        diffuseColor.rgb=mix(diffuseColor.rgb,patternInk,mask);
      }
      #include <map_fragment>`);
  };
  material.customProgramCacheKey=()=> 'selekt-patterns-v2';material.needsUpdate=true;
}
