


  
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

    const firebaseConfig = {
    apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
    authDomain: "uplift-local.firebaseapp.com",
    projectId: "uplift-local",
    storageBucket: "uplift-local.appspot.com",
    messagingSenderId: "615612260052",
    appId: "1:615612260052:web:c7cac371c0698314e36541"
  };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Run immediately on page load
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User logged in:", user.email);
        window.location.replace("dashboard.html"); 
      } else {
        console.log("❌ No user logged in");
        window.location.replace("loginForm.html");
      }
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => firebase.auth().signInWithEmailAndPassword(email, password))
        .catch(err => console.error(err));
    });



