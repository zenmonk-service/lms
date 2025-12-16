document.addEventListener("DOMContentLoaded", function () {
    const textField = new mdc.textField.MDCTextField(document.querySelector('.mdc-text-field'));
    const form = document.querySelector('#form');
    const email = document.querySelector('.mdc-text-field__input');
    const errorText = document.querySelector('#error');
    const submitButton = document.querySelector('.submitButton');
    const inputOutline = document.querySelector('.mdc-text-field');
    const title = form.querySelector('.title');
    const description = form.querySelector('.description');

    form.addEventListener('input', function () {
        inputOutline.classList.remove('mdc-text-field--invalid');
        errorText.innerText = "";
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const msg = checkErrors(email.value.trim());
        if (msg) {
            errorText.classList.replace('helper-text', 'helper-text-error')
            errorText.innerText = msg;
            // inputOutline.classList.add('error');
            inputOutline.classList.add('mdc-text-field--invalid');
        } else {
            const url = form.action;
            try {
                submitButton.querySelector('.mdc-button__label').innerText = 'Loading...';
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: email.value })
                });

                const result = await response.json();
                if (result.status) {
                    showSnackbar(result.message, false);

                    form.classList.add('email-success');
                    title.innerText = 'Email Sent';
                    description.innerText = 'Check your email for further instructions.';
                    submitButton.querySelector('.mdc-button__label').innerText = 'Continue';
                    submitButton.addEventListener('click', function () {
                        window.location.href = 'https://mail.google.com/mail'
                    });
                } else {
                    submitButton.querySelector('.mdc-button__label').innerText = 'Submit';
                    showSnackbar(result.message, true);
                }
            } catch (error) {
                console.error(`Error: ${error.message}`);
                showSnackbar(error.message, true);
            }
            email.value = "";
        }
    });

    function checkErrors(email) {
        if (!email) {
            return "Email required";
        } else if (!isValidEmail(email)) {
            return "Invalid email";
        } else {
            return null;
        }
    }

    function isValidEmail(email) {
        const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/;
        return regex.test(email);
    }
});