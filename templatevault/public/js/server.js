import express from 'express';
import cors from 'cors';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import 'dotenv/config';

const app = express();
app.use(cors()); // Allows your website to talk to your server
app.use(express.json()); // Parses incoming JSON data

// Firebase Configuration (Make sure these are in your .env file!)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// The Route
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // 1. Save to Firebase
        const docRef = await addDoc(collection(db, "contacts"), {
            name,
            email,
            subject,
            message,
            timestamp: serverTimestamp()
        });

        // 2. Forward to Pipedream
        await fetch("https://eoh2tas57la7ws2.m.pipedream.net", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message, firebaseId: docRef.id })
        });

        res.status(200).json({ message: "Success!" });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));