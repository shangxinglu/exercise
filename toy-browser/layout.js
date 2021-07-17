'use strict';

function layout(el) {
    const { computedStyle } = el;

    if (!computedStyle) return;

    if (computedStyle.display !== 'flex') return;

    const style = getStyle(computedStyle);

    const children = el.children.filter(item => item.tag);

    children.sort((a, b) => (a.order || 0) - (b.order || 0));

    ['width', 'height'].forEach(prop => {
        if (['', 'auto'].includes(style[prop])) {
            style[prop] = null;
        }
    })

    if (!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row';
    }

    if (!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap';
    }

    if (!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start';
    }


    if (!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch';
    }

    if (!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch';
    }

    let mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;

    switch (style.flexDirection) {
        case 'row':
            mainSize = 'width',
                mainStart = 'left',
                mainEnd = 'right',
                mainSign = +1,
                mainBase = 0;

            crossSize = 'height',
                crossStart = 'top',
                crossEnd = 'bottom';
            break;

        case 'row-reverse':
            mainSize = 'width',
                mainStart = 'right',
                mainEnd = 'left',
                mainSign = -1,
                mainBase = style.width;

            crossSize = 'height',
                crossStart = 'top',
                crossEnd = 'bottom';
            break;

        case 'column':
            mainSize = 'height',
                mainStart = 'top',
                mainEnd = 'bottom',
                mainSign = +1,
                mainBase = 0;

            crossSize = 'width',
                crossStart = 'left',
                crossEnd = 'right';
            break;

        case 'column-reverse':
            mainSize = 'height',
                mainStart = 'bottom',
                mainEnd = 'top',
                mainSign = -1,
                mainBase = style.height;

            crossSize = 'width',
                crossStart = 'left',
                crossEnd = 'right';
            break;
    }

    if (style.flexWrap === 'wrap-reverse') {
        let tmp = crossEnd;
        crossEnd = crossStart;
        crossStart = tmp;
        crossSign = -1;
    } else {
        crossSign = +1;
        crossBase = 0;
    }

    let isAutoMainSize = false;
    if (!style[mainSize]) {
        style[mainSize] = 0;
        for (let child of children) {
            const childStyle = getStyle(child.computedStyle);
            if (childStyle[mainSize]) {
                style[mainSize] += childStyle[mainSize];
            }
        }

        isAutoMainSize = true;
    }

    let flexLine = [];
    const flexLines = [flexLine];

    let mainSpace = style[mainSize],
        crossSpace = 0;

    for (let child of children) {
        const childStyle = getStyle(child.computedStyle);
        if (!childStyle[mainSize] || childStyle[mainSize] === 'auto') {
            childStyle[mainSize] = 0;
        }

        if (childStyle.flex) {
            flexLine.push(child);

        } else if (style.flexWrap === 'nowrap' || isAutoMainSize) {
            mainSpace -= childStyle[mainSize];

            if (childStyle[crossSize]) {
                crossSpace = Math.max(childStyle[crossSize], crossSpace);
            }

            flexLine.push(child);

        } else {
            if (childStyle[mainSize] > style[mainSize]) {
                childStyle[mainSize] = style[mainSize];
            }

            if (mainSpace < childStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;

                flexLine = [child];
                flexLines.push(flexLine);

                mainSpace = style[mainSize];
                crossSpace = 0;

            } else {
                flexLine.push(child);
            }

            if (childStyle[crossSize]) {
                crossSpace = Math.max(childStyle[crossSize], crossSpace);
            }

            mainSpace -= childStyle[mainSize];
        }

    }

    flexLine.mainSpace = mainSpace;

    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = style[crossSize] ?? crossSpace;
    } else {
        flexLine.crossSpace = crossSpace;
    }

    // 仅在单行时发生
    if (mainSpace < 0) {
        const scale = style[mainSize] / (style[mainSize] - mainSign * mainSpace);
        let currentMain = mainBase;

        for (let child of children) {
            const childStyle = getStyle(child.computedStyle);

            if (childStyle.flex) {
                childStyle[mainSize] = 0;
            }

            childStyle[mainSize] = childStyle[mainSize] * scale;
            childStyle[mainStart] = currentMain;
            childStyle[mainEnd] = currentMain + mainSign * childStyle[mainSize];

            currentMain = childStyle[mainEnd];
        }
    } else {
        flexLines.forEach(line => {
            let flexTotal = 0;
            let { mainSpace } = line;

            for (let child of line) {
                const childStyle = getStyle(child.computedStyle);
                if (childStyle.flex) {
                    flexTotal += childStyle.flex;
                }
            }
            if (flexTotal > 0) {
                let currentMain = mainBase;

                for (let child of line) {
                    const childStyle = getStyle(child.computedStyle);
                    if (childStyle.flex) {
                        childStyle[mainSize] = mainSpace * (childStyle.flex / flexTotal);
                    }

                    childStyle[mainStart] = currentMain;
                    childStyle[mainEnd] = currentMain + mainSign * childStyle[mainSize];

                    currentMain = childStyle[mainEnd];
                }

            } else {
                let step, currentMain;
                switch (style.justifyContent) {
                    case 'flex-start':
                        currentMain = mainBase;
                        step = 0;
                        break;
                    case 'flex-end':
                        currentMain = mainBase + mainSpace * mainSign;
                        step = 0;

                        break;

                    case 'center':
                        currentMain = mainBase + mainSpace * mainSign / 2;
                        step = 0;

                        break;

                    case 'space-between':
                        currentMain = mainBase;
                        step = mainSpace * mainSign / (flexTotal - 1);
                        break;

                    case 'space-around':
                        step = mainSpace * mainSign / children.length;
                        currentMain = mainBase + step / 2;
                        break;
                }

                for (let child of line) {
                    const childStyle = getStyle(child.computedStyle);


                    childStyle[mainStart] = currentMain;
                    childStyle[mainEnd] = currentMain + mainSign * childStyle[mainSize];

                    currentMain = childStyle[mainEnd] + step;
                }
            }

        })


    }



    if (!style[crossSize]) {
        style[crossSize] = 0;
        crossSpace = 0;
        for (let line of flexLines) {
            style[crossSize] += line.crossSpace;
        }
    } else {
        crossSpace = style[crossSize];

        for (let line of flexLines) {
            crossSpace -= line.crossSpace;
        }
    }

    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }

    let step;
    switch (style.alignContent) {
        case 'flex-start':
            crossBase += 0;
            step = 0;
            break;

        case 'flex-end':
            crossBase += crossSign * crossSpace;
            step = 0;
            break;

        case 'space-between':
            crossBase += 0;
            step = crossSign * crossSpace / (flexLines.length - 1);
            break;

        case 'center':
            crossBase += crossSign * crossSpace / 2;
            step = 0;
            break;

        case 'space-around':
            step = crossSign * crossSpace / flexLines.length;
            crossBase += step / 2;
            break;

        case 'stretch':
            crossBase += 0;
            step = 0;
            break;

    }


    flexLines.forEach(line => {
        let lineSpace;
        if (style.alignContent === 'stretch') {
            lineSpace = line.crossSpace + crossSpace / flexLines.length;
        } else {
            lineSpace = line.crossSpace;
        }
        for (let child of line) {
            const childStyle = getStyle(child.computedStyle);

            let align = childStyle.alignSelf || style.alignItems;

            if (!childStyle[crossSize]) {
                childStyle[crossSize] = align === 'stretch' ? lineSpace : 0;
            }

            switch (align) {
                case 'flex-start':
                    childStyle[crossStart] = crossBase;
                    childStyle[crossEnd] = childStyle[crossStart] + childStyle[crossSize] * crossSign;
                    break;

                case 'flex-end':
                    childStyle[crossStart] = crossBase + (lineSpace - childStyle[crossSize]) * crossSign;
                    childStyle[crossEnd] = childStyle[crossStart] + childStyle[crossSize] * crossSign;
                    break;

                case 'center':
                    childStyle[crossEnd] = crossBase + lineSpace * crossSign;
                    childStyle[crossStart] = childStyle[crossEnd] - (lineSpace - childStyle[crossSize]) / 2 * crossSign;
                    break;

                case 'stretch':
                    childStyle[crossStart] = crossBase;
                    childStyle[crossEnd] =  childStyle[crossStart] + (childStyle[crossSize]??lineSpace) * crossSign;
                    childStyle[crossSize] = (childStyle[crossEnd] - childStyle[crossStart])*crossSign;
                    break;
            }

        }

        crossBase += (step+lineSpace)*crossSign;

    })


    console.log(el);
    el.layout = flexLines;

    

}

function getStyle(style) {
    if(!style) return {};
    for (let key of Object.keys(style)) {
        let item = style[key];
        if (/^[0-9.]+$|px$/.test(item)) {
            style[key] = parseInt(item);
        }
    }
    return style;
}

module.exports = layout;