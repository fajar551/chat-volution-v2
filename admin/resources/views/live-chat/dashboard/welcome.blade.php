@extends('layouts.app-chat.app')
@section('content')
    <div class="row mt-3 d-flex justify-content-center">
        <div class="col-12 col-md-10 col-lg-10">
            <div class="card">
                <div class="card-body">
                    <div class="media mb-4">
                        <img class="avatar w-25 rounded mr-4"
                            src="{{ asset('assets/images/illustration/il-welcome-tangerin.svg') }}" alt="thumbnail-welcome">
                        <div class="media-body">
                            <h2 class="mt-0 font-size-20 font-weight-bold text-dark" id="welcome-msg"></h2>
                            <p class="mb-2" id="welcome-desc"></p>
                            <p class="mb-0" id="welcome-email"></p>
                            <p class="mb-0" id="welcome-contact"></p>
                            <p class="mb-0" id="welcome-roles"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('footer')
    @include('shared.footer')
    <script>
        console.info('jitsi testing')
        JitsiMeetJS.init();

        var connection = new JitsiMeetJS.JitsiConnection(null, null, {serviceUrl: "https://meet.jit.si", hosts: {domain: "meet.jit.si", muc: null, anonymousdomain: null} });

        connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, () => {
            console.log("success");
        });
        connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, () => {
            console.log("failed");
        });
        connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, () => {
            console.log("dc");
        });

        connection.connect();

        room = connection.initJitsiConference("conference1", {
            recordingType: null,
            callStatsID: null,

        });
        room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
        room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);

        room.join();
    </script>
@endsection
