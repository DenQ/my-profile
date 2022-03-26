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
    ].forEach(addAnimationCssClass);

    document.querySelector('#btn-move').addEventListener('click', function() {
        setTimeout(() => {
            document.querySelector('#s2').scrollIntoView({
                behavior: 'smooth'
            });
        }, 0)
    });

    document.querySelector('#btn-submit').addEventListener('click', function(event) {
        event.preventDefault();
        // show captcha
        // send email
        console.log('Fire send form');
    })

})
