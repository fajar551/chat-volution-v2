<script src="https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js"></script>

<script>
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "{{ env('FCM_API_KEY') }}",
        authDomain: "{{ env('FCM_AUTH_DOMAIN') }}",
        projectId: "{{ env('FCM_PROJECT_ID') }}",
        storageBucket: "{{ env('FCM_STORAGE_BUCKET') }}",
        messagingSenderId: "{{ env('FCM_MESSAGING_SENDER_ID') }}",
        appId: "{{ env('FCM_APP_ID') }}",
        measurementId: "{{ env('FCM_MEASURMENT_ID') }}"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    if (!Boolean(tk)) {
        var tk = localStorage.getItem('tk')
    }

    function initFirebaseMessagingRegistration() {
        messaging.requestPermission().then(function() {
            return messaging.getToken()
        }).then(function(token) {
            console.info('notification allowed: ', Boolean(token) ? true : false)
            axios.post("{{ route('fcmToken') }}", {
                _method: "PATCH",
                token
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "Authorization": "Bearer " + tk
                }
            }).then(({
                data
            }) => {
                console.info("push messaging success integration!")
            }).catch(({
                response: {
                    data
                }
            }) => {
                console.error(data)
            })

        }).catch(function(err) {
            console.log(`Token Error : ${err}`);
        });
    }

    initFirebaseMessagingRegistration();

    messaging.onMessage(function({
        data: {
            body,
            title
        }
    }) {
        new Notification(title, {
            body
        });
    });
</script>
