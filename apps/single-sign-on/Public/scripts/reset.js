document.addEventListener("DOMContentLoaded", function () {
  const map = { password: 0, confirmPassword: 1 };
  const textFields = document.querySelectorAll(".mdc-text-field");
  textFields.forEach((textFieldElement) => {
    new mdc.textField.MDCTextField(textFieldElement);
  });

  const form = document.querySelector("#form");
  const inputElements = document.querySelectorAll(".mdc-text-field__input");
  const passwordIcons = form.querySelectorAll(".password-icon-button");
  const submitButton = form.querySelector(".submitButton");
  const errors = form.querySelectorAll(
    ".mdc-text-field-helper-text--validation-msg"
  );
  const textFieldInputs = form.querySelectorAll(".mdc-text-field");
  const title = form.querySelector(".title");
  const description = form.querySelector(".description");
  const submitButtonLabel = submitButton.querySelector(".mdc-button__label");

  passwordIcons.forEach((passwordIcon, index) => {
    // Toggle password icon
    passwordIcon.addEventListener("click", (event) => {
      const value = event.target.textContent;
      if (value === "visibility") {
        inputElements[index].type = "text";
        event.target.textContent = "visibility_off";
      } else {
        inputElements[index].type = "password";
        event.target.textContent = "visibility";
      }
    });
  });

  function validateStrongPassword(input) {
    const { value } = input;
    if (!value) return "Password required";
    if (value.length < 8) return "password too short";
    else if (!/[a-z]/.test(value))
      return "password must contain at least one lowercase letter";
    else if (!/[A-Z]/.test(value))
      return "password must contain at least one uppercase letter";
    else if (!/[0-9]/.test(value))
      return "password must contain at least one number";
    else if (!/[!@#$%^&*()\-+={}[\]:;"'<>,.?\/|\\]/.test(value))
      return "password must contain at least one special character";
    return "";
  }

  // on Change remove errors
  form.addEventListener("keydown", function (event) {
    const index = map[event.target.name];
    textFieldInputs[index].classList.remove("mdc-text-field--invalid");
    errors[index].textContent = "";
  });

  function validateConfirmPassword(input) {
    const { value } = input;
    if (!value) return "Password required";
    if (inputElements[0].value !== inputElements[1].value)
      return "Password does not match";
  }

  // validating input fields
  function validateInputFields() {
    inputElements.forEach((input, index) => {
      let error = "";
      if (input.name === "password") {
        error = validateStrongPassword(input);
      } else {
        error = validateConfirmPassword(input);
      }
      if (error) {
        textFieldInputs[index].classList.add("mdc-text-field--invalid");
        errors[index].textContent = error;
        errors[index].classList.replace("helper-text", "helper-text-error");
      }
    });
    return document.querySelector(".mdc-text-field--invalid");
  }

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();
    if (submitButtonLabel.innerText === "CONTINUE") {
      window.location = window.FRONTEND_URL || 'https://ibms-zenmonk.vercel.app';
    } else {
      const error = validateInputFields();
      // if (!error) window.alert('submitted!');
      if (!error) {
        const url = form.action;
        const data = { password: inputElements[0].value };
        try {
          const queryParams = new URLSearchParams({
            uid: new URLSearchParams(window.location.search).get("uid"),
          });
          const urlWithQuery = `${url}?${queryParams}`;

          const response = await fetch(urlWithQuery, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          if (result.status) {
            showSnackbar(result.message, false);

            form.classList.add("email-success");
            title.innerText = "Password Reset Successfully";
            description.innerText =
              "Click on continue to redirect to login page.";
            submitButtonLabel.innerText = "Continue";
          } else showSnackbar(result.message, true);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          showSnackbar(error.message, true);
        }

        clearInputValues();
      }
    }

    // form submitted function
  });
});
