

document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.input-container input');

    inputs.forEach(input => {
        // Trigger animation when input is focused
        input.addEventListener('focus', function () {
            const label = input.nextElementSibling;
            label.classList.add('focused');
        });

        // Trigger animation when input is blurred (unfocused) and still has value
        input.addEventListener('blur', function () {
            const label = input.nextElementSibling;
            if (input.value === '') {
                label.classList.remove('focused');
            }
        });

        // Trigger animation when input is filled (even before focus)
        input.addEventListener('input', function () {
            const label = input.nextElementSibling;
            if (input.value !== '') {
                label.classList.add('focused');
            } else {
                label.classList.remove('focused');
            }
        });
    });
});

document.getElementById('register-btn').addEventListener('click', function() {
    const login = document.querySelector('.login');
    const register = document.querySelector('.register');
    const registerContainer = document.querySelector('.register .container');
    const registerContent = document.querySelector('.register-content');

    // Hide login section with animation
    setTimeout(() => {
        login.style.display = 'none'; // Hide after animation
    }, 1000); // Match the animation duration (1 second)

    // Add the 'active' class to the register section to trigger the animation
    register.classList.add('active');

    // Hide register container and show register content after animation
    setTimeout(() => {
        registerContainer.style.display = 'none'; // Hide the container
        registerContent.classList.remove('fade-out');
        registerContent.classList.add('fade-in'); // Add fade-in class to show the content
    }, 500); // Delay matches the fade-out animation duration
});

document.getElementById('cancel-btn').addEventListener('click', function() {
    const login = document.querySelector('.login');
    const register = document.querySelector('.register');
    const registerContainer = document.querySelector('.register .container');
    const registerContent = document.querySelector('.register-content');

    // Show login section again
    login.style.display = 'flex';
    
    // Remove the 'active' class to hide the register section
    register.classList.remove('active');

    registerContent.classList.remove('fade-in');
    // Hide register content with fade-out animation
    registerContent.classList.add('fade-out');
    
    // Show the register container and trigger fade-in animation
    registerContainer.style.display = 'flex';
    registerContainer.classList.add('fade-in');
    
    
});




