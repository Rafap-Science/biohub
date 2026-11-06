const loginForm = document.querySelector("#login-form");
const loginButton = document.querySelector("#btn-login");
const loginMessage = document.querySelector("#login-message");
const matriculaInput = document.querySelector("#matricula");
const passwordInput = document.querySelector("#password");
const forgotPasswordButton = document.querySelector("#btn-forgot-password");
const passwordVisibilityButton = document.querySelector("#visible-password");

const LOGIN_ENDPOINT = "http://127.0.0.1:8000/api/login";

function setLoginLoading(isLoading) {
    loginButton.classList.toggle("is-loading", isLoading);
    loginButton.disabled = isLoading;
    loginButton.setAttribute("aria-busy", String(isLoading));
}

function showLoginMessage(message, status = "") {
    loginMessage.textContent = message;
    loginMessage.classList.remove("is-success", "is-error");

    if (status) {
        loginMessage.classList.add(`is-${status}`);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginLoading(true);
    showLoginMessage("");

    try {
        const response = await fetch(LOGIN_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                matricula: matriculaInput.value,
                password: passwordInput.value
            })
        });
        const result = await response.json();

        if (response.ok) {
            showLoginMessage(result.message, "success");
        } else if (response.status === 401) {
            showLoginMessage(result.message, "error");
        } else {
            throw new Error(result.message || "Erro inesperado no servidor.");
        }
    } catch (error) {
        console.error("Falha ao comunicar com o servidor de login:", error);
        showLoginMessage(
            "Não foi possível conectar ao servidor. Inicie a aplicação Python e tente novamente.",
            "error"
        );
    } finally {
        setLoginLoading(false);
    }
}

function handleForgotPassword() {
    showLoginMessage(
        "A recuperação de senha não está disponível nesta demonstração local."
    );
}

function togglePasswordVisibility() {
    const isPasswordVisible = passwordInput.type === "text";

    passwordInput.type = isPasswordVisible ? "password" : "text";
    passwordVisibilityButton.textContent = isPasswordVisible ? "Mostrar" : "Ocultar";
    passwordVisibilityButton.setAttribute("aria-pressed", String(!isPasswordVisible));
}

loginForm.addEventListener("submit", handleLoginSubmit);
forgotPasswordButton.addEventListener("click", handleForgotPassword);
passwordVisibilityButton.addEventListener("click", togglePasswordVisibility);
