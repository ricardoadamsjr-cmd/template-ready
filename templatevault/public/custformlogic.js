console.log("1. JS LOADED: Path is correct.");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
    authDomain: "uplift-local.firebaseapp.com",
    projectId: "uplift-local",
    storageBucket: "uplift-local.firebasestorage.app",
    messagingSenderId: "615612260052",
    appId: "1:615612260052:web:c7cac371c0698314e36541"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("2. FIREBASE READY");

// Wrap everything in an "init" function to ensure the HTML is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("3. HTML CONTENT FULLY LOADED");

    const addImageBtn = document.getElementById('addImageBtn');
    const addRequestBtn = document.getElementById('addRequestBtn');
    const form = document.getElementById('setupForm');

    // --- DYNAMIC IMAGE LOGIC ---
    if (addImageBtn) {
        addImageBtn.addEventListener('click', () => {
            console.log("Adding image field...");
            const container = document.getElementById('dynamic-images');
            const div = document.createElement('div');
            div.className = 'image-group';
            div.style = "margin-bottom: 25px; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 10px;";
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label style="margin-bottom:0">Additional Image</label>
                    <button type="button" class="remove-btn" style="color: #ff4d4d; background: none; border: 1px solid #ff4d4d; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Delete</button>
                </div>
                <input type="file" class="gallery-img" accept="image/*">
            `;
            div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
            container.appendChild(div);
        });
    }

    // --- DYNAMIC REQUEST LOGIC ---
    if (addRequestBtn) {
        addRequestBtn.addEventListener('click', () => {
            console.log("Adding request field...");
            const container = document.getElementById('dynamic-fields');
            const div = document.createElement('div');
            div.className = 'request-group';
            div.style = "margin-bottom: 25px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);";
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label style="margin-bottom:0">Custom Request</label>
                    <button type="button" class="remove-btn" style="color: #ff4d4d; background: none; border: 1px solid #ff4d4d; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Remove</button>
                </div>
                <input type="text" class="custom-title" placeholder="Request Title">
                <textarea class="custom-desc" rows="2" placeholder="Explain here..."></textarea>
            `;
            div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
            container.appendChild(div);
        });
    }

    // --- FORM SUBMIT LOGIC ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email').value.trim();
            console.log("Searching for customer:", emailInput);

            try {
                const q = query(collection(db, "customers"), where("email", "==", emailInput));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    alert("Found customer! Submitting data...");
                    await addDoc(collection(db, "form_submissions"), {
                        email: emailInput,
                        businessName: document.getElementById('business_name').value,
                        industry: document.getElementById('industry').value,
                        timestamp: serverTimestamp()
                    });
                    alert("Submission successful!");
                } else {
                    alert("Email not found in our records.");
                }
            } catch (err) {
                console.error("Submission error:", err);
                alert("Error: " + err.message);
            }
        });
    }
});