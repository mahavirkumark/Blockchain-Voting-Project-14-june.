import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZaQ457d_6VcMsn-ea7-nYvOBEwFyJ36E",
    authDomain: "blockchain-496f3.firebaseapp.com",
    projectId: "blockchain-496f3",
    storageBucket: "blockchain-496f3.firebasestorage.app",
    messagingSenderId: "532961221280",
    appId: "1:532961221280:web:14b6d99f9b89975d4ac7c5",
    measurementId: "G-1NBF9X7218"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to load unverified users
async function loadUnverifiedUsers() {
    const userListDiv = document.getElementById('userList');
    userListDiv.innerHTML = ''; // Clear existing content

    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.forEach((docSnapshot) => {
            const userData = docSnapshot.data();
            const userItem = document.createElement('div');
            userItem.classList.add('user-item');
            userItem.innerHTML = `
                <p>${userData.firstName} ${userData.lastName} - ${userData.email}</p>
                <button class="done-btn" onclick="verifyUser('${docSnapshot.id}', '${userData.email}', '${userData.firstName}', '${userData.lastName}', '${userData.password}')">Done</button>
            `;
            userListDiv.appendChild(userItem);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to load unverified users.');
    }
}

// Function to verify a user
async function verifyUser(userId, email, firstName, lastName, password) {
    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare verified user data
        const verifiedUserData = {
            email: email,
            firstName: firstName,
            lastName: lastName
        };

        // Add user to 'verifiedUser' collection
        await setDoc(doc(db, 'verifiedUser', user.uid), verifiedUserData);

        // Delete user from 'users' collection
        await deleteDoc(doc(db, 'users', userId));

        alert('User verified and moved to verifiedUser.');
        loadUnverifiedUsers(); // Reload the user list
    } catch (error) {
        console.error('Error verifying user:', error);
        if (error.code === 'auth/email-already-in-use') {
            alert('This email is already in use.');
        } else if (error.code === 'auth/invalid-email') {
            alert('Invalid email address.');
        } else if (error.code === 'auth/weak-password') {
            alert('The password is too weak.');
        } else {
            alert(`Error: ${error.message}`);
        }
    }
}

// Attach functions to the global window object
window.verifyUser = verifyUser;

// Load unverified users on page load
window.onload = function () {
    loadUnverifiedUsers();
};
