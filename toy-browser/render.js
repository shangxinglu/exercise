
const images = require('images');

const viewport = images(750,1000);

let currentImg = viewport;

function render(el){
    const {computedStyle} = el;
    if(!computedStyle) return;
    
    const {left=0,top=0,width,height} = computedStyle;

    let bg = computedStyle['background-color']||computedStyle['background'];
    let rgba = {r:0,g:0,b:0,a:1};
    if(bg){
         let {groups} = /\((?<r>\d+),[\s]*?(?<g>\d+),[\s]*?(?<b>\d+),[\s]*?(?<a>[\d.]+)\)/.exec(bg)||{};
        if(groups){
            rgba = groups;
            Object.keys(rgba).map(key=>rgba[key] = parseFloat(rgba[key]));
        }
    }
    
    const img = images(width,height);
    img.fill(rgba.r,rgba.g,rgba.b,rgba.a);
    // img.fill('255',0,0,1);
    currentImg.draw(img,left,top);
    if(el.children){
        for(let child of el.children){
            render(child);
        }
    }

    currentImg.save('render.png');
}

module.exports = {
    render,
};