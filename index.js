function onVisible(element, callback) {
    new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.intersectionRatio > 0) {
                callback(element);
                observer.disconnect();
            }
        });
    }).observe(element);
}

function addAnimationCssClass(selector) {
    onVisible(document.querySelector(selector), (node) => {
        node.classList.add('animated');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    [
        '#s1>.section__wrap',
        '#s2>.section__wrap',
        '#s3>.section__wrap',
        '#s4>.section__wrap',
        '#s5>.section__wrap'
    ].forEach(addAnimationCssClass);
})
