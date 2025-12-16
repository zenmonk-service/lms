document.addEventListener("DOMContentLoaded", function () {
    // mapping for name to get the particular textfield
    const map = {  'email': 0, 'password': 1 };
    const textFields = document.querySelectorAll('.mdc-text-field');
    const checkbox = new mdc.checkbox.MDCCheckbox(document.querySelector('.mdc-checkbox'));
    textFields.forEach(textFieldElement => {
        new mdc.textField.MDCTextField(textFieldElement);
    });

    //getting the redirectURL from query string
    const params = (new URL(document.location)).searchParams;
    const redirectURL = params.get('redirectURL');

    const submitButton = document.querySelector('.submitButton');
    const form = document.querySelector('#form');
    const inputElements = form.querySelectorAll('.mdc-text-field__input');
    const textFieldInputs = form.querySelectorAll('.mdc-text-field');
    const errors = form.querySelectorAll('.mdc-text-field-helper-text--validation-msg');
    const passwordIcon = document.querySelector('#password-icon-button');
    const forgotPassword = document.querySelector('.forgotPassword');

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const error = validateInputFields();

        if(!error) {
            console.log('form: ');
            const url = form.action;
            const data = {
                email: inputElements[0].value,
                password: inputElements[1].value
            }
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                      },
                    body: JSON.stringify(data)
                });
                console.log('response: ', response);
                const result = await response.json();
                console.log('result: ', result);
                if (result.status) {
                    showSnackbar(result.message,false);
                    // setTimeout(()=>{
                    window.location.href = redirectURL;
                    // },1000)
                } else showSnackbar(result.message,true);
                
            } catch (error) {
                console.error(`Error: ${error.message}`);
                showSnackbar(error.message,true);
            }

            clearInputValues();
        }
        
    });

    forgotPassword.addEventListener('click', ()=> {
        clearInputValues();
    })

    function clearInputValues() {
        inputElements.forEach(input=>{
            input.value="";
        })
    }

    // validating input fields
    function validateInputFields(){
        inputElements.forEach((input,index)=>{
            let error = '';
            if(input.name === 'email') {
                error = validateEmail(input);
            }else{
                error = validatePassword(input);
            }
            if(error) {
                textFieldInputs[index].classList.add('mdc-text-field--invalid');
                errors[index].textContent = error;
            }
        })
        return document.querySelector('.mdc-text-field--invalid');
    }

    // on Change remove errors
    form.addEventListener('keydown', function (event) {
        const index = map[event.target.name];
        textFieldInputs[index].classList.remove('mdc-text-field--invalid');
        errors[index].textContent = '';
    });

    // Toggle password icon
    passwordIcon.addEventListener('click',(event)=>{
        const value = event.target.textContent;
        if(value === 'visibility') {
            inputElements[1].type = 'text';
            event.target.textContent = 'visibility_off';
        }else {
            inputElements[1].type = 'password';
            event.target.textContent = 'visibility';
        }
    })

    // helper functions
    function validateEmail(input) {
        let error = '';
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if(!input.value.trim()) {
            error = 'Email required';
            input.value = "";
        }
        else if(!emailPattern.test(input.value)) error = 'Invalid email';
        return error;
    }

    function validatePassword(input) {
        let error = '';
        if(!input.value.trim()) {
            error = 'Password required';
            input.value = "";
        }
        return error;
    }
});