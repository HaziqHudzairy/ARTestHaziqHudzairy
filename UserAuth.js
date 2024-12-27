import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase Initialization
const firebaseConfig = {
    apiKey: "AIzaSyBlNQExhusFbrsTgfei80LWmfR4o_IQwO8",
    authDomain: "um-ar-d0418.firebaseapp.com",
    databaseURL: "https://um-ar-d0418-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "um-ar-d0418",
    storageBucket: "um-ar-d0418.firebasestorage.app",
    messagingSenderId: "624660972499",
    appId: "1:624660972499:web:315e9c12fad881503c6526",
    measurementId: "G-XWMS36YF8Z"
  };

// Initialize Firebase authentication and database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Listen for the "Submit" button click in the register section
document.querySelector('.submit-button').addEventListener('click', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email-reg').value;
    const password = document.getElementById('password-reg').value;
    const confirmPassword = document.getElementById('password-reg-re-eenter').value;
    const clubName = document.getElementById('club-name').value;
    const clubType = document.getElementById('club-type').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional information in Firebase Realtime Database
        const userRef = ref(db, 'users/' + user.uid);
        await set(userRef, {
            email: email,
            clubName: clubName,
            clubType: clubType
        });

        // Show success message
        alert('Registration successful!');

        // Reset the form
        document.getElementById('email-reg').value = '';  // Reset email input
        document.getElementById('password-reg').value = '';  // Reset password input
        document.getElementById('password-reg-re-eenter').value = '';  // Reset re-enter password input
        document.getElementById('club-name').value = '';  // Reset club name input
        document.getElementById('club-type').value = '';  // Reset club type select dropdown


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

        // Optionally, redirect the user to another page or show a confirmation message
        // window.location.href = 'some_other_page.html'; // Redirect to a new page

        
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`Error: ${errorMessage}`);
    }

    
});

// Listen for the "Login" button click
document.querySelector('.login button').addEventListener('click', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    try {
        // Sign in user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // If Remember Me is checked, store the user's email and UID in localStorage
        if (rememberMe) {
            localStorage.setItem('email', user.email);
            localStorage.setItem('uid', user.uid);
        }


        // Show success message
        alert('Login successful!');

        // Redirect to Dashboard with the email or user ID in the URL
        window.location.href = `Dashboard.html?email=${encodeURIComponent(user.email)}&uid=${user.uid}`;
        
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`Error: ${errorMessage}`);
    }
});

// Listen for the "Forgot Password" link click
document.getElementById('forgot-password').addEventListener('click', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('Password reset email sent! Check your inbox.');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});
