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

function captchaHandler (solution) {
    document.getElementById('btn-submit').classList.remove('disabled')
}

function rerenderNode(element) {
    if (element ) {
        const clone = element.cloneNode(true);
        element.replaceWith(clone);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    [
        '#s1>.section__wrap',
        '#s2>.section__wrap',
        '#s3>.section__wrap',
        '#s4>.section__wrap',
    ].forEach(addAnimationCssClass);

    document.getElementById('btn-move').addEventListener('click', function(event) {
        event.preventDefault();
        setTimeout(() => {
            document.querySelector('#s2').scrollIntoView({
                behavior: 'smooth'
            });
        }, 0);

        // Notice: This element(btn) always is fire after click. Because
        setTimeout(() => {
            const element = document.getElementById('btn-move');
            rerenderNode(element);
        }, 1000);
    });

    document.querySelector('#btn-submit').addEventListener('click', function(event) {
        const formElement = document.getElementById('contact-form');
        const formData = new FormData(formElement);
        const values = [formData.getAll('email')[0], formData.getAll('message')[0]];
        const isValidForm = values.every(Boolean);

        if (!isValidForm) return;

        event.preventDefault();

        const buttonSubmit = document.getElementById('btn-submit');
        const spinnerElement = document.querySelector('.lds-facebook');
        const successBlock = document.querySelector('.notify-success-sending');
        const errorsBlock = document.querySelector('.form-errors');

        const sendForm = () => {
            spinnerElement.style.display = 'inline';
            errorsBlock.style.display = 'none';
            formElement.classList.add('muted');

            return fetch('https://formspree.io/f/mlezwzkl', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            // return new Promise((resolve, reject) => {
            //     setTimeout(() => {
            //         resolve(1)
            //         // reject(2)
            //     }, 2000);
            // });
        };

        sendForm()
            .then((r) => {
                formElement.hidden = true;
                formElement.classList.remove('muted');
                spinnerElement.style.display = 'none';
                successBlock.style.display = 'inline-block'
            })
            .catch((e) => {
                console.log(e);
                formElement.classList.remove('muted');
                spinnerElement.style.display = 'none';
                errorsBlock.style.display = 'inline-block';
            });
    });

    document.querySelector('#experience').innerHTML = String(getAge(new Date('2010-01-01')));
})
