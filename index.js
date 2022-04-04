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
        const formElement = document.getElementById('contact-form');
        const spinnerElement = document.querySelector('.lds-facebook');
        const successBlock = document.querySelector('.notify-success-sending');

        const sendForm = () => {
            const formData = new FormData(formElement);
            console.log(123, spinnerElement);

            spinnerElement.style.display = 'inline';
            formElement.classList.add('muted');
            // return fetch('https://formspree.io/f/mlezwzkl', {
            //     method: 'POST',
            //     body: formData,
            //     headers: {
            //         'Accept': 'application/json'
            //     }
            // });
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(1);
                    resolve(1)
                }, 3000);
            });
        };

        sendForm()
            .then((r) => {
                console.log('Success', r);
                formElement.hidden = true;
                formElement.classList.remove('muted');
                spinnerElement.style.display = 'none';
                successBlock.style.display = 'inline-block'
                // show alert about success sending email
            })
            .catch((e) => {
                console.log(e);
                formElement.classList.remove('muted');
                spinnerElement.style.display = 'none';
                // show alert about fail sending email
            });
    });

    document.querySelector('#experience').innerHTML = String(getAge(new Date('2010-01-01')));

})
