import { EmojiButton } from "https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@4.6.0";

function loadScript(url) {
    return new Promise((resolve, reject) => {
        var script = document.createElement("script");
        script.src = url;
        script.onload = () => {
            resolve();
        };
        document.head.appendChild(script);
    });
}

// await loadScript(
//     "https://chatvolution.my.id/assets/libs/linkify/linkifyjs/dist/linkify.min.js"
// );

// await loadScript(
//     "https://chatvolution.my.id/assets/libs/linkify/linkify-html/dist/linkify-html.min.js"
// );

// await loadScript(
//     "https://chatvolution.my.id/assets/libs/linkify/linkify-element/dist/linkify-element.js"
// );

window.picker = new EmojiButton({
    autoHide: false,
    showVariants: true,
    showCategoryButtons: true,
    showRecents: true,
    showSearch: false,
    showPreview: false,
    position: "top-start",
    emojiSize: "18px",
    emojisPerRow: 8,
    rows: 5,
    showVariants: false,
    styleProperties: {
        "--category-button-active-color": "#104dd1",
    },
});

String.prototype.insertString = function (index, string) {
    if (index > 0) {
        return this.substring(0, index) + string + this.substr(index);
    }

    return string + this;
};

const Validate = async () => {
    /* origin url */
    var originName = location.origin;
    let fileJs = "";

    /* condition url */
    var BASE_URL = null;
    BASE_URL = "http://localhost:8000";
    fileJs = `${originName}/lib/index.js`;

    // if (
    //     ["127.0.0.1", "127.0.0.0", "localhost", "local"].includes(
    //         location.hostname
    //     )
    // ) {
    //     BASE_URL = "http://localhost:8000";
    //     fileJs = `${originName}/lib/index.js`;
    // } else {
    //     BASE_URL = "https://chatvolution.my.id";
    //     fileJs = "https://code.chatvolution.my.id/lib/index.js";
    // }

    /* get Api Key */
    const lApiKey = localStorage.getItem("api_key");

    if (lApiKey == null || lApiKey == false || lApiKey == "") {
        await console.warn(
            `NoApiKeys, example: https://qchat.com/js/qchat.js?api_key=#your_API_KEYS`
        );
    } else {
        const config = await {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        };
        await fetch(
            `${BASE_URL}/api/validate-client?api_key=${lApiKey}`,
            config
        )
            .then((response) => response.json())
            .then(async (response) => {
                if (response.code == 200) {
                    /* get file javascript */

                    await loadScript(
                        "http://localhost:8000/assets/libs/linkify/linkifyjs/dist/linkify.min.js"
                        // "https://chatvolution.my.id/assets/libs/linkify/linkifyjs/dist/linkify.min.js"
                    );

                    await loadScript(
                        "http://localhost:8000/assets/libs/linkify/linkify-html/dist/linkify-html.min.js"
                        // "https://chatvolution.my.id/assets/libs/linkify/linkify-html/dist/linkify-html.min.js"
                    );

                    await loadScript(
                        "http://localhost:8000/assets/libs/linkify/linkify-element/dist/linkify-element.js"
                        // "https://chatvolution.my.id/assets/libs/linkify/linkify-element/dist/linkify-element.js"
                    );

                    const script = document.createElement("script");
                    window.qchat_skey = lApiKey;
                    script.type = "text/javascript";
                    const incJs = await fetch(fileJs).then((res) => res.url);

                    script.src = incJs;
                    document.body.appendChild(script);
                } else {
                    console.error(
                        "😔",
                        "\n status: " + response.status,
                        "\n message: " + response.message
                    );
                }
            });
    }
};

(async function () {
    // const myTags = document.getElementsByTagName("script");
    const myTags = document.getElementById("qchat-client");
    const src = myTags.src;

    var BASE_URL = null;
    BASE_URL = "http://localhost:8000";

    const api_key = !unescape(src).split("api_key=")[1]
        ? false
        : unescape(src).split("api_key=")[1].split("&")[0];
    await localStorage.setItem("api_key", api_key);
    await Validate();
})();
