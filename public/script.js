
// Smooth scroll functionality
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        number: document.getElementById('number').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    const messageDiv = document.getElementById('submission-message');
    
    try {
        const response = await fetch('/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error submitting form');
        }

        messageDiv.className = 'success';
        messageDiv.textContent = result.message;
        document.getElementById('contact-form').reset();
    } catch (error) {
        messageDiv.className = 'error';
        messageDiv.textContent = error.message || 'Error submitting form. Please try again.';
        console.error('Error:', error);
    }
});

    document.getElementById("scrollButton").addEventListener("click", function() {
const contactSection = document.getElementById("contact");
contactSection.scrollIntoView({ behavior: 'smooth' });
});
