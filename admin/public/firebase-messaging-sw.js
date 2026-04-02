importScripts("https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js");

firebase.initializeApp({
    apiKey: "AIzaSyCHkz2QMORYsL9U7jtRTo1rhdTemK_F0KU",
    projectId: "chatvolu-dev",
    messagingSenderId: "660940477079",
    appId: "1:660940477079:web:787a78711aabf115158fd2",
});

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function ({
    data: { title, body, icon },
}) {
    console.warn("show notification running!!!");
    return self.registration.showNotification(title, { body, icon });
});
