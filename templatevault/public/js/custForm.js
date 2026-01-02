import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 1. YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 2. DYNAMIC FIELD LOGIC
const addImageBtn = document.getElementById('addImageBtn');
const addRequestBtn = document.getElementById('addRequestBtn');

addImageBtn?.addEventListener('click', () => {
    const container = document.getElementById('dynamic-images');
    const div = document.createElement('div');
    div.className = 'image-group';
    div.innerHTML = `<label>Additional Image</label><input type="file" class="gallery-img" accept="image/*">`;
    container.appendChild(div);
});

addRequestBtn?.addEventListener('click', () => {
    const container = document.getElementById('dynamic-fields');
    const id = Date.now();
    const html = `
        <div class="request-group" id="req-${id}" style="margin-top:15px; border-top:1px solid #333; padding-top:10px;">
            <input type="text" class="custom-title" placeholder="Request Title">
            <textarea class="custom-desc" placeholder="Details..."></textarea>
        </div>`;
    container.insertAdjacentHTML('beforeend', html);
});

// 3. UPLOAD HELPER
async function uploadFile(file, path) {
    if (!file) return null;
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

// 4. FORM SUBMISSION
const form = document.getElementById('setupForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "UPLOADING...";
    btn.disabled = true;

    try {
        // Handle Logo
        const logoFile = document.getElementById('logo').files[0];
        const logoUrl = await uploadFile(logoFile, 'logos');

        // Handle Gallery Images
        const galleryFiles = document.querySelectorAll('.gallery-img');
        const galleryUrls = [];
        for (let input of galleryFiles) {
            if (input.files[0]) {
                const url = await uploadFile(input.files[0], 'gallery');
                galleryUrls.push(url);
            }
        }

        // Handle Custom Requests
        const requests = [];
        document.querySelectorAll('.request-group').forEach(group => {
            requests.push({
                title: group.querySelector('.custom-title').value,
                desc: group.querySelector('.custom-desc').value
            });
        });

        // Save everything to Firestore
        await addDoc(collection(db, "submissions"), {
            email: document.getElementById('email').value,
            businessName: document.getElementById('business_name').value,
            industry: document.getElementById('industry').value,
            brandColor: document.getElementById('brand_color').value,
            logoUrl: logoUrl,
            gallery: galleryUrls,
            customRequests: requests,
            submittedAt: new Date()
        });

        alert("Success! Your project is being built.");
        form.reset();
    } catch (error) {
        console.error("Submission error:", error);
        alert("Error uploading. Check console.");
    } finally {
        btn.innerText = "LAUNCH MY PROJECT";
        btn.disabled = false;
    }
});