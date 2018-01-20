import $ from 'zepto';

export const extractURL = (propVal) => {
    const m = propVal.match(/url\(("|')(.*)("|')\)/)
    if (!m) return undefined;
    return m[2];
};

export const getMaxZIndex = () =>
    Math.max.apply(null, $.map($('body *'), (e,n) => {
        if ($(e).css('position') != 'static')
            return parseInt($(e).css('z-index')) || 1;
    }));
