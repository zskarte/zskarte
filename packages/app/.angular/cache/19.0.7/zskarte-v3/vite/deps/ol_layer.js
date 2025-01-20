import {
  ARRAY_BUFFER,
  AttributeType,
  Buffer_default,
  DYNAMIC_DRAW,
  DefaultUniform,
  ELEMENT_ARRAY_BUFFER,
  Layer_default as Layer_default2,
  ShaderBuilder,
  WebGLTile_default,
  colorDecodeId,
  colorEncodeId,
  parseLiteralStyle
} from "./chunk-3T5KK3ME.js";
import {
  VectorTile_default
} from "./chunk-GQNRDIV4.js";
import {
  fromResolutionLike
} from "./chunk-VSE4A5LJ.js";
import {
  ImageLayer_default,
  Image_default
} from "./chunk-LWNIN62S.js";
import {
  Tile_default
} from "./chunk-XQ3P2EPI.js";
import "./chunk-Y22DGWX5.js";
import "./chunk-4Y2II2FC.js";
import "./chunk-CYLATGCW.js";
import "./chunk-UWFFTJUF.js";
import {
  Graticule_default
} from "./chunk-D7GJRSBO.js";
import {
  ImageCanvas_default
} from "./chunk-4ZWJ4I6P.js";
import "./chunk-ZFJPLISK.js";
import "./chunk-6NF3VXQE.js";
import {
  create as create2,
  fromTransform
} from "./chunk-PMSTMQL3.js";
import "./chunk-CJZ66Y35.js";
import "./chunk-WUEFYFM4.js";
import "./chunk-K5VWTFZZ.js";
import "./chunk-ABQOD32P.js";
import {
  Group_default
} from "./chunk-EXNKWPUX.js";
import "./chunk-WFUVBADM.js";
import {
  VectorLayer_default,
  Vector_default
} from "./chunk-5TEGD4TJ.js";
import "./chunk-QNDF4Y3D.js";
import "./chunk-L2CV7KJD.js";
import {
  VectorEventType_default
} from "./chunk-Y6NY3J2U.js";
import "./chunk-CB43P2IO.js";
import "./chunk-PGKZJFAO.js";
import "./chunk-37JEKLY7.js";
import "./chunk-6MWGMXNZ.js";
import {
  Feature_default2 as Feature_default
} from "./chunk-3XNX3BQI.js";
import "./chunk-NRWZHYJK.js";
import "./chunk-4POCNJOL.js";
import "./chunk-GK7HTIGR.js";
import "./chunk-SVNYXP6R.js";
import {
  BaseVector_default
} from "./chunk-V3CLUJMF.js";
import "./chunk-TDOEFV4W.js";
import "./chunk-6L3PZKOC.js";
import {
  RBush
} from "./chunk-HZ5K3CAR.js";
import {
  Layer_default
} from "./chunk-3JTXEXYF.js";
import "./chunk-CZ5OJR36.js";
import "./chunk-QX64YE7P.js";
import "./chunk-ROPZLQH3.js";
import "./chunk-6EYMMMQV.js";
import "./chunk-TXTFX4RY.js";
import "./chunk-2RIYM3D5.js";
import "./chunk-EA4JZPIY.js";
import "./chunk-JHWQPIRE.js";
import "./chunk-JNDXFVRB.js";
import "./chunk-QVNGVDO5.js";
import "./chunk-QABMMYJI.js";
import {
  ImageState_default,
  createCanvasContext2D
} from "./chunk-73LIRBW3.js";
import "./chunk-AIKGHEYG.js";
import {
  ViewHint_default
} from "./chunk-PTY4IMKO.js";
import "./chunk-GA2V7BR7.js";
import "./chunk-FJKL6GEV.js";
import {
  inflateEnds
} from "./chunk-CPUVTREV.js";
import "./chunk-MXU547EQ.js";
import "./chunk-SUHIIPIP.js";
import "./chunk-V4YYR2FE.js";
import "./chunk-BYB6RSDC.js";
import {
  transform2D
} from "./chunk-S6ZHCVSZ.js";
import {
  apply,
  compose,
  create,
  makeInverse,
  multiply,
  setFromArray,
  translate
} from "./chunk-5DM6XDPZ.js";
import {
  assert
} from "./chunk-IRDKPWWT.js";
import "./chunk-MCYH4ZL5.js";
import {
  fromUserCoordinate,
  getTransformFromProjections,
  getUserProjection,
  toUserExtent,
  toUserResolution
} from "./chunk-QPOUXWMH.js";
import "./chunk-VE7TNJGX.js";
import {
  buffer,
  createEmpty,
  equals as equals2,
  getHeight,
  getWidth,
  isEmpty,
  scaleFromCenter
} from "./chunk-IHYRLUFT.js";
import "./chunk-YKLFYZ2P.js";
import {
  EventType_default,
  listen,
  unlistenByKey
} from "./chunk-X7DDFSZC.js";
import "./chunk-MEYD4SA6.js";
import {
  clamp
} from "./chunk-3IATBWUD.js";
import {
  getUid
} from "./chunk-JL7CNLN5.js";
import {
  equals
} from "./chunk-LBIH33AC.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-NJ4VOZBH.js";

// ../../node_modules/ol/webgl/RenderTarget.js
var tmpArray4 = new Uint8Array(4);
var WebGLRenderTarget = class {
  /**
   * @param {import("./Helper.js").default} helper WebGL helper; mandatory.
   * @param {Array<number>} [size] Expected size of the render target texture; note: this can be changed later on.
   */
  constructor(helper, size) {
    this.helper_ = helper;
    const gl = helper.getGL();
    this.texture_ = gl.createTexture();
    this.framebuffer_ = gl.createFramebuffer();
    this.depthbuffer_ = gl.createRenderbuffer();
    this.size_ = size || [1, 1];
    this.data_ = new Uint8Array(0);
    this.dataCacheDirty_ = true;
    this.updateSize_();
  }
  /**
   * Changes the size of the render target texture. Note: will do nothing if the size
   * is already the same.
   * @param {Array<number>} size Expected size of the render target texture
   */
  setSize(size) {
    if (equals(size, this.size_)) {
      return;
    }
    this.size_[0] = size[0];
    this.size_[1] = size[1];
    this.updateSize_();
  }
  /**
   * Returns the size of the render target texture
   * @return {Array<number>} Size of the render target texture
   */
  getSize() {
    return this.size_;
  }
  /**
   * This will cause following calls to `#readAll` or `#readPixel` to download the content of the
   * render target into memory, which is an expensive operation.
   * This content will be kept in cache but should be cleared after each new render.
   */
  clearCachedData() {
    this.dataCacheDirty_ = true;
  }
  /**
   * Returns the full content of the frame buffer as a series of r, g, b, a components
   * in the 0-255 range (unsigned byte).
   * @return {Uint8Array} Integer array of color values
   */
  readAll() {
    if (this.dataCacheDirty_) {
      const size = this.size_;
      const gl = this.helper_.getGL();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer_);
      gl.readPixels(0, 0, size[0], size[1], gl.RGBA, gl.UNSIGNED_BYTE, this.data_);
      this.dataCacheDirty_ = false;
    }
    return this.data_;
  }
  /**
   * Reads one pixel of the frame buffer as an array of r, g, b, a components
   * in the 0-255 range (unsigned byte).
   * If x and/or y are outside of existing data, an array filled with 0 is returned.
   * @param {number} x Pixel coordinate
   * @param {number} y Pixel coordinate
   * @return {Uint8Array} Integer array with one color value (4 components)
   */
  readPixel(x, y) {
    if (x < 0 || y < 0 || x > this.size_[0] || y >= this.size_[1]) {
      tmpArray4[0] = 0;
      tmpArray4[1] = 0;
      tmpArray4[2] = 0;
      tmpArray4[3] = 0;
      return tmpArray4;
    }
    this.readAll();
    const index = Math.floor(x) + (this.size_[1] - Math.floor(y) - 1) * this.size_[0];
    tmpArray4[0] = this.data_[index * 4];
    tmpArray4[1] = this.data_[index * 4 + 1];
    tmpArray4[2] = this.data_[index * 4 + 2];
    tmpArray4[3] = this.data_[index * 4 + 3];
    return tmpArray4;
  }
  /**
   * @return {WebGLTexture} Texture to render to
   */
  getTexture() {
    return this.texture_;
  }
  /**
   * @return {WebGLFramebuffer} Frame buffer of the render target
   */
  getFramebuffer() {
    return this.framebuffer_;
  }
  /**
   * @return {WebGLRenderbuffer} Depth buffer of the render target
   */
  getDepthbuffer() {
    return this.depthbuffer_;
  }
  /**
   * @private
   */
  updateSize_() {
    const size = this.size_;
    const gl = this.helper_.getGL();
    this.texture_ = this.helper_.createTexture(size, null, this.texture_);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer_);
    gl.viewport(0, 0, size[0], size[1]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture_, 0);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthbuffer_);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size[0], size[1]);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthbuffer_);
    this.data_ = new Uint8Array(size[0] * size[1] * 4);
  }
};
var RenderTarget_default = WebGLRenderTarget;

// ../../node_modules/ol/render/webgl/constants.js
var WebGLWorkerMessageType = {
  GENERATE_POLYGON_BUFFERS: "GENERATE_POLYGON_BUFFERS",
  GENERATE_POINT_BUFFERS: "GENERATE_POINT_BUFFERS",
  GENERATE_LINE_STRING_BUFFERS: "GENERATE_LINE_STRING_BUFFERS"
};

// ../../node_modules/ol/worker/webgl.js
function create3() {
  const source = 'const t="GENERATE_POLYGON_BUFFERS",e="GENERATE_POINT_BUFFERS",n="GENERATE_LINE_STRING_BUFFERS";function r(t,e){const n=e[0],r=e[1];return e[0]=t[0]*n+t[2]*r+t[4],e[1]=t[1]*n+t[3]*r+t[5],e}function x(t,e){const n=(r=e)[0]*r[3]-r[1]*r[2];var r;!function(t,e){if(!t)throw new Error(e)}(0!==n,"Transformation matrix cannot be inverted");const x=e[0],o=e[1],u=e[2],i=e[3],f=e[4],s=e[5];return t[0]=i/n,t[1]=-o/n,t[2]=-u/n,t[3]=x/n,t[4]=(u*s-i*f)/n,t[5]=-(x*s-o*f)/n,t}function o(t,e,n=2){const r=e&&e.length,x=r?e[0]*n:t.length;let o=u(t,0,x,n,!0);const i=[];if(!o||o.next===o.prev)return i;let s,l,c;if(r&&(o=function(t,e,n,r){const x=[];for(let n=0,o=e.length;n<o;n++){const i=u(t,e[n]*r,n<o-1?e[n+1]*r:t.length,r,!1);i===i.next&&(i.steiner=!0),x.push(g(i))}x.sort(y);for(let t=0;t<x.length;t++)n=h(x[t],n);return n}(t,e,o,n)),t.length>80*n){s=1/0,l=1/0;let e=-1/0,r=-1/0;for(let o=n;o<x;o+=n){const n=t[o],x=t[o+1];n<s&&(s=n),x<l&&(l=x),n>e&&(e=n),x>r&&(r=x)}c=Math.max(e-s,r-l),c=0!==c?32767/c:0}return f(o,i,n,s,l,c,0),i}function u(t,e,n,r,x){let o;if(x===function(t,e,n,r){let x=0;for(let o=e,u=n-r;o<n;o+=r)x+=(t[u]-t[o])*(t[o+1]+t[u+1]),u=o;return x}(t,e,n,r)>0)for(let x=e;x<n;x+=r)o=z(x/r|0,t[x],t[x+1],o);else for(let x=n-r;x>=e;x-=r)o=z(x/r|0,t[x],t[x+1],o);return o&&M(o,o.next)&&(F(o),o=o.next),o}function i(t,e){if(!t)return t;e||(e=t);let n,r=t;do{if(n=!1,r.steiner||!M(r,r.next)&&0!==d(r.prev,r,r.next))r=r.next;else{if(F(r),r=e=r.prev,r===r.next)break;n=!0}}while(n||r!==e);return e}function f(t,e,n,r,x,o,u){if(!t)return;!u&&o&&function(t,e,n,r){let x=t;do{0===x.z&&(x.z=v(x.x,x.y,e,n,r)),x.prevZ=x.prev,x.nextZ=x.next,x=x.next}while(x!==t);x.prevZ.nextZ=null,x.prevZ=null,function(t){let e,n=1;do{let r,x=t;t=null;let o=null;for(e=0;x;){e++;let u=x,i=0;for(let t=0;t<n&&(i++,u=u.nextZ,u);t++);let f=n;for(;i>0||f>0&&u;)0!==i&&(0===f||!u||x.z<=u.z)?(r=x,x=x.nextZ,i--):(r=u,u=u.nextZ,f--),o?o.nextZ=r:t=r,r.prevZ=o,o=r;x=u}o.nextZ=null,n*=2}while(e>1)}(x)}(t,r,x,o);let y=t;for(;t.prev!==t.next;){const h=t.prev,p=t.next;if(o?l(t,r,x,o):s(t))e.push(h.i,t.i,p.i),F(t),t=p.next,y=p.next;else if((t=p)===y){u?1===u?f(t=c(i(t),e),e,n,r,x,o,2):2===u&&a(t,e,n,r,x,o):f(i(t),e,n,r,x,o,1);break}}}function s(t){const e=t.prev,n=t,r=t.next;if(d(e,n,r)>=0)return!1;const x=e.x,o=n.x,u=r.x,i=e.y,f=n.y,s=r.y,l=x<o?x<u?x:u:o<u?o:u,c=i<f?i<s?i:s:f<s?f:s,a=x>o?x>u?x:u:o>u?o:u,y=i>f?i>s?i:s:f>s?f:s;let h=r.next;for(;h!==e;){if(h.x>=l&&h.x<=a&&h.y>=c&&h.y<=y&&b(x,i,o,f,u,s,h.x,h.y)&&d(h.prev,h,h.next)>=0)return!1;h=h.next}return!0}function l(t,e,n,r){const x=t.prev,o=t,u=t.next;if(d(x,o,u)>=0)return!1;const i=x.x,f=o.x,s=u.x,l=x.y,c=o.y,a=u.y,y=i<f?i<s?i:s:f<s?f:s,h=l<c?l<a?l:a:c<a?c:a,p=i>f?i>s?i:s:f>s?f:s,g=l>c?l>a?l:a:c>a?c:a,Z=v(y,h,e,n,r),M=v(p,g,e,n,r);let w=t.prevZ,m=t.nextZ;for(;w&&w.z>=Z&&m&&m.z<=M;){if(w.x>=y&&w.x<=p&&w.y>=h&&w.y<=g&&w!==x&&w!==u&&b(i,l,f,c,s,a,w.x,w.y)&&d(w.prev,w,w.next)>=0)return!1;if(w=w.prevZ,m.x>=y&&m.x<=p&&m.y>=h&&m.y<=g&&m!==x&&m!==u&&b(i,l,f,c,s,a,m.x,m.y)&&d(m.prev,m,m.next)>=0)return!1;m=m.nextZ}for(;w&&w.z>=Z;){if(w.x>=y&&w.x<=p&&w.y>=h&&w.y<=g&&w!==x&&w!==u&&b(i,l,f,c,s,a,w.x,w.y)&&d(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;m&&m.z<=M;){if(m.x>=y&&m.x<=p&&m.y>=h&&m.y<=g&&m!==x&&m!==u&&b(i,l,f,c,s,a,m.x,m.y)&&d(m.prev,m,m.next)>=0)return!1;m=m.nextZ}return!0}function c(t,e){let n=t;do{const r=n.prev,x=n.next.next;!M(r,x)&&w(r,n,n.next,x)&&E(r,x)&&E(x,r)&&(e.push(r.i,n.i,x.i),F(n),F(n.next),n=t=x),n=n.next}while(n!==t);return i(n)}function a(t,e,n,r,x,o){let u=t;do{let t=u.next.next;for(;t!==u.prev;){if(u.i!==t.i&&Z(u,t)){let s=I(u,t);return u=i(u,u.next),s=i(s,s.next),f(u,e,n,r,x,o,0),void f(s,e,n,r,x,o,0)}t=t.next}u=u.next}while(u!==t)}function y(t,e){return t.x-e.x}function h(t,e){const n=function(t,e){let n=e;const r=t.x,x=t.y;let o,u=-1/0;do{if(x<=n.y&&x>=n.next.y&&n.next.y!==n.y){const t=n.x+(x-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(t<=r&&t>u&&(u=t,o=n.x<n.next.x?n:n.next,t===r))return o}n=n.next}while(n!==e);if(!o)return null;const i=o,f=o.x,s=o.y;let l=1/0;n=o;do{if(r>=n.x&&n.x>=f&&r!==n.x&&b(x<s?r:u,x,f,s,x<s?u:r,x,n.x,n.y)){const e=Math.abs(x-n.y)/(r-n.x);E(n,t)&&(e<l||e===l&&(n.x>o.x||n.x===o.x&&p(o,n)))&&(o=n,l=e)}n=n.next}while(n!==i);return o}(t,e);if(!n)return e;const r=I(n,t);return i(r,r.next),i(n,n.next)}function p(t,e){return d(t.prev,t,e.prev)<0&&d(e.next,t,t.next)<0}function v(t,e,n,r,x){return(t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=(t-n)*x|0)|t<<8))|t<<4))|t<<2))|t<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-r)*x|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function g(t){let e=t,n=t;do{(e.x<n.x||e.x===n.x&&e.y<n.y)&&(n=e),e=e.next}while(e!==t);return n}function b(t,e,n,r,x,o,u,i){return(x-u)*(e-i)>=(t-u)*(o-i)&&(t-u)*(r-i)>=(n-u)*(e-i)&&(n-u)*(o-i)>=(x-u)*(r-i)}function Z(t,e){return t.next.i!==e.i&&t.prev.i!==e.i&&!function(t,e){let n=t;do{if(n.i!==t.i&&n.next.i!==t.i&&n.i!==e.i&&n.next.i!==e.i&&w(n,n.next,t,e))return!0;n=n.next}while(n!==t);return!1}(t,e)&&(E(t,e)&&E(e,t)&&function(t,e){let n=t,r=!1;const x=(t.x+e.x)/2,o=(t.y+e.y)/2;do{n.y>o!=n.next.y>o&&n.next.y!==n.y&&x<(n.next.x-n.x)*(o-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next}while(n!==t);return r}(t,e)&&(d(t.prev,t,e.prev)||d(t,e.prev,e))||M(t,e)&&d(t.prev,t,t.next)>0&&d(e.prev,e,e.next)>0)}function d(t,e,n){return(e.y-t.y)*(n.x-e.x)-(e.x-t.x)*(n.y-e.y)}function M(t,e){return t.x===e.x&&t.y===e.y}function w(t,e,n,r){const x=A(d(t,e,n)),o=A(d(t,e,r)),u=A(d(n,r,t)),i=A(d(n,r,e));return x!==o&&u!==i||(!(0!==x||!m(t,n,e))||(!(0!==o||!m(t,r,e))||(!(0!==u||!m(n,t,r))||!(0!==i||!m(n,e,r)))))}function m(t,e,n){return e.x<=Math.max(t.x,n.x)&&e.x>=Math.min(t.x,n.x)&&e.y<=Math.max(t.y,n.y)&&e.y>=Math.min(t.y,n.y)}function A(t){return t>0?1:t<0?-1:0}function E(t,e){return d(t.prev,t,t.next)<0?d(t,e,t.next)>=0&&d(t,t.prev,e)>=0:d(t,e,t.prev)<0||d(t,t.next,e)<0}function I(t,e){const n=P(t.i,t.x,t.y),r=P(e.i,e.x,e.y),x=t.next,o=e.prev;return t.next=e,e.prev=t,n.next=x,x.prev=n,r.next=n,n.prev=r,o.next=r,r.prev=o,r}function z(t,e,n,r){const x=P(t,e,n);return r?(x.next=r.next,x.prev=r,r.next.prev=x,r.next=x):(x.prev=x,x.next=x),x}function F(t){t.next.prev=t.prev,t.prev.next=t.next,t.prevZ&&(t.prevZ.nextZ=t.nextZ),t.nextZ&&(t.nextZ.prevZ=t.prevZ)}function P(t,e,n){return{i:t,x:e,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}new Array(6);const B=[],N={vertexPosition:0,indexPosition:0};function R(t,e,n,r,x){t[e+0]=n,t[e+1]=r,t[e+2]=x}function S(t,e,n,r,x,o){const u=3+x,i=t[e+0],f=t[e+1],s=B;s.length=x;for(let n=0;n<s.length;n++)s[n]=t[e+2+n];let l=o?o.vertexPosition:0,c=o?o.indexPosition:0;const a=l/u;return R(n,l,i,f,0),s.length&&n.set(s,l+3),l+=u,R(n,l,i,f,1),s.length&&n.set(s,l+3),l+=u,R(n,l,i,f,2),s.length&&n.set(s,l+3),l+=u,R(n,l,i,f,3),s.length&&n.set(s,l+3),l+=u,r[c++]=a,r[c++]=a+1,r[c++]=a+3,r[c++]=a+1,r[c++]=a+2,r[c++]=a+3,N.vertexPosition=l,N.indexPosition=c,N}function T(t,e,n,x,o,u,i,f,s,l,c){const a=10+f.length,y=u.length/a,h=[t[e+0],t[e+1]],p=[t[n],t[n+1]],v=t[e+2],g=t[n+2],b=r(s,[...h]),Z=r(s,[...p]);function d(t,e,n){const r=Math.sqrt((e[0]-t[0])*(e[0]-t[0])+(e[1]-t[1])*(e[1]-t[1])),x=[(e[0]-t[0])/r,(e[1]-t[1])/r],o=[-x[1],x[0]],u=Math.sqrt((n[0]-t[0])*(n[0]-t[0])+(n[1]-t[1])*(n[1]-t[1])),i=[(n[0]-t[0])/u,(n[1]-t[1])/u],f=0===r||0===u?0:Math.acos((s=i[0]*x[0]+i[1]*x[1],l=-1,c=1,Math.min(Math.max(s,l),c)));var s,l,c;return i[0]*o[0]+i[1]*o[1]>0?f:2*Math.PI-f}let M=-1,w=-1,m=c;const A=null!==o;if(null!==x){M=d(b,Z,r(s,[...[t[x],t[x+1]]])),Math.cos(M)<=.985&&(m+=Math.tan((M-Math.PI)/2))}if(A){w=d(Z,b,r(s,[...[t[o],t[o+1]]])),Math.cos(w)<=.985&&(m+=Math.tan((Math.PI-w)/2))}function E(t,e){return 0===e?1e4*t:Math.sign(e)*(1e4*t+Math.abs(e))}return u.push(h[0],h[1],v,p[0],p[1],g,M,w,l,E(0,c)),u.push(...f),u.push(h[0],h[1],v,p[0],p[1],g,M,w,l,E(1,c)),u.push(...f),u.push(h[0],h[1],v,p[0],p[1],g,M,w,l,E(2,c)),u.push(...f),u.push(h[0],h[1],v,p[0],p[1],g,M,w,l,E(3,c)),u.push(...f),i.push(y,y+1,y+2,y+1,y+3,y+2),{length:l+Math.sqrt((Z[0]-b[0])*(Z[0]-b[0])+(Z[1]-b[1])*(Z[1]-b[1])),angle:m}}function _(t,e,n,r,x){const u=2+x;let i=e;const f=t.slice(i,i+x);i+=x;const s=t[i++];let l=0;const c=new Array(s-1);for(let e=0;e<s;e++)l+=t[i++],e<s-1&&(c[e]=l);const a=t.slice(i,i+2*l),y=o(a,c,2);for(let t=0;t<y.length;t++)r.push(y[t]+n.length/u);for(let t=0;t<a.length;t+=2)n.push(a[t],a[t+1],...f);return i+2*l}const O=self;O.onmessage=r=>{const o=r.data;switch(o.type){case e:{const t=3,e=2,n=o.customAttributesSize,r=e+n,x=new Float32Array(o.renderInstructions),u=x.length/r,i=4*u*(n+t),f=new Uint32Array(6*u),s=new Float32Array(i);let l;for(let t=0;t<x.length;t+=r)l=S(x,t,s,f,n,l);const c=Object.assign({vertexBuffer:s.buffer,indexBuffer:f.buffer,renderInstructions:x.buffer},o);O.postMessage(c,[s.buffer,f.buffer,x.buffer]);break}case n:{const t=[],e=[],n=o.customAttributesSize,r=3,u=new Float32Array(o.renderInstructions);let i=0;const f=[1,0,0,1,0,0];let s,l;for(x(f,o.renderInstructionsTransform);i<u.length;){l=Array.from(u.slice(i,i+n)),i+=n,s=u[i++];const x=i,o=i+(s-1)*r,c=u[x]===u[o]&&u[x+1]===u[o+1];let a=0,y=0;for(let n=0;n<s-1;n++){let h=null;n>0?h=i+(n-1)*r:c&&(h=o-r);let p=null;n<s-2?p=i+(n+2)*r:c&&(p=x+r);const v=T(u,i+n*r,i+(n+1)*r,h,p,t,e,l,f,a,y);a=v.length,y=v.angle}i+=s*r}const c=Uint32Array.from(e),a=Float32Array.from(t),y=Object.assign({vertexBuffer:a.buffer,indexBuffer:c.buffer,renderInstructions:u.buffer},o);O.postMessage(y,[a.buffer,c.buffer,u.buffer]);break}case t:{const t=[],e=[],n=o.customAttributesSize,r=new Float32Array(o.renderInstructions);let x=0;for(;x<r.length;)x=_(r,x,t,e,n);const u=Uint32Array.from(e),i=Float32Array.from(t),f=Object.assign({vertexBuffer:i.buffer,indexBuffer:u.buffer,renderInstructions:r.buffer},o);O.postMessage(f,[i.buffer,u.buffer,r.buffer]);break}}};';
  return new Worker(typeof Blob === "undefined" ? "data:application/javascript;base64," + Buffer.from(source, "binary").toString("base64") : URL.createObjectURL(new Blob([source], {
    type: "application/javascript"
  })));
}

// ../../node_modules/ol/renderer/webgl/worldUtil.js
function getWorldParameters(frameState, layer) {
  const projection = frameState.viewState.projection;
  const vectorSource = layer.getSource();
  const multiWorld = vectorSource.getWrapX() && projection.canWrapX();
  const projectionExtent = projection.getExtent();
  const extent = frameState.extent;
  const worldWidth = multiWorld ? getWidth(projectionExtent) : null;
  const endWorld = multiWorld ? Math.ceil((extent[2] - projectionExtent[2]) / worldWidth) + 1 : 1;
  const startWorld = multiWorld ? Math.floor((extent[0] - projectionExtent[0]) / worldWidth) : 0;
  return [startWorld, endWorld, worldWidth];
}

// ../../node_modules/ol/renderer/webgl/PointsLayer.js
var WebGLPointsLayerRenderer = class extends Layer_default2 {
  /**
   * @param {import("../../layer/Layer.js").default} layer Layer.
   * @param {Options} options Options.
   */
  constructor(layer, options) {
    const uniforms = options.uniforms || {};
    const projectionMatrixTransform = create();
    uniforms[DefaultUniform.PROJECTION_MATRIX] = projectionMatrixTransform;
    super(layer, {
      uniforms,
      postProcesses: options.postProcesses
    });
    this.sourceRevision_ = -1;
    this.verticesBuffer_ = new Buffer_default(ARRAY_BUFFER, DYNAMIC_DRAW);
    this.indicesBuffer_ = new Buffer_default(ELEMENT_ARRAY_BUFFER, DYNAMIC_DRAW);
    this.vertexShader_ = options.vertexShader;
    this.fragmentShader_ = options.fragmentShader;
    this.program_;
    this.hitDetectionEnabled_ = options.hitDetectionEnabled ?? true;
    const customAttributes = options.attributes ? options.attributes.map(function(attribute) {
      return {
        name: "a_" + attribute.name,
        size: 1,
        type: AttributeType.FLOAT
      };
    }) : [];
    this.attributes = [{
      name: "a_position",
      size: 2,
      type: AttributeType.FLOAT
    }, {
      name: "a_index",
      size: 1,
      type: AttributeType.FLOAT
    }];
    if (this.hitDetectionEnabled_) {
      this.attributes.push({
        name: "a_hitColor",
        size: 4,
        type: AttributeType.FLOAT
      });
      this.attributes.push({
        name: "a_featureUid",
        size: 1,
        type: AttributeType.FLOAT
      });
    }
    this.attributes.push(...customAttributes);
    this.customAttributes = options.attributes ? options.attributes : [];
    this.previousExtent_ = createEmpty();
    this.currentTransform_ = projectionMatrixTransform;
    this.renderTransform_ = create();
    this.invertRenderTransform_ = create();
    this.renderInstructions_ = new Float32Array(0);
    this.hitRenderTarget_;
    this.lastSentId = 0;
    this.worker_ = create3();
    this.worker_.addEventListener(
      "message",
      /**
       * @param {*} event Event.
       */
      (event) => {
        const received = event.data;
        if (received.type === WebGLWorkerMessageType.GENERATE_POINT_BUFFERS) {
          const projectionTransform = received.projectionTransform;
          this.verticesBuffer_.fromArrayBuffer(received.vertexBuffer);
          this.helper.flushBufferData(this.verticesBuffer_);
          this.indicesBuffer_.fromArrayBuffer(received.indexBuffer);
          this.helper.flushBufferData(this.indicesBuffer_);
          this.renderTransform_ = projectionTransform;
          makeInverse(this.invertRenderTransform_, this.renderTransform_);
          this.renderInstructions_ = new Float32Array(event.data.renderInstructions);
          if (received.id === this.lastSentId) {
            this.ready = true;
          }
          this.getLayer().changed();
        }
      }
    );
    this.featureCache_ = {};
    this.featureCount_ = 0;
    const source = this.getLayer().getSource();
    this.sourceListenKeys_ = [listen(source, VectorEventType_default.ADDFEATURE, this.handleSourceFeatureAdded_, this), listen(source, VectorEventType_default.CHANGEFEATURE, this.handleSourceFeatureChanged_, this), listen(source, VectorEventType_default.REMOVEFEATURE, this.handleSourceFeatureDelete_, this), listen(source, VectorEventType_default.CLEAR, this.handleSourceFeatureClear_, this)];
    source.forEachFeature((feature) => {
      this.featureCache_[getUid(feature)] = {
        feature,
        properties: feature.getProperties(),
        geometry: feature.getGeometry()
      };
      this.featureCount_++;
    });
  }
  /**
   * @override
   */
  afterHelperCreated() {
    this.program_ = this.helper.getProgram(this.fragmentShader_, this.vertexShader_);
    if (this.hitDetectionEnabled_) {
      this.hitRenderTarget_ = new RenderTarget_default(this.helper);
    }
    if (this.verticesBuffer_.getArray()) {
      this.helper.flushBufferData(this.verticesBuffer_);
    }
    if (this.indicesBuffer_.getArray()) {
      this.helper.flushBufferData(this.indicesBuffer_);
    }
  }
  /**
   * @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
   * @private
   */
  handleSourceFeatureAdded_(event) {
    const feature = event.feature;
    this.featureCache_[getUid(feature)] = {
      feature,
      properties: feature.getProperties(),
      geometry: feature.getGeometry()
    };
    this.featureCount_++;
  }
  /**
   * @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
   * @private
   */
  handleSourceFeatureChanged_(event) {
    const feature = event.feature;
    this.featureCache_[getUid(feature)] = {
      feature,
      properties: feature.getProperties(),
      geometry: feature.getGeometry()
    };
  }
  /**
   * @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
   * @private
   */
  handleSourceFeatureDelete_(event) {
    const feature = event.feature;
    delete this.featureCache_[getUid(feature)];
    this.featureCount_--;
  }
  /**
   * @private
   */
  handleSourceFeatureClear_() {
    this.featureCache_ = {};
    this.featureCount_ = 0;
  }
  /**
   * Render the layer.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {HTMLElement} The rendered element.
   * @override
   */
  renderFrame(frameState) {
    const gl = this.helper.getGL();
    this.preRender(gl, frameState);
    const [startWorld, endWorld, worldWidth] = getWorldParameters(frameState, this.getLayer());
    this.renderWorlds(frameState, false, startWorld, endWorld, worldWidth);
    this.helper.finalizeDraw(frameState, this.dispatchPreComposeEvent, this.dispatchPostComposeEvent);
    if (this.hitDetectionEnabled_) {
      this.renderWorlds(frameState, true, startWorld, endWorld, worldWidth);
      this.hitRenderTarget_.clearCachedData();
    }
    this.postRender(gl, frameState);
    const canvas = this.helper.getCanvas();
    return canvas;
  }
  /**
   * Determine whether renderFrame should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrameInternal(frameState) {
    const layer = this.getLayer();
    const vectorSource = layer.getSource();
    const viewState = frameState.viewState;
    const viewNotMoving = !frameState.viewHints[ViewHint_default.ANIMATING] && !frameState.viewHints[ViewHint_default.INTERACTING];
    const extentChanged = !equals2(this.previousExtent_, frameState.extent);
    const sourceChanged = this.sourceRevision_ < vectorSource.getRevision();
    if (sourceChanged) {
      this.sourceRevision_ = vectorSource.getRevision();
    }
    if (viewNotMoving && (extentChanged || sourceChanged)) {
      const projection = viewState.projection;
      const resolution = viewState.resolution;
      const renderBuffer = layer instanceof BaseVector_default ? layer.getRenderBuffer() : 0;
      const extent = buffer(frameState.extent, renderBuffer * resolution);
      vectorSource.loadFeatures(extent, resolution, projection);
      this.rebuildBuffers_(frameState);
      this.previousExtent_ = frameState.extent.slice();
    }
    this.helper.useProgram(this.program_, frameState);
    this.helper.prepareDraw(frameState);
    this.helper.bindBuffer(this.verticesBuffer_);
    this.helper.bindBuffer(this.indicesBuffer_);
    this.helper.enableAttributes(this.attributes);
    return true;
  }
  /**
   * Rebuild internal webgl buffers based on current view extent; costly, should not be called too much
   * @param {import("../../Map").FrameState} frameState Frame state.
   * @private
   */
  rebuildBuffers_(frameState) {
    const projectionTransform = create();
    this.helper.makeProjectionTransform(frameState, projectionTransform);
    const userProjection = getUserProjection();
    const baseInstructionLength = this.hitDetectionEnabled_ ? 7 : 2;
    const singleInstructionLength = baseInstructionLength + this.customAttributes.length;
    const totalSize = singleInstructionLength * this.featureCount_;
    if (!this.renderInstructions_ || this.renderInstructions_.length !== totalSize) {
      this.renderInstructions_ = new Float32Array(totalSize);
    }
    let featureCache, geometry;
    const tmpCoords = [];
    const tmpColor2 = [];
    let idx = -1;
    for (const featureUid in this.featureCache_) {
      featureCache = this.featureCache_[featureUid];
      geometry = /** @type {import("../../geom").Point} */
      featureCache.geometry;
      if (!geometry || geometry.getType() !== "Point") {
        continue;
      }
      if (userProjection) {
        const userCoords = fromUserCoordinate(geometry.getFlatCoordinates(), frameState.viewState.projection);
        tmpCoords[0] = userCoords[0];
        tmpCoords[1] = userCoords[1];
      } else {
        tmpCoords[0] = geometry.getFlatCoordinates()[0];
        tmpCoords[1] = geometry.getFlatCoordinates()[1];
      }
      apply(projectionTransform, tmpCoords);
      this.renderInstructions_[++idx] = tmpCoords[0];
      this.renderInstructions_[++idx] = tmpCoords[1];
      if (this.hitDetectionEnabled_) {
        const hitColor = colorEncodeId(idx + 5, tmpColor2);
        this.renderInstructions_[++idx] = hitColor[0];
        this.renderInstructions_[++idx] = hitColor[1];
        this.renderInstructions_[++idx] = hitColor[2];
        this.renderInstructions_[++idx] = hitColor[3];
        this.renderInstructions_[++idx] = Number(featureUid);
      }
      for (let j = 0; j < this.customAttributes.length; j++) {
        const value = this.customAttributes[j].callback(featureCache.feature, featureCache.properties);
        this.renderInstructions_[++idx] = value;
      }
    }
    const message = {
      id: ++this.lastSentId,
      type: WebGLWorkerMessageType.GENERATE_POINT_BUFFERS,
      renderInstructions: this.renderInstructions_.buffer,
      customAttributesSize: singleInstructionLength - 2
    };
    message["projectionTransform"] = projectionTransform;
    this.ready = false;
    this.worker_.postMessage(message, [this.renderInstructions_.buffer]);
    this.renderInstructions_ = null;
  }
  /**
   * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @param {import("../vector.js").FeatureCallback<T>} callback Feature callback.
   * @param {Array<import("../Map.js").HitMatch<T>>} matches The hit detected matches with tolerance.
   * @return {T|undefined} Callback result.
   * @template T
   * @override
   */
  forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches) {
    assert(this.hitDetectionEnabled_, "`forEachFeatureAtCoordinate` cannot be used on a WebGL layer if the hit detection logic has been disabled using the `disableHitDetection: true` option.");
    if (!this.renderInstructions_ || !this.hitDetectionEnabled_) {
      return void 0;
    }
    const pixel = apply(frameState.coordinateToPixelTransform, coordinate.slice());
    const data = this.hitRenderTarget_.readPixel(pixel[0] / 2, pixel[1] / 2);
    const color = [data[0] / 255, data[1] / 255, data[2] / 255, data[3] / 255];
    const index = colorDecodeId(color);
    const opacity = this.renderInstructions_[index];
    const uid = Math.floor(opacity).toString();
    const source = this.getLayer().getSource();
    const feature = source.getFeatureByUid(uid);
    if (feature) {
      return callback(feature, this.getLayer(), null);
    }
    return void 0;
  }
  /**
   * Render the world, either to the main framebuffer or to the hit framebuffer
   * @param {import("../../Map.js").FrameState} frameState current frame state
   * @param {boolean} forHitDetection whether the rendering is for hit detection
   * @param {number} startWorld the world to render in the first iteration
   * @param {number} endWorld the last world to render
   * @param {number} worldWidth the width of the worlds being rendered
   */
  renderWorlds(frameState, forHitDetection, startWorld, endWorld, worldWidth) {
    let world = startWorld;
    this.helper.useProgram(this.program_, frameState);
    if (forHitDetection) {
      this.hitRenderTarget_.setSize([Math.floor(frameState.size[0] / 2), Math.floor(frameState.size[1] / 2)]);
      this.helper.prepareDrawToRenderTarget(frameState, this.hitRenderTarget_, true);
    }
    this.helper.bindBuffer(this.verticesBuffer_);
    this.helper.bindBuffer(this.indicesBuffer_);
    this.helper.enableAttributes(this.attributes);
    do {
      this.helper.makeProjectionTransform(frameState, this.currentTransform_);
      translate(this.currentTransform_, world * worldWidth, 0);
      multiply(this.currentTransform_, this.invertRenderTransform_);
      this.helper.applyUniforms(frameState);
      this.helper.applyHitDetectionUniform(forHitDetection);
      const renderCount = this.indicesBuffer_.getSize();
      this.helper.drawElements(0, renderCount);
    } while (++world < endWorld);
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    this.worker_.terminate();
    this.sourceListenKeys_.forEach(function(key) {
      unlistenByKey(key);
    });
    this.sourceListenKeys_ = null;
    super.disposeInternal();
  }
  renderDeclutter() {
  }
};
var PointsLayer_default = WebGLPointsLayerRenderer;

// ../../node_modules/ol/layer/Heatmap.js
var Property = {
  BLUR: "blur",
  GRADIENT: "gradient",
  RADIUS: "radius"
};
var DEFAULT_GRADIENT = ["#00f", "#0ff", "#0f0", "#ff0", "#f00"];
var Heatmap = class extends BaseVector_default {
  /**
   * @param {Options<FeatureType, VectorSourceType>} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    const baseOptions = Object.assign({}, options);
    delete baseOptions.gradient;
    delete baseOptions.radius;
    delete baseOptions.blur;
    delete baseOptions.weight;
    super(baseOptions);
    this.gradient_ = null;
    this.addChangeListener(Property.GRADIENT, this.handleGradientChanged_);
    this.setGradient(options.gradient ? options.gradient : DEFAULT_GRADIENT);
    this.setBlur(options.blur !== void 0 ? options.blur : 15);
    this.setRadius(options.radius !== void 0 ? options.radius : 8);
    const weight = options.weight ? options.weight : "weight";
    this.weightFunction_ = typeof weight === "string" ? (
      /**
       * @param {import('../Feature.js').default} feature Feature
       * @return {any} weight
       */
      (feature) => feature.get(weight)
    ) : weight;
    this.setRenderOrder(null);
  }
  /**
   * Return the blur size in pixels.
   * @return {number} Blur size in pixels.
   * @api
   * @observable
   */
  getBlur() {
    return (
      /** @type {number} */
      this.get(Property.BLUR)
    );
  }
  /**
   * Return the gradient colors as array of strings.
   * @return {Array<string>} Colors.
   * @api
   * @observable
   */
  getGradient() {
    return (
      /** @type {Array<string>} */
      this.get(Property.GRADIENT)
    );
  }
  /**
   * Return the size of the radius in pixels.
   * @return {number} Radius size in pixel.
   * @api
   * @observable
   */
  getRadius() {
    return (
      /** @type {number} */
      this.get(Property.RADIUS)
    );
  }
  /**
   * @private
   */
  handleGradientChanged_() {
    this.gradient_ = createGradient(this.getGradient());
  }
  /**
   * Set the blur size in pixels.
   * @param {number} blur Blur size in pixels.
   * @api
   * @observable
   */
  setBlur(blur) {
    this.set(Property.BLUR, blur);
  }
  /**
   * Set the gradient colors as array of strings.
   * @param {Array<string>} colors Gradient.
   * @api
   * @observable
   */
  setGradient(colors) {
    this.set(Property.GRADIENT, colors);
  }
  /**
   * Set the size of the radius in pixels.
   * @param {number} radius Radius size in pixel.
   * @api
   * @observable
   */
  setRadius(radius) {
    this.set(Property.RADIUS, radius);
  }
  /**
   * @override
   */
  createRenderer() {
    const builder = new ShaderBuilder().addAttribute("float a_weight").addVarying("v_weight", "float", "a_weight").addUniform("float u_size").addUniform("float u_blurSlope").setSymbolSizeExpression("vec2(u_size)").setSymbolColorExpression("vec4(smoothstep(0., 1., (1. - length(coordsPx * 2. / v_quadSizePx)) * u_blurSlope) * v_weight)");
    return new PointsLayer_default(this, {
      className: this.getClassName(),
      attributes: [{
        name: "weight",
        callback: (feature) => {
          const weight = this.weightFunction_(feature);
          return weight !== void 0 ? clamp(weight, 0, 1) : 1;
        }
      }],
      uniforms: {
        u_size: () => {
          return (this.get(Property.RADIUS) + this.get(Property.BLUR)) * 2;
        },
        u_blurSlope: () => {
          return this.get(Property.RADIUS) / Math.max(1, this.get(Property.BLUR));
        }
      },
      hitDetectionEnabled: true,
      vertexShader: builder.getSymbolVertexShader(),
      fragmentShader: builder.getSymbolFragmentShader(),
      postProcesses: [{
        fragmentShader: `
            precision mediump float;

            uniform sampler2D u_image;
            uniform sampler2D u_gradientTexture;
            uniform float u_opacity;

            varying vec2 v_texCoord;

            void main() {
              vec4 color = texture2D(u_image, v_texCoord);
              gl_FragColor.a = color.a * u_opacity;
              gl_FragColor.rgb = texture2D(u_gradientTexture, vec2(0.5, color.a)).rgb;
              gl_FragColor.rgb *= gl_FragColor.a;
            }`,
        uniforms: {
          u_gradientTexture: () => this.gradient_,
          u_opacity: () => this.getOpacity()
        }
      }]
    });
  }
  /**
   * @override
   */
  renderDeclutter() {
  }
};
function createGradient(colors) {
  const width = 1;
  const height = 256;
  const context = createCanvasContext2D(width, height);
  const gradient = context.createLinearGradient(0, 0, width, height);
  const step = 1 / (colors.length - 1);
  for (let i = 0, ii = colors.length; i < ii; ++i) {
    gradient.addColorStop(i * step, colors[i]);
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  return context.canvas;
}
var Heatmap_default = Heatmap;

// ../../node_modules/ol/renderer/canvas/VectorImageLayer.js
var CanvasVectorImageLayerRenderer = class extends ImageLayer_default {
  /**
   * @param {import("../../layer/VectorImage.js").default} layer Vector image layer.
   */
  constructor(layer) {
    super(layer);
    this.vectorRenderer_ = new VectorLayer_default(layer);
    this.layerImageRatio_ = layer.getImageRatio();
    this.coordinateToVectorPixelTransform_ = create();
    this.renderedPixelToCoordinateTransform_ = null;
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    this.vectorRenderer_.dispose();
    super.disposeInternal();
  }
  /**
   * Asynchronous layer level hit detection.
   * @param {import("../../pixel.js").Pixel} pixel Pixel.
   * @return {Promise<Array<import("../../Feature").default>>} Promise that resolves with an array of features.
   * @override
   */
  getFeatures(pixel) {
    if (!this.vectorRenderer_) {
      return Promise.resolve([]);
    }
    const vectorPixel = apply(this.coordinateToVectorPixelTransform_, apply(this.renderedPixelToCoordinateTransform_, pixel.slice()));
    return this.vectorRenderer_.getFeatures(vectorPixel);
  }
  /**
   * Perform action necessary to get the layer rendered after new fonts have loaded
   * @override
   */
  handleFontsChanged() {
    this.vectorRenderer_.handleFontsChanged();
  }
  /**
   * Determine whether render should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrame(frameState) {
    const pixelRatio = frameState.pixelRatio;
    const viewState = frameState.viewState;
    const viewResolution = viewState.resolution;
    const hints = frameState.viewHints;
    const vectorRenderer = this.vectorRenderer_;
    let renderedExtent = frameState.extent;
    if (this.layerImageRatio_ !== 1) {
      renderedExtent = renderedExtent.slice(0);
      scaleFromCenter(renderedExtent, this.layerImageRatio_);
    }
    const width = getWidth(renderedExtent) / viewResolution;
    const height = getHeight(renderedExtent) / viewResolution;
    if (!hints[ViewHint_default.ANIMATING] && !hints[ViewHint_default.INTERACTING] && !isEmpty(renderedExtent)) {
      vectorRenderer.useContainer(null, null);
      const context = vectorRenderer.context;
      const layerState = frameState.layerStatesArray[frameState.layerIndex];
      const imageLayerState = Object.assign({}, layerState, {
        opacity: 1
      });
      const imageFrameState = (
        /** @type {import("../../Map.js").FrameState} */
        Object.assign({}, frameState, {
          extent: renderedExtent,
          size: [width, height],
          viewState: (
            /** @type {import("../../View.js").State} */
            Object.assign({}, frameState.viewState, {
              rotation: 0
            })
          ),
          layerStatesArray: [imageLayerState],
          layerIndex: 0,
          declutter: null
        })
      );
      const declutter = this.getLayer().getDeclutter();
      if (declutter) {
        imageFrameState.declutter = {
          [declutter]: new RBush(9)
        };
      }
      let emptyImage = true;
      const image = new ImageCanvas_default(renderedExtent, viewResolution, pixelRatio, context.canvas, function(callback) {
        if (vectorRenderer.prepareFrame(imageFrameState) && vectorRenderer.replayGroupChanged) {
          vectorRenderer.clipping = false;
          if (vectorRenderer.renderFrame(imageFrameState, null)) {
            vectorRenderer.renderDeclutter(imageFrameState);
            vectorRenderer.renderDeferred(imageFrameState);
            emptyImage = false;
          }
          callback();
        }
      });
      image.addEventListener(EventType_default.CHANGE, () => {
        if (image.getState() !== ImageState_default.LOADED) {
          return;
        }
        this.image = emptyImage ? null : image;
        const imagePixelRatio = image.getPixelRatio();
        const renderedResolution = fromResolutionLike(image.getResolution()) * pixelRatio / imagePixelRatio;
        this.renderedResolution = renderedResolution;
        this.coordinateToVectorPixelTransform_ = compose(this.coordinateToVectorPixelTransform_, width / 2, height / 2, 1 / renderedResolution, -1 / renderedResolution, 0, -viewState.center[0], -viewState.center[1]);
      });
      image.load();
    }
    if (this.image) {
      this.renderedPixelToCoordinateTransform_ = frameState.pixelToCoordinateTransform.slice();
    }
    return !!this.image;
  }
  /**
   * @override
   */
  preRender() {
  }
  /**
   * @override
   */
  postRender() {
  }
  /**
   */
  renderDeclutter() {
  }
  /**
   * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @param {import("../vector.js").FeatureCallback<T>} callback Feature callback.
   * @param {Array<import("../Map.js").HitMatch<T>>} matches The hit detected matches with tolerance.
   * @return {T|undefined} Callback result.
   * @template T
   * @override
   */
  forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches) {
    if (this.vectorRenderer_) {
      return this.vectorRenderer_.forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches);
    }
    return super.forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches);
  }
};
var VectorImageLayer_default = CanvasVectorImageLayerRenderer;

// ../../node_modules/ol/layer/VectorImage.js
var VectorImageLayer = class extends BaseVector_default {
  /**
   * @param {Options<VectorSourceType, FeatureType>} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    const baseOptions = Object.assign({}, options);
    delete baseOptions.imageRatio;
    super(baseOptions);
    this.imageRatio_ = options.imageRatio !== void 0 ? options.imageRatio : 1;
  }
  /**
   * @return {number} Ratio between rendered extent size and viewport extent size.
   */
  getImageRatio() {
    return this.imageRatio_;
  }
  /**
   * @override
   */
  createRenderer() {
    return new VectorImageLayer_default(this);
  }
};
var VectorImage_default = VectorImageLayer;

// ../../node_modules/ol/layer/WebGLPoints.js
var WebGLPointsLayer = class extends Layer_default {
  /**
   * @param {Options<VectorSourceType>} options Options.
   */
  constructor(options) {
    const baseOptions = Object.assign({}, options);
    super(baseOptions);
    this.styleVariables_ = options.variables || {};
    this.parseResult_ = parseLiteralStyle(options.style, this.styleVariables_);
    this.hitDetectionDisabled_ = !!options.disableHitDetection;
  }
  /**
   * @override
   */
  createRenderer() {
    const attributes = Object.keys(this.parseResult_.attributes).map((name) => __spreadValues({
      name
    }, this.parseResult_.attributes[name]));
    return new PointsLayer_default(this, {
      vertexShader: this.parseResult_.builder.getSymbolVertexShader(),
      fragmentShader: this.parseResult_.builder.getSymbolFragmentShader(),
      hitDetectionEnabled: !this.hitDetectionDisabled_,
      uniforms: this.parseResult_.uniforms,
      attributes: (
        /** @type {Array<import('../renderer/webgl/PointsLayer.js').CustomAttribute>} */
        attributes
      )
    });
  }
  /**
   * Update any variables used by the layer style and trigger a re-render.
   * @param {Object<string, number>} variables Variables to update.
   */
  updateStyleVariables(variables) {
    Object.assign(this.styleVariables_, variables);
    this.changed();
  }
};
var WebGLPoints_default = WebGLPointsLayer;

// ../../node_modules/ol/render/webgl/MixedGeometryBatch.js
var MixedGeometryBatch = class {
  constructor() {
    this.globalCounter_ = 0;
    this.refToFeature_ = /* @__PURE__ */ new Map();
    this.uidToRef_ = /* @__PURE__ */ new Map();
    this.freeGlobalRef_ = [];
    this.polygonBatch = {
      entries: {},
      geometriesCount: 0,
      verticesCount: 0,
      ringsCount: 0
    };
    this.pointBatch = {
      entries: {},
      geometriesCount: 0
    };
    this.lineStringBatch = {
      entries: {},
      geometriesCount: 0,
      verticesCount: 0
    };
  }
  /**
   * @param {Array<Feature|RenderFeature>} features Array of features to add to the batch
   * @param {import("../../proj.js").TransformFunction} [projectionTransform] Projection transform.
   */
  addFeatures(features, projectionTransform) {
    for (let i = 0; i < features.length; i++) {
      this.addFeature(features[i], projectionTransform);
    }
  }
  /**
   * @param {Feature|RenderFeature} feature Feature to add to the batch
   * @param {import("../../proj.js").TransformFunction} [projectionTransform] Projection transform.
   */
  addFeature(feature, projectionTransform) {
    let geometry = feature.getGeometry();
    if (!geometry) {
      return;
    }
    if (projectionTransform) {
      geometry = geometry.clone();
      geometry.applyTransform(projectionTransform);
    }
    this.addGeometry_(geometry, feature);
  }
  /**
   * @param {Feature|RenderFeature} feature Feature
   * @return {GeometryBatchItem|void} the cleared entry
   * @private
   */
  clearFeatureEntryInPointBatch_(feature) {
    const featureUid = getUid(feature);
    const entry = this.pointBatch.entries[featureUid];
    if (!entry) {
      return;
    }
    this.pointBatch.geometriesCount -= entry.flatCoordss.length;
    delete this.pointBatch.entries[featureUid];
    return entry;
  }
  /**
   * @param {Feature|RenderFeature} feature Feature
   * @return {GeometryBatchItem|void} the cleared entry
   * @private
   */
  clearFeatureEntryInLineStringBatch_(feature) {
    const featureUid = getUid(feature);
    const entry = this.lineStringBatch.entries[featureUid];
    if (!entry) {
      return;
    }
    this.lineStringBatch.verticesCount -= entry.verticesCount;
    this.lineStringBatch.geometriesCount -= entry.flatCoordss.length;
    delete this.lineStringBatch.entries[featureUid];
    return entry;
  }
  /**
   * @param {Feature|RenderFeature} feature Feature
   * @return {GeometryBatchItem|void} the cleared entry
   * @private
   */
  clearFeatureEntryInPolygonBatch_(feature) {
    const featureUid = getUid(feature);
    const entry = this.polygonBatch.entries[featureUid];
    if (!entry) {
      return;
    }
    this.polygonBatch.verticesCount -= entry.verticesCount;
    this.polygonBatch.ringsCount -= entry.ringsCount;
    this.polygonBatch.geometriesCount -= entry.flatCoordss.length;
    delete this.polygonBatch.entries[featureUid];
    return entry;
  }
  /**
   * @param {import("../../geom.js").Geometry|RenderFeature} geometry Geometry
   * @param {Feature|RenderFeature} feature Feature
   * @private
   */
  addGeometry_(geometry, feature) {
    const type = geometry.getType();
    switch (type) {
      case "GeometryCollection": {
        const geometries = (
          /** @type {import("../../geom.js").GeometryCollection} */
          geometry.getGeometriesArray()
        );
        for (const geometry2 of geometries) {
          this.addGeometry_(geometry2, feature);
        }
        break;
      }
      case "MultiPolygon": {
        const multiPolygonGeom = (
          /** @type {import("../../geom.js").MultiPolygon} */
          geometry
        );
        this.addCoordinates_(type, multiPolygonGeom.getFlatCoordinates(), multiPolygonGeom.getEndss(), feature, getUid(feature), multiPolygonGeom.getStride());
        break;
      }
      case "MultiLineString": {
        const multiLineGeom = (
          /** @type {import("../../geom.js").MultiLineString|RenderFeature} */
          geometry
        );
        this.addCoordinates_(type, multiLineGeom.getFlatCoordinates(), multiLineGeom.getEnds(), feature, getUid(feature), multiLineGeom.getStride());
        break;
      }
      case "MultiPoint": {
        const multiPointGeom = (
          /** @type {import("../../geom.js").MultiPoint|RenderFeature} */
          geometry
        );
        this.addCoordinates_(type, multiPointGeom.getFlatCoordinates(), null, feature, getUid(feature), multiPointGeom.getStride());
        break;
      }
      case "Polygon": {
        const polygonGeom = (
          /** @type {import("../../geom.js").Polygon|RenderFeature} */
          geometry
        );
        this.addCoordinates_(type, polygonGeom.getFlatCoordinates(), polygonGeom.getEnds(), feature, getUid(feature), polygonGeom.getStride());
        break;
      }
      case "Point": {
        const pointGeom = (
          /** @type {import("../../geom.js").Point} */
          geometry
        );
        this.addCoordinates_(type, pointGeom.getFlatCoordinates(), null, feature, getUid(feature), pointGeom.getStride());
        break;
      }
      case "LineString":
      case "LinearRing": {
        const lineGeom = (
          /** @type {import("../../geom.js").LineString} */
          geometry
        );
        const stride = lineGeom.getStride();
        this.addCoordinates_(type, lineGeom.getFlatCoordinates(), null, feature, getUid(feature), stride, lineGeom.getLayout?.());
        break;
      }
      default:
    }
  }
  /**
   * @param {GeometryType} type Geometry type
   * @param {Array<number>} flatCoords Flat coordinates
   * @param {Array<number> | Array<Array<number>> | null} ends Coordinate ends
   * @param {Feature|RenderFeature} feature Feature
   * @param {string} featureUid Feature uid
   * @param {number} stride Stride
   * @param {import('../../geom/Geometry.js').GeometryLayout} [layout] Layout
   * @private
   */
  addCoordinates_(type, flatCoords, ends, feature, featureUid, stride, layout) {
    let verticesCount;
    switch (type) {
      case "MultiPolygon": {
        const multiPolygonEndss = (
          /** @type {Array<Array<number>>} */
          ends
        );
        for (let i = 0, ii = multiPolygonEndss.length; i < ii; i++) {
          let polygonEnds = multiPolygonEndss[i];
          const prevPolygonEnds = i > 0 ? multiPolygonEndss[i - 1] : null;
          const startIndex = prevPolygonEnds ? prevPolygonEnds[prevPolygonEnds.length - 1] : 0;
          const endIndex = polygonEnds[polygonEnds.length - 1];
          polygonEnds = startIndex > 0 ? polygonEnds.map((end) => end - startIndex) : polygonEnds;
          this.addCoordinates_("Polygon", flatCoords.slice(startIndex, endIndex), polygonEnds, feature, featureUid, stride, layout);
        }
        break;
      }
      case "MultiLineString": {
        const multiLineEnds = (
          /** @type {Array<number>} */
          ends
        );
        for (let i = 0, ii = multiLineEnds.length; i < ii; i++) {
          const startIndex = i > 0 ? multiLineEnds[i - 1] : 0;
          this.addCoordinates_("LineString", flatCoords.slice(startIndex, multiLineEnds[i]), null, feature, featureUid, stride, layout);
        }
        break;
      }
      case "MultiPoint":
        for (let i = 0, ii = flatCoords.length; i < ii; i += stride) {
          this.addCoordinates_("Point", flatCoords.slice(i, i + 2), null, feature, featureUid, null, null);
        }
        break;
      case "Polygon": {
        const polygonEnds = (
          /** @type {Array<number>} */
          ends
        );
        if (feature instanceof Feature_default) {
          const multiPolygonEnds = inflateEnds(flatCoords, polygonEnds);
          if (multiPolygonEnds.length > 1) {
            this.addCoordinates_("MultiPolygon", flatCoords, multiPolygonEnds, feature, featureUid, stride, layout);
            return;
          }
        }
        if (!this.polygonBatch.entries[featureUid]) {
          this.polygonBatch.entries[featureUid] = this.addRefToEntry_(featureUid, {
            feature,
            flatCoordss: [],
            verticesCount: 0,
            ringsCount: 0,
            ringsVerticesCounts: []
          });
        }
        verticesCount = flatCoords.length / stride;
        const ringsCount = ends.length;
        const ringsVerticesCount = ends.map((end, ind, arr) => ind > 0 ? (end - arr[ind - 1]) / stride : end / stride);
        this.polygonBatch.verticesCount += verticesCount;
        this.polygonBatch.ringsCount += ringsCount;
        this.polygonBatch.geometriesCount++;
        this.polygonBatch.entries[featureUid].flatCoordss.push(getFlatCoordinatesXY(flatCoords, stride));
        this.polygonBatch.entries[featureUid].ringsVerticesCounts.push(ringsVerticesCount);
        this.polygonBatch.entries[featureUid].verticesCount += verticesCount;
        this.polygonBatch.entries[featureUid].ringsCount += ringsCount;
        for (let i = 0, ii = polygonEnds.length; i < ii; i++) {
          const startIndex = i > 0 ? polygonEnds[i - 1] : 0;
          this.addCoordinates_("LinearRing", flatCoords.slice(startIndex, polygonEnds[i]), null, feature, featureUid, stride, layout);
        }
        break;
      }
      case "Point":
        if (!this.pointBatch.entries[featureUid]) {
          this.pointBatch.entries[featureUid] = this.addRefToEntry_(featureUid, {
            feature,
            flatCoordss: []
          });
        }
        this.pointBatch.geometriesCount++;
        this.pointBatch.entries[featureUid].flatCoordss.push(flatCoords);
        break;
      case "LineString":
      case "LinearRing":
        if (!this.lineStringBatch.entries[featureUid]) {
          this.lineStringBatch.entries[featureUid] = this.addRefToEntry_(featureUid, {
            feature,
            flatCoordss: [],
            verticesCount: 0
          });
        }
        verticesCount = flatCoords.length / stride;
        this.lineStringBatch.verticesCount += verticesCount;
        this.lineStringBatch.geometriesCount++;
        this.lineStringBatch.entries[featureUid].flatCoordss.push(getFlatCoordinatesXYM(flatCoords, stride, layout));
        this.lineStringBatch.entries[featureUid].verticesCount += verticesCount;
        break;
      default:
    }
  }
  /**
   * @param {string} featureUid Feature uid
   * @param {GeometryBatchItem} entry The entry to add
   * @return {GeometryBatchItem} the added entry
   * @private
   */
  addRefToEntry_(featureUid, entry) {
    const currentRef = this.uidToRef_.get(featureUid);
    const ref = currentRef || this.freeGlobalRef_.pop() || ++this.globalCounter_;
    entry.ref = ref;
    if (!currentRef) {
      this.refToFeature_.set(ref, entry.feature);
      this.uidToRef_.set(featureUid, ref);
    }
    return entry;
  }
  /**
   * Return a ref to the pool of available refs.
   * @param {number} ref the ref to return
   * @param {string} featureUid the feature uid
   * @private
   */
  returnRef_(ref, featureUid) {
    if (!ref) {
      throw new Error("This feature has no ref: " + featureUid);
    }
    this.refToFeature_.delete(ref);
    this.uidToRef_.delete(featureUid);
    this.freeGlobalRef_.push(ref);
  }
  /**
   * @param {Feature|RenderFeature} feature Feature
   */
  changeFeature(feature) {
    this.removeFeature(feature);
    const geometry = feature.getGeometry();
    if (!geometry) {
      return;
    }
    this.addGeometry_(geometry, feature);
  }
  /**
   * @param {Feature|RenderFeature} feature Feature
   */
  removeFeature(feature) {
    let entry;
    entry = this.clearFeatureEntryInPointBatch_(feature) || entry;
    entry = this.clearFeatureEntryInPolygonBatch_(feature) || entry;
    entry = this.clearFeatureEntryInLineStringBatch_(feature) || entry;
    if (entry) {
      this.returnRef_(entry.ref, getUid(entry.feature));
    }
  }
  clear() {
    this.polygonBatch.entries = {};
    this.polygonBatch.geometriesCount = 0;
    this.polygonBatch.verticesCount = 0;
    this.polygonBatch.ringsCount = 0;
    this.lineStringBatch.entries = {};
    this.lineStringBatch.geometriesCount = 0;
    this.lineStringBatch.verticesCount = 0;
    this.pointBatch.entries = {};
    this.pointBatch.geometriesCount = 0;
    this.globalCounter_ = 0;
    this.freeGlobalRef_ = [];
    this.refToFeature_.clear();
    this.uidToRef_.clear();
  }
  /**
   * Resolve the feature associated to a ref.
   * @param {number} ref Hit detected ref
   * @return {Feature|RenderFeature} feature
   */
  getFeatureFromRef(ref) {
    return this.refToFeature_.get(ref);
  }
};
function getFlatCoordinatesXY(flatCoords, stride) {
  if (stride === 2) {
    return flatCoords;
  }
  return flatCoords.filter((v, i) => i % stride < 2);
}
function getFlatCoordinatesXYM(flatCoords, stride, layout) {
  if (stride === 3 && layout === "XYM") {
    return flatCoords;
  }
  if (stride === 4) {
    return flatCoords.filter((v, i) => i % stride !== 2);
  }
  if (stride === 3) {
    return flatCoords.map((v, i) => i % stride !== 2 ? v : 0);
  }
  return new Array(flatCoords.length * 1.5).fill(0).map((v, i) => i % 3 === 2 ? 0 : flatCoords[Math.round(i / 1.5)]);
}
var MixedGeometryBatch_default = MixedGeometryBatch;

// ../../node_modules/ol/render/webgl/renderinstructions.js
function pushCustomAttributesInRenderInstructions(renderInstructions, customAttributes, batchEntry, currentIndex) {
  let shift = 0;
  for (const key in customAttributes) {
    const attr = customAttributes[key];
    const value = attr.callback.call(batchEntry, batchEntry.feature);
    renderInstructions[currentIndex + shift++] = value[0] ?? value;
    if (!attr.size || attr.size === 1) {
      continue;
    }
    renderInstructions[currentIndex + shift++] = value[1];
    if (attr.size < 3) {
      continue;
    }
    renderInstructions[currentIndex + shift++] = value[2];
    if (attr.size < 4) {
      continue;
    }
    renderInstructions[currentIndex + shift++] = value[3];
  }
  return shift;
}
function getCustomAttributesSize(customAttributes) {
  return Object.keys(customAttributes).reduce((prev, curr) => prev + (customAttributes[curr].size || 1), 0);
}
function generatePointRenderInstructions(batch, renderInstructions, customAttributes, transform) {
  const totalInstructionsCount = (2 + getCustomAttributesSize(customAttributes)) * batch.geometriesCount;
  if (!renderInstructions || renderInstructions.length !== totalInstructionsCount) {
    renderInstructions = new Float32Array(totalInstructionsCount);
  }
  const tmpCoords = [];
  let renderIndex = 0;
  for (const featureUid in batch.entries) {
    const batchEntry = batch.entries[featureUid];
    for (let i = 0, ii = batchEntry.flatCoordss.length; i < ii; i++) {
      tmpCoords[0] = batchEntry.flatCoordss[i][0];
      tmpCoords[1] = batchEntry.flatCoordss[i][1];
      apply(transform, tmpCoords);
      renderInstructions[renderIndex++] = tmpCoords[0];
      renderInstructions[renderIndex++] = tmpCoords[1];
      renderIndex += pushCustomAttributesInRenderInstructions(renderInstructions, customAttributes, batchEntry, renderIndex);
    }
  }
  return renderInstructions;
}
function generateLineStringRenderInstructions(batch, renderInstructions, customAttributes, transform) {
  const totalInstructionsCount = 3 * batch.verticesCount + (1 + getCustomAttributesSize(customAttributes)) * batch.geometriesCount;
  if (!renderInstructions || renderInstructions.length !== totalInstructionsCount) {
    renderInstructions = new Float32Array(totalInstructionsCount);
  }
  const flatCoords = [];
  let renderIndex = 0;
  for (const featureUid in batch.entries) {
    const batchEntry = batch.entries[featureUid];
    for (let i = 0, ii = batchEntry.flatCoordss.length; i < ii; i++) {
      flatCoords.length = batchEntry.flatCoordss[i].length;
      transform2D(batchEntry.flatCoordss[i], 0, flatCoords.length, 3, transform, flatCoords, 3);
      renderIndex += pushCustomAttributesInRenderInstructions(renderInstructions, customAttributes, batchEntry, renderIndex);
      renderInstructions[renderIndex++] = flatCoords.length / 3;
      for (let j = 0, jj = flatCoords.length; j < jj; j += 3) {
        renderInstructions[renderIndex++] = flatCoords[j];
        renderInstructions[renderIndex++] = flatCoords[j + 1];
        renderInstructions[renderIndex++] = flatCoords[j + 2];
      }
    }
  }
  return renderInstructions;
}
function generatePolygonRenderInstructions(batch, renderInstructions, customAttributes, transform) {
  const totalInstructionsCount = 2 * batch.verticesCount + (1 + getCustomAttributesSize(customAttributes)) * batch.geometriesCount + batch.ringsCount;
  if (!renderInstructions || renderInstructions.length !== totalInstructionsCount) {
    renderInstructions = new Float32Array(totalInstructionsCount);
  }
  const flatCoords = [];
  let renderIndex = 0;
  for (const featureUid in batch.entries) {
    const batchEntry = batch.entries[featureUid];
    for (let i = 0, ii = batchEntry.flatCoordss.length; i < ii; i++) {
      flatCoords.length = batchEntry.flatCoordss[i].length;
      transform2D(batchEntry.flatCoordss[i], 0, flatCoords.length, 2, transform, flatCoords);
      renderIndex += pushCustomAttributesInRenderInstructions(renderInstructions, customAttributes, batchEntry, renderIndex);
      renderInstructions[renderIndex++] = batchEntry.ringsVerticesCounts[i].length;
      for (let j = 0, jj = batchEntry.ringsVerticesCounts[i].length; j < jj; j++) {
        renderInstructions[renderIndex++] = batchEntry.ringsVerticesCounts[i][j];
      }
      for (let j = 0, jj = flatCoords.length; j < jj; j += 2) {
        renderInstructions[renderIndex++] = flatCoords[j];
        renderInstructions[renderIndex++] = flatCoords[j + 1];
      }
    }
  }
  return renderInstructions;
}

// ../../node_modules/ol/render/webgl/VectorStyleRenderer.js
var tmpColor = [];
var WEBGL_WORKER = create3();
var workerMessageCounter = 0;
var Attributes = {
  POSITION: "a_position",
  INDEX: "a_index",
  SEGMENT_START: "a_segmentStart",
  SEGMENT_END: "a_segmentEnd",
  MEASURE_START: "a_measureStart",
  MEASURE_END: "a_measureEnd",
  PARAMETERS: "a_parameters",
  JOIN_ANGLES: "a_joinAngles",
  DISTANCE: "a_distance"
};
var VectorStyleRenderer = class {
  /**
   * @param {VectorStyle} styleOrShaders Literal style or custom shaders
   * @param {import('../../style/flat.js').StyleVariables} variables Style variables
   * @param {import('../../webgl/Helper.js').default} helper Helper
   * @param {boolean} enableHitDetection Whether to enable the hit detection (needs compatible shader)
   */
  constructor(styleOrShaders, variables, helper, enableHitDetection) {
    this.helper_;
    this.hitDetectionEnabled_ = enableHitDetection;
    let shaders = (
      /** @type {StyleShaders} */
      styleOrShaders
    );
    const isShaders = "builder" in styleOrShaders;
    if (!isShaders) {
      const parseResult = parseLiteralStyle(
        /** @type {import('../../style/webgl.js').WebGLStyle} */
        styleOrShaders,
        variables
      );
      shaders = {
        builder: parseResult.builder,
        attributes: parseResult.attributes,
        uniforms: parseResult.uniforms
      };
    }
    this.fillProgram_;
    this.strokeProgram_;
    this.symbolProgram_;
    this.hasFill_ = !!shaders.builder.getFillVertexShader();
    if (this.hasFill_) {
      this.fillVertexShader_ = shaders.builder.getFillVertexShader();
      this.fillFragmentShader_ = shaders.builder.getFillFragmentShader();
    }
    this.hasStroke_ = !!shaders.builder.getStrokeVertexShader();
    if (this.hasStroke_) {
      this.strokeVertexShader_ = shaders.builder.getStrokeVertexShader();
      this.strokeFragmentShader_ = shaders.builder.getStrokeFragmentShader();
    }
    this.hasSymbol_ = !!shaders.builder.getSymbolVertexShader();
    if (this.hasSymbol_) {
      this.symbolVertexShader_ = shaders.builder.getSymbolVertexShader();
      this.symbolFragmentShader_ = shaders.builder.getSymbolFragmentShader();
    }
    const hitDetectionAttributes = this.hitDetectionEnabled_ ? {
      hitColor: {
        callback() {
          return colorEncodeId(this.ref, tmpColor);
        },
        size: 4
      }
    } : {};
    this.customAttributes_ = Object.assign({}, hitDetectionAttributes, shaders.attributes);
    this.uniforms_ = shaders.uniforms;
    const customAttributesDesc = Object.entries(this.customAttributes_).map(([name, value]) => ({
      name: `a_${name}`,
      size: value.size || 1,
      type: AttributeType.FLOAT
    }));
    this.polygonAttributesDesc_ = [{
      name: Attributes.POSITION,
      size: 2,
      type: AttributeType.FLOAT
    }, ...customAttributesDesc];
    this.lineStringAttributesDesc_ = [{
      name: Attributes.SEGMENT_START,
      size: 2,
      type: AttributeType.FLOAT
    }, {
      name: Attributes.MEASURE_START,
      size: 1,
      type: AttributeType.FLOAT
    }, {
      name: Attributes.SEGMENT_END,
      size: 2,
      type: AttributeType.FLOAT
    }, {
      name: Attributes.MEASURE_END,
      size: 1,
      type: AttributeType.FLOAT
    }, {
      name: Attributes.JOIN_ANGLES,
      size: 2,
      type: AttributeType.FLOAT
    }, {
      name: Attributes.DISTANCE,
      size: 1,
      type: AttributeType.FLOAT
    }, {
      name: Attributes.PARAMETERS,
      size: 1,
      type: AttributeType.FLOAT
    }, ...customAttributesDesc];
    this.pointAttributesDesc_ = [{
      name: Attributes.POSITION,
      size: 2,
      type: AttributeType.FLOAT
    }, {
      name: Attributes.INDEX,
      size: 1,
      type: AttributeType.FLOAT
    }, ...customAttributesDesc];
    this.setHelper(helper);
  }
  /**
   * @param {import('./MixedGeometryBatch.js').default} geometryBatch Geometry batch
   * @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
   * @return {Promise<WebGLBuffers>} A promise resolving to WebGL buffers
   */
  generateBuffers(geometryBatch, transform) {
    return __async(this, null, function* () {
      const renderInstructions = this.generateRenderInstructions_(geometryBatch, transform);
      const [polygonBuffers, lineStringBuffers, pointBuffers] = yield Promise.all([this.generateBuffersForType_(renderInstructions.polygonInstructions, "Polygon", transform), this.generateBuffersForType_(renderInstructions.lineStringInstructions, "LineString", transform), this.generateBuffersForType_(renderInstructions.pointInstructions, "Point", transform)]);
      const invertVerticesTransform = makeInverse(create(), transform);
      return {
        polygonBuffers,
        lineStringBuffers,
        pointBuffers,
        invertVerticesTransform
      };
    });
  }
  /**
   * @param {import('./MixedGeometryBatch.js').default} geometryBatch Geometry batch
   * @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
   * @return {RenderInstructions} Render instructions
   * @private
   */
  generateRenderInstructions_(geometryBatch, transform) {
    const polygonInstructions = this.hasFill_ ? generatePolygonRenderInstructions(geometryBatch.polygonBatch, new Float32Array(0), this.customAttributes_, transform) : null;
    const lineStringInstructions = this.hasStroke_ ? generateLineStringRenderInstructions(geometryBatch.lineStringBatch, new Float32Array(0), this.customAttributes_, transform) : null;
    const pointInstructions = this.hasSymbol_ ? generatePointRenderInstructions(geometryBatch.pointBatch, new Float32Array(0), this.customAttributes_, transform) : null;
    return {
      polygonInstructions,
      lineStringInstructions,
      pointInstructions
    };
  }
  /**
   * @param {Float32Array|null} renderInstructions Render instructions
   * @param {import("../../geom/Geometry.js").Type} geometryType Geometry type
   * @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
   * @return {Promise<Array<WebGLArrayBuffer>>|null} Indices buffer and vertices buffer; null if nothing to render
   * @private
   */
  generateBuffersForType_(renderInstructions, geometryType, transform) {
    if (renderInstructions === null) {
      return null;
    }
    const messageId = workerMessageCounter++;
    let messageType;
    switch (geometryType) {
      case "Polygon":
        messageType = WebGLWorkerMessageType.GENERATE_POLYGON_BUFFERS;
        break;
      case "LineString":
        messageType = WebGLWorkerMessageType.GENERATE_LINE_STRING_BUFFERS;
        break;
      case "Point":
        messageType = WebGLWorkerMessageType.GENERATE_POINT_BUFFERS;
        break;
      default:
    }
    const message = {
      id: messageId,
      type: messageType,
      renderInstructions: renderInstructions.buffer,
      renderInstructionsTransform: transform,
      customAttributesSize: getCustomAttributesSize(this.customAttributes_)
    };
    WEBGL_WORKER.postMessage(message, [renderInstructions.buffer]);
    renderInstructions = null;
    return new Promise((resolve) => {
      const handleMessage = (event) => {
        const received = event.data;
        if (received.id !== messageId) {
          return;
        }
        WEBGL_WORKER.removeEventListener("message", handleMessage);
        if (!this.helper_.getGL()) {
          return;
        }
        const verticesBuffer = new Buffer_default(ARRAY_BUFFER, DYNAMIC_DRAW).fromArrayBuffer(received.vertexBuffer);
        const indicesBuffer = new Buffer_default(ELEMENT_ARRAY_BUFFER, DYNAMIC_DRAW).fromArrayBuffer(received.indexBuffer);
        this.helper_.flushBufferData(verticesBuffer);
        this.helper_.flushBufferData(indicesBuffer);
        resolve([indicesBuffer, verticesBuffer]);
      };
      WEBGL_WORKER.addEventListener("message", handleMessage);
    });
  }
  /**
   * Render the geometries in the given buffers.
   * @param {WebGLBuffers} buffers WebGL Buffers to draw
   * @param {import("../../Map.js").FrameState} frameState Frame state
   * @param {function(): void} preRenderCallback This callback will be called right before drawing, and can be used to set uniforms
   */
  render(buffers, frameState, preRenderCallback) {
    this.hasFill_ && this.renderInternal_(buffers.polygonBuffers[0], buffers.polygonBuffers[1], this.fillProgram_, this.polygonAttributesDesc_, frameState, preRenderCallback);
    this.hasStroke_ && this.renderInternal_(buffers.lineStringBuffers[0], buffers.lineStringBuffers[1], this.strokeProgram_, this.lineStringAttributesDesc_, frameState, preRenderCallback);
    this.hasSymbol_ && this.renderInternal_(buffers.pointBuffers[0], buffers.pointBuffers[1], this.symbolProgram_, this.pointAttributesDesc_, frameState, preRenderCallback);
  }
  /**
   * @param {WebGLArrayBuffer} indicesBuffer Indices buffer
   * @param {WebGLArrayBuffer} verticesBuffer Vertices buffer
   * @param {WebGLProgram} program Program
   * @param {Array<import('../../webgl/Helper.js').AttributeDescription>} attributes Attribute descriptions
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {function(): void} preRenderCallback This callback will be called right before drawing, and can be used to set uniforms
   * @private
   */
  renderInternal_(indicesBuffer, verticesBuffer, program, attributes, frameState, preRenderCallback) {
    const renderCount = indicesBuffer.getSize();
    if (renderCount === 0) {
      return;
    }
    this.helper_.useProgram(program, frameState);
    this.helper_.bindBuffer(verticesBuffer);
    this.helper_.bindBuffer(indicesBuffer);
    this.helper_.enableAttributes(attributes);
    preRenderCallback();
    this.helper_.drawElements(0, renderCount);
  }
  /**
   * @param {import('../../webgl/Helper.js').default} helper Helper
   * @param {WebGLBuffers} buffers WebGL Buffers to reload if any
   */
  setHelper(helper, buffers = null) {
    this.helper_ = helper;
    if (this.hasFill_) {
      this.fillProgram_ = this.helper_.getProgram(this.fillFragmentShader_, this.fillVertexShader_);
    }
    if (this.hasStroke_) {
      this.strokeProgram_ = this.helper_.getProgram(this.strokeFragmentShader_, this.strokeVertexShader_);
    }
    if (this.hasSymbol_) {
      this.symbolProgram_ = this.helper_.getProgram(this.symbolFragmentShader_, this.symbolVertexShader_);
    }
    this.helper_.addUniforms(this.uniforms_);
    if (buffers) {
      if (buffers.polygonBuffers) {
        this.helper_.flushBufferData(buffers.polygonBuffers[0]);
        this.helper_.flushBufferData(buffers.polygonBuffers[1]);
      }
      if (buffers.lineStringBuffers) {
        this.helper_.flushBufferData(buffers.lineStringBuffers[0]);
        this.helper_.flushBufferData(buffers.lineStringBuffers[1]);
      }
      if (buffers.pointBuffers) {
        this.helper_.flushBufferData(buffers.pointBuffers[0]);
        this.helper_.flushBufferData(buffers.pointBuffers[1]);
      }
    }
  }
};
var VectorStyleRenderer_default = VectorStyleRenderer;

// ../../node_modules/ol/renderer/webgl/VectorLayer.js
var Uniforms = __spreadProps(__spreadValues({}, DefaultUniform), {
  RENDER_EXTENT: "u_renderExtent",
  // intersection of layer, source, and view extent
  PATTERN_ORIGIN: "u_patternOrigin",
  GLOBAL_ALPHA: "u_globalAlpha"
});
var WebGLVectorLayerRenderer = class extends Layer_default2 {
  /**
   * @param {import("../../layer/Layer.js").default} layer Layer.
   * @param {Options} options Options.
   */
  constructor(layer, options) {
    const uniforms = {
      [Uniforms.RENDER_EXTENT]: [0, 0, 0, 0],
      [Uniforms.PATTERN_ORIGIN]: [0, 0],
      [Uniforms.GLOBAL_ALPHA]: 1
    };
    super(layer, {
      uniforms,
      postProcesses: options.postProcesses
    });
    this.hitDetectionEnabled_ = !options.disableHitDetection;
    this.hitRenderTarget_;
    this.sourceRevision_ = -1;
    this.previousExtent_ = createEmpty();
    this.currentTransform_ = create();
    this.tmpCoords_ = [0, 0];
    this.tmpTransform_ = create();
    this.tmpMat4_ = create2();
    this.currentFrameStateTransform_ = create();
    this.styleVariables_ = {};
    this.styles_ = [];
    this.styleRenderers_ = [];
    this.buffers_ = [];
    this.applyOptions_(options);
    this.batch_ = new MixedGeometryBatch_default();
    this.initialFeaturesAdded_ = false;
    this.sourceListenKeys_ = null;
  }
  /**
   * @private
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   */
  addInitialFeatures_(frameState) {
    const source = this.getLayer().getSource();
    const userProjection = getUserProjection();
    let projectionTransform;
    if (userProjection) {
      projectionTransform = getTransformFromProjections(userProjection, frameState.viewState.projection);
    }
    this.batch_.addFeatures(source.getFeatures(), projectionTransform);
    this.sourceListenKeys_ = [listen(source, VectorEventType_default.ADDFEATURE, this.handleSourceFeatureAdded_.bind(this, projectionTransform)), listen(source, VectorEventType_default.CHANGEFEATURE, this.handleSourceFeatureChanged_, this), listen(source, VectorEventType_default.REMOVEFEATURE, this.handleSourceFeatureDelete_, this), listen(source, VectorEventType_default.CLEAR, this.handleSourceFeatureClear_, this)];
  }
  /**
   * @param {Options} options Options.
   * @private
   */
  applyOptions_(options) {
    this.styleVariables_ = options.variables;
    this.styles_ = Array.isArray(options.style) ? options.style : [options.style];
  }
  /**
   * @private
   */
  createRenderers_() {
    this.buffers_ = [];
    this.styleRenderers_ = this.styles_.map((style) => new VectorStyleRenderer_default(style, this.styleVariables_, this.helper, this.hitDetectionEnabled_));
  }
  /**
   * @override
   */
  reset(options) {
    this.applyOptions_(options);
    if (this.helper) {
      this.createRenderers_();
    }
    super.reset(options);
  }
  /**
   * @override
   */
  afterHelperCreated() {
    if (this.styleRenderers_.length) {
      this.styleRenderers_.forEach((renderer, i) => renderer.setHelper(this.helper, this.buffers_[i]));
    } else {
      this.createRenderers_();
    }
    if (this.hitDetectionEnabled_) {
      this.hitRenderTarget_ = new RenderTarget_default(this.helper);
    }
  }
  /**
   * @param {import("../../proj.js").TransformFunction} projectionTransform Transform function.
   * @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
   * @private
   */
  handleSourceFeatureAdded_(projectionTransform, event) {
    const feature = event.feature;
    this.batch_.addFeature(feature, projectionTransform);
  }
  /**
   * @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
   * @private
   */
  handleSourceFeatureChanged_(event) {
    const feature = event.feature;
    this.batch_.changeFeature(feature);
  }
  /**
   * @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
   * @private
   */
  handleSourceFeatureDelete_(event) {
    const feature = event.feature;
    this.batch_.removeFeature(feature);
  }
  /**
   * @private
   */
  handleSourceFeatureClear_() {
    this.batch_.clear();
  }
  /**
   * @param {import("../../transform.js").Transform} batchInvertTransform Inverse of the transformation in which geometries are expressed
   * @private
   */
  applyUniforms_(batchInvertTransform) {
    setFromArray(this.tmpTransform_, this.currentFrameStateTransform_);
    multiply(this.tmpTransform_, batchInvertTransform);
    this.helper.setUniformMatrixValue(Uniforms.PROJECTION_MATRIX, fromTransform(this.tmpMat4_, this.tmpTransform_));
    makeInverse(this.tmpTransform_, this.tmpTransform_);
    this.helper.setUniformMatrixValue(Uniforms.SCREEN_TO_WORLD_MATRIX, fromTransform(this.tmpMat4_, this.tmpTransform_));
    this.tmpCoords_[0] = 0;
    this.tmpCoords_[1] = 0;
    makeInverse(this.tmpTransform_, batchInvertTransform);
    apply(this.tmpTransform_, this.tmpCoords_);
    this.helper.setUniformFloatVec2(Uniforms.PATTERN_ORIGIN, this.tmpCoords_);
  }
  /**
   * Render the layer.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {HTMLElement} The rendered element.
   * @override
   */
  renderFrame(frameState) {
    const gl = this.helper.getGL();
    this.preRender(gl, frameState);
    const [startWorld, endWorld, worldWidth] = getWorldParameters(frameState, this.getLayer());
    this.helper.prepareDraw(frameState);
    this.renderWorlds(frameState, false, startWorld, endWorld, worldWidth);
    this.helper.finalizeDraw(frameState, this.dispatchPreComposeEvent, this.dispatchPostComposeEvent);
    const canvas = this.helper.getCanvas();
    if (this.hitDetectionEnabled_) {
      this.renderWorlds(frameState, true, startWorld, endWorld, worldWidth);
      this.hitRenderTarget_.clearCachedData();
    }
    this.postRender(gl, frameState);
    return canvas;
  }
  /**
   * Determine whether renderFrame should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrameInternal(frameState) {
    if (!this.initialFeaturesAdded_) {
      this.addInitialFeatures_(frameState);
      this.initialFeaturesAdded_ = true;
    }
    const layer = this.getLayer();
    const vectorSource = layer.getSource();
    const viewState = frameState.viewState;
    const viewNotMoving = !frameState.viewHints[ViewHint_default.ANIMATING] && !frameState.viewHints[ViewHint_default.INTERACTING];
    const extentChanged = !equals2(this.previousExtent_, frameState.extent);
    const sourceChanged = this.sourceRevision_ < vectorSource.getRevision();
    if (sourceChanged) {
      this.sourceRevision_ = vectorSource.getRevision();
    }
    if (viewNotMoving && (extentChanged || sourceChanged)) {
      const projection = viewState.projection;
      const resolution = viewState.resolution;
      const renderBuffer = layer instanceof BaseVector_default ? layer.getRenderBuffer() : 0;
      const extent = buffer(frameState.extent, renderBuffer * resolution);
      const userProjection = getUserProjection();
      if (userProjection) {
        vectorSource.loadFeatures(toUserExtent(extent, userProjection), toUserResolution(resolution, projection), userProjection);
      } else {
        vectorSource.loadFeatures(extent, resolution, projection);
      }
      this.ready = false;
      const transform = this.helper.makeProjectionTransform(frameState, create());
      const generatePromises = this.styleRenderers_.map((renderer, i) => renderer.generateBuffers(this.batch_, transform).then((buffers) => {
        if (this.buffers_[i]) {
          this.disposeBuffers(this.buffers_[i]);
        }
        this.buffers_[i] = buffers;
      }));
      Promise.all(generatePromises).then(() => {
        this.ready = true;
        this.getLayer().changed();
      });
      this.previousExtent_ = frameState.extent.slice();
    }
    return true;
  }
  /**
   * Render the world, either to the main framebuffer or to the hit framebuffer
   * @param {import("../../Map.js").FrameState} frameState current frame state
   * @param {boolean} forHitDetection whether the rendering is for hit detection
   * @param {number} startWorld the world to render in the first iteration
   * @param {number} endWorld the last world to render
   * @param {number} worldWidth the width of the worlds being rendered
   */
  renderWorlds(frameState, forHitDetection, startWorld, endWorld, worldWidth) {
    let world = startWorld;
    if (forHitDetection) {
      this.hitRenderTarget_.setSize([Math.floor(frameState.size[0] / 2), Math.floor(frameState.size[1] / 2)]);
      this.helper.prepareDrawToRenderTarget(frameState, this.hitRenderTarget_, true);
    }
    do {
      this.helper.makeProjectionTransform(frameState, this.currentFrameStateTransform_);
      translate(this.currentFrameStateTransform_, world * worldWidth, 0);
      for (let i = 0, ii = this.styleRenderers_.length; i < ii; i++) {
        const renderer = this.styleRenderers_[i];
        const buffers = this.buffers_[i];
        if (!buffers) {
          continue;
        }
        renderer.render(buffers, frameState, () => {
          this.applyUniforms_(buffers.invertVerticesTransform);
          this.helper.applyHitDetectionUniform(forHitDetection);
        });
      }
    } while (++world < endWorld);
  }
  /**
   * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @param {import("../vector.js").FeatureCallback<T>} callback Feature callback.
   * @param {Array<import("../Map.js").HitMatch<T>>} matches The hit detected matches with tolerance.
   * @return {T|undefined} Callback result.
   * @template T
   * @override
   */
  forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches) {
    assert(this.hitDetectionEnabled_, "`forEachFeatureAtCoordinate` cannot be used on a WebGL layer if the hit detection logic has been disabled using the `disableHitDetection: true` option.");
    if (!this.styleRenderers_.length || !this.hitDetectionEnabled_) {
      return void 0;
    }
    const pixel = apply(frameState.coordinateToPixelTransform, coordinate.slice());
    const data = this.hitRenderTarget_.readPixel(pixel[0] / 2, pixel[1] / 2);
    const color = [data[0] / 255, data[1] / 255, data[2] / 255, data[3] / 255];
    const ref = colorDecodeId(color);
    const feature = this.batch_.getFeatureFromRef(ref);
    if (feature) {
      return callback(feature, this.getLayer(), null);
    }
    return void 0;
  }
  /**
   * Will release a set of Webgl buffers
   * @param {import('../../render/webgl/VectorStyleRenderer.js').WebGLBuffers} buffers Buffers
   */
  disposeBuffers(buffers) {
    if (buffers.pointBuffers) {
      buffers.pointBuffers.filter(Boolean).forEach((buffer2) => this.helper.deleteBuffer(buffer2));
    }
    if (buffers.lineStringBuffers) {
      buffers.lineStringBuffers.filter(Boolean).forEach((buffer2) => this.helper.deleteBuffer(buffer2));
    }
    if (buffers.polygonBuffers) {
      buffers.polygonBuffers.filter(Boolean).forEach((buffer2) => this.helper.deleteBuffer(buffer2));
    }
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    this.buffers_.forEach((buffers) => {
      this.disposeBuffers(buffers);
    });
    if (this.sourceListenKeys_) {
      this.sourceListenKeys_.forEach(function(key) {
        unlistenByKey(key);
      });
      this.sourceListenKeys_ = null;
    }
    super.disposeInternal();
  }
};
var VectorLayer_default2 = WebGLVectorLayerRenderer;

// ../../node_modules/ol/layer/WebGLVector.js
var WebGLVectorLayer = class extends Layer_default {
  /**
   * @param {Options<VectorSourceType, FeatureType>} [options] Options.
   */
  constructor(options) {
    const baseOptions = Object.assign({}, options);
    super(baseOptions);
    this.styleVariables_ = options.variables || {};
    this.style_ = options.style;
    this.hitDetectionDisabled_ = !!options.disableHitDetection;
  }
  /**
   * @override
   */
  createRenderer() {
    return new VectorLayer_default2(this, {
      style: this.style_,
      variables: this.styleVariables_,
      disableHitDetection: this.hitDetectionDisabled_
    });
  }
  /**
   * Update any variables used by the layer style and trigger a re-render.
   * @param {import('../style/flat.js').StyleVariables} variables Variables to update.
   */
  updateStyleVariables(variables) {
    Object.assign(this.styleVariables_, variables);
    this.changed();
  }
  /**
   * Set the layer style.
   * @param {import('../style/webgl.js').WebGLStyle} style Layer style.
   */
  setStyle(style) {
    this.style = style;
    this.clearRenderer();
    this.changed();
  }
};
var WebGLVector_default = WebGLVectorLayer;
export {
  Graticule_default as Graticule,
  Group_default as Group,
  Heatmap_default as Heatmap,
  Image_default as Image,
  Layer_default as Layer,
  Tile_default as Tile,
  Vector_default as Vector,
  VectorImage_default as VectorImage,
  VectorTile_default as VectorTile,
  WebGLPoints_default as WebGLPoints,
  WebGLTile_default as WebGLTile,
  WebGLVector_default as WebGLVector
};
//# sourceMappingURL=ol_layer.js.map
