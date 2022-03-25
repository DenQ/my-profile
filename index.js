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
        const targetNode = node.querySelector('.section__wrap');

        if (targetNode) {
            targetNode.classList.add('animated');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ['#s1', '#s2', '#s3', '#s4', '#s5'].forEach((key) => {
        addAnimationCssClass(key);
    });
})
