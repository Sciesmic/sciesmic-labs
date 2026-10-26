// Sciesmic Plate Boundaries art pack v1 (2026-10-26).
// Sprite geometry comes from the supplied manifest; the model remains authoritative.
const geometry = {"strato_l_active":{"frame":[192,136],"anchor":[96,130],"data":{"summit_y":26.6,"half_base":90.0}},"strato_l_extinct":{"frame":[192,136],"anchor":[96,130],"data":{"summit_y":39.0,"half_base":90.0}},"shield_l_active":{"frame":[192,136],"anchor":[96,130],"data":{"summit_y":61.8,"half_base":90.0}},"shield_l_extinct":{"frame":[192,136],"anchor":[96,130],"data":{"summit_y":70.0,"half_base":90.0}},"cinder_l_active":{"frame":[192,136],"anchor":[96,130],"data":{"summit_y":50.8,"half_base":90.0}},"cinder_l_extinct":{"frame":[192,136],"anchor":[96,130],"data":{"summit_y":60.3,"half_base":90.0}},"seamount_active":{"frame":[144,80],"anchor":[72,74],"data":{"summit_y":22,"half_base":64}},"seamount_extinct":{"frame":[144,80],"anchor":[72,74],"data":{"summit_y":22,"half_base":64}}};
export const image = (id,x,y,w,h,extra='') => `<image href="assets/art/${id}.svg" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
export function volcano(id,x,summitY,baseY) {
  const {frame:[w,h],anchor:[ax,ay],data}=geometry[id];
  const scale=Math.max(0,(baseY-summitY)/(ay-data.summit_y));
  return image(id,x-ax*scale,baseY-ay*scale,w*scale,h*scale);
}
// Two gentle glow frames; reduced-motion uses the first frame without flicker.
export function glow(id,x,y,w,h) {
  return `<g>${image(id+'_a',x,y,w,h,'preserveAspectRatio="none"')}${image(id+'_b',x,y,w,h,'class="art-glow" preserveAspectRatio="none"')}</g>`;
}
