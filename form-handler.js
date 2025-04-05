// form-handler.js
window.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('contact-form');
    // Create a status element dynamically if it doesn't exist, or find an existing one
    let status = document.getElementById('form-status'); 
    if (!status) {
        status = document.createElement('p');
        status.id = 'form-status'; // Give it an ID for potential styling/finding later
        form.parentNode.insertBefore(status, form.nextSibling); // Add status element after the form
    }
    status.textContent = ""; // Clear status on load

    form.addEventListener("submit", function(ev) {
        ev.preventDefault(); // Prevent default page reload

        // --- reCAPTCHA Check ---
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            status.textContent = "Please complete the CAPTCHA.";
            status.style.color = 'red';
            // Optional: Add visual cue to CAPTCHA box
            const recaptchaWidget = form.querySelector('.g-recaptcha');
            if (recaptchaWidget) {
                recaptchaWidget.style.border = '1px solid red';
                setTimeout(() => { recaptchaWidget.style.border = 'none'; }, 2000);
            }
            return; // Stop submission
        }
        // --- End reCAPTCHA Check ---

        status.textContent = "Sending...";
        status.style.color = 'black'; // Reset color

        const data = new FormData(form);
        
        // --- Fetch Call ---
        fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json' // Request JSON response from Formspree
            }
        }).then(response => {
            // --- Handle Response ---
            if (response.ok) {
                // SUCCESS! Redirect to the thanks.html page
                status.textContent = "Success! Redirecting..."; // Optional brief message
                status.style.color = 'green';
                window.location.href = "thanks.html"; // <-- THE REDIRECT HAPPENS HERE
                // No need to reset the form here, as we are leaving the page.
            } else {
                // ERROR from Formspree (e.g., validation error, server error)
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        status.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else if (Object.hasOwn(data, 'error')) {
                         status.textContent = data["error"];
                         // Specific check for reCAPTCHA error from Formspree backend
                         if (data["error"].toLowerCase().includes('captcha')) {
                            grecaptcha.reset(); // Reset captcha if it failed server-side
                         }
                    } else {
                        status.textContent = "Oops! There was a problem submitting your form. Status: " + response.status;
                    }
                    status.style.color = 'red';
                }).catch(() => {
                     // Fallback if response isn't JSON or parsing fails
                     status.textContent = "Oops! There was a problem submitting your form. Status: " + response.status;
                     status.style.color = 'red';
                });
            }
            // --- End Handle Response ---
        }).catch(error => {
            // Network Error (fetch failed entirely)
            status.textContent = "Oops! There was a network error trying to send your message.";
            status.style.color = 'red';
            console.error("Fetch Error:", error);
        });
        // --- End Fetch Call ---
    });
});
