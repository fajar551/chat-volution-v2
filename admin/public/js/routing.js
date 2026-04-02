const setup = () => {
    var uri = window.location.origin;
    if (
        [
            "http://localhost:8000",
            "http://localhost:8080",
            "http://127.0.0.1:8000",
            "https://127.0.1.1:8000",
        ].includes(uri)
    ) {
        window.base_url = `${uri}`;

        // window.base_url_live = "https://chatvolution.my.id";
        window.base_url_live = `${uri}`;
        window.BASE_SOCKET = "localhost:4000/agents";
        // window.BASE_SOCKET_V2 = "http://localhost:4001";
    } else {
        window.base_url = "https://chatvolution.my.id";
        window.base_url_live = "https://chatvolution.my.id";
        // window.BASE_SOCKET = "https://node.chatvolution.my.id/agents";
        window.BASE_SOCKET = "node2.chatvolution.my.id/agents";
        // window.BASE_SOCKET_V2 = "http://localhost:4001";
    }
};
setup();
