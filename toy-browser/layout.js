'use strict';

function layout(el){
    const {computedStyle} = el;

    if(!computedStyle) return;

    if(computedStyle.display!=='flex') return;

    const style = getStyle(computedStyle);

    const children = el.children.filter(item=>item.tag);

    children.sort((a,b)=>(a.order||0)-(b.order||0));

    ['width','height'].forEach(prop=>{
        if(['','auto'].includes(style[prop])){
            style[prop] = null;
        }
    })

    if(!style.flexDirection||style.flexDirection==='auto'){
        style.flexDirection = 'row';
    }

    if(!style.flexWrap||style.flexWrap==='auto'){
        style.flexWrap = 'nowrap';
    }

    if(!style.justifyContent||style.justifyContent==='auto'){
        style.justifyContent = 'flex-start';
    }


    if(!style.alignContent||style.alignContent==='auto'){
        style.alignContent = 'stretch';
    }

    if(!style.alignItems||style.alignItems==='auto'){
        style.alignItems = 'stretch';
    }

    let mainSize,mainStart,mainEnd,mainSign,mainBase,
        crossSize,crossStart,crossEnd,crossSign,crossBase;
    
        switch(style.flexDirection){
            case 'row':
                mainSize = 'width',
                mainStart= 'left',
                mainEnd = 'right',
                mainSign = +1,
                mainBase =0;

                crossSize = 'height',
                crossStart = 'top',
                crossEnd = 'bottom';
            break;

            case 'row-reverse':
                mainSize = 'width',
                mainStart= 'right',
                mainEnd = 'left',
                mainSign = -1,
                mainBase = style.width;

                crossSize = 'height',
                crossStart = 'top',
                crossEnd = 'bottom';
            break;

            case 'column':
                mainSize = 'height',
                mainStart= 'top',
                mainEnd = 'bottom',
                mainSign = +1,
                mainBase = 0;

                crossSize = 'width',
                crossStart = 'left',
                crossEnd = 'right';
            break;

            case 'column-reverse':
                mainSize = 'height',
                mainStart= 'bottom',
                mainEnd = 'top',
                mainSign = -1,
                mainBase = style.height;

                crossSize = 'width',
                crossStart = 'left',
                crossEnd = 'right';
            break;
        }

        if(style.flexWrap==='wrap-reverse'){
            let tmp = crossEnd;
            crossEnd = crossStart;
            crossStart = tmp;
            crossSign = -1;
        } else {
            crossSign = +1;
            crossBase = 0;
        }

        let isAutoMainSize = false;
        if(!style[mainSize]){
            style[mainSize] = 0;
            for(let child of children){
                const childStyle = getStyle(child.computedStyle);
                if(childStyle[mainSize]){
                    style[mainSize]+=childStyle[mainSize];
                }
            }   

            isAutoMainSize = true;
        }

        let flexLine = [];
        const flexLines = [flexLine];

        let mainSpace = style[mainSize],
        crossSpace = 0;

        for(let child of children){
            const childStyle = getStyle(child.computedStyle);
            if(!childStyle[mainSize]||childStyle[mainSize]!=='auto'){
                childStyle[mainSize] = 0;
            }

            if(childStyle.flex){
                flexLine.push(child);

            } else if(style.flexWrap==='nowrap'&&isAutoMainSize){
                mainSpace-=childStyle[mainSize];

                if(childStyle[crossSize]){
                    crossSpace = Math.max(childStyle[crossSize],crossSpace);
                }

                flexLine.push(child);

            } else {
                if(childStyle[mainSize]>style[mainSize]){
                    childStyle[mainSize] = style[mainSize];
                }

                if(mainSpace<childStyle[mainSize]){
                    flexLine.mainSpace = mainSpace;
                    flexLine.crossSpace = crossSpace;

                    flexLine = [child];
                    flexLines.push(flexLine);

                    mainSpace = style[mainSize];
                    crossSpace = 0;

                }else {
                    flexLine.push(child);
                }

                if(childStyle[crossSize]){
                    crossSpace = Math.max(childStyle[crossSize],crossSpace);
                }
                
                mainSpace-=childStyle[mainSize];
            }

            flexLine.mainSpace = mainSpace;
            flexLine.crossSpace = crossSpace;

            
        }   
   
    
}

function getStyle(style){
    for(let key of Object.keys(style)){
        let item = style[key];
        if(/^[0-9.]+$|px$/.test(item)){
            style[key] = parseInt(item);
        }
    }
    return style;
}

module.exports = layout;