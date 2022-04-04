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

function getAge(birthday) { // birthday is a date
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); // milliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
        const form = document.getElementById('contact-form-form');
        const formData = new FormData(form);

        fetch('https://formspree.io/f/mlezwzkl', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then((r) => {
                console.log('Success', r);
            })
            .catch((e) => {
                console.log(e);
            });
    });

    document.querySelector('#experience').innerHTML = String(getAge(new Date('2010-01-01')));

})
