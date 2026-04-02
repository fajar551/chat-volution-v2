<div class="modal fade " id="copy-clypboard" tabindex="-1" role="dialog" aria-labelledby="copy-clypboard" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="copy-clypboard">
                    <i class="fas fa-eye mr-2"></i> View API Key
                </h5>
            </div>
            <div class="modal-body">
                <label>Api Key</label>
                <div class="page-copy">
                    <span class="copy">
                        {{-- <p id="tk-code"></p> --}}
                        <p id="tk-code"></p>
                    </span>
                    <button class="btn-sm btn-secondary btn-copy" data-toggle="tooltip" data-placement="top"
                        title="Drag All Api Key" onclick="copy()" onmouseout="outCursor()">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="justify-content-between d-flex py-2">
                    <label class="align-self-center">How to use <b>API Key</b>: </label>
                    <button class="btn btn-outline-primary" id="copy-button">Copy Code</button>
                </div>
                <ul class="sublime">
                    <li class="buttons"></li>
                    <li>
                        <span class="gray">
                            /* Copy and paste in your project */
                        </span>
                        <br>
                        <code id="text-element">
                            <br>
                            &lt;script&gt;
                             <br>
                            var iframe = document.createElement('iframe');<br>
                            iframe.id = "genio-chat"<br>
                            document.body.appendChild(iframe);<br>
                            <br>
                            <br>
                            var htmlcode = `<br>
                                &lt;style&gt;<br>
                                    body {<br>
                                        --chakra-colors-chakra-body-bg:transparent;  <br>
                                        --chakra-colors-blackAlpha-600:0;<br>
                                    }<br>
                                    <br>
                                    .css-wondsy {<br>
                                        padding-inline-start: 0 !important;<br>
                                        padding-inline-end: 0 !important;<br>
                                    }<br>
                                    <br>
                                &lt;/style&gt;<br>
                                &lt;link rel="stylesheet" type="text/css"  href="https://client-chat.genio.id/static/css/main.css" &gt;<br>
                                &lt;script type="module" id="qchat-client" src="https://client-chat.genio.id/static/js/bundle.js?api_key=$2y$10$27oS4dJ2pjhqyLY7AesuP.tN8OcTrYCFZ39EQ3rn.gEMvOzr6Zgfy" onload="addEvent()"&gt;&lt;` + `/script&gt;<br>
                                &lt;script&gt;<br>
                                
                                    window.mobileCheck = function detectMob() {<br>
                                        const toMatch = [<br>
                                            /Android/i,<br>
                                            /webOS/i,<br>
                                            /iPhone/i,<br>
                                            /iPad/i,<br>
                                            /iPod/i,<br>
                                            /BlackBerry/i,<br>
                                            /Windows Phone/i<br>
                                        ];<br>
                                        <br>
                                        return toMatch.some((toMatchItem) => {<br>
                                            return navigator.userAgent.match(toMatchItem);<br>
                                        });<br>
                                    }<br>
                                    <br>
                                    function waitForElm(selector) {<br>
                                        return new Promise(resolve => {<br>
                                            if (document.querySelector(selector)) {<br>
                                                return resolve(document.querySelector(selector));<br>
                                            }<br>
                                    <br>
                                            const observer = new MutationObserver(mutations => {<br>
                                                if (document.querySelector(selector)) {<br>
                                                    resolve(document.querySelector(selector));<br>
                                                    observer.disconnect();<br>
                                                }<br>
                                            });<br>
                                    <br>
                                            observer.observe(document.body, {<br>
                                                childList: true,<br>
                                                subtree: true<br>
                                            });<br>
                                        });<br>
                                    }<br>
                                    <br>
                                    function waitForElmAll(selector) {<br>
                                        return new Promise(resolve => {<br>
                                            if (document.querySelectorAll(selector)) {<br>
                                                return resolve(document.querySelectorAll(selector));<br>
                                            }<br>
                                    <br>
                                            const observer = new MutationObserver(mutations => {<br>
                                                if (document.querySelectorAll(selector)) {<br>
                                                    resolve(document.querySelectorAll(selector));<br>
                                                    observer.disconnect();<br>
                                                }<br>
                                            });<br>
                                    <br>
                                            observer.observe(document.body, {<br>
                                                childList: true,<br>
                                                subtree: true<br>
                                            });<br>
                                        });<br>
                                    }<br>
                                    <br>
                                    <br>
                                    function setClipPathDown(){<br>
                                        setTimeout(function(){<br>
                                            if (window.mobileCheck()){<br>
                                                window.parent.document.querySelector('#genio-chat').style.clipPath = 'inset(85% 0px 0% 75%)';   <br> 
                                            } else {<br>
                                                window.parent.document.querySelector('#genio-chat').style.clipPath = 'inset(80% 0px 0% 90%)';    <br>
                                            } <br>
                                        },500)<br>
                                    }<br>
                                    <br>
                                    <br>
                                    // This function for add clipath, so user can click link behind iframe<br>
                                    <br>
                                    function addEvent(){<br>
                                        document.querySelector('#root-client-chatvolution').onclick = function(ev){<br>
                                            <br>
                                            if (window.mobileCheck()){<br>
                                            <br>
                                                window.parent.document.querySelector('#genio-chat').style.bottom = "1px";<br>
                                                window.parent.document.querySelector('#genio-chat').style.right = "2px";<br>
                                                window.parent.document.querySelector('#genio-chat').style.width = "99%";<br>
                                                window.parent.document.querySelector('#genio-chat').style.height = "99%";<br>
                                                window.parent.document.querySelector('#genio-chat').style.clipPath = 'none'; <br>
                                                <br>
                                            } else {<br>
                                                window.parent.document.querySelector('#genio-chat').style.clipPath = 'inset(13% 0px 0% 70%)';<br>
                                            }<br>
                                            <br>
                                            <br>
                                            <br>
                                            waitForElm('.chakra-menu__menuitem[data-index="0"]')<br>
                                                .then((elm) => {<br>
                                                <br>
                                                    elm.onclick = () => {<br>
                                                        setClipPathDown();<br>
                                                    }<br>
                                                    <br>
                                                });<br>
                                                <br>
                                                <br>
                                            waitForElm('button > svg')<br>
                                                .then((elm) => {<br>
                                                    <br>
                                                    if (elm.classList.contains('chakra-icon')){<br>
                                                        <br>
                                                        elm.onclick = () => {<br>
                                                            setClipPathDown();<br>
                                                        }<br>
                                                        <br>
                                                    } else {<br>
                                                        <br>
                                                    }<br>
                                                    <br>
                                                });<br>
                                            <br>
                                        }<br>
                                        <br>
                                                            <br>
                                        waitForElm('.chakra-menu__menuitem[data-index="0"]')<br>
                                            .then((elm) => {<br>
                                                <br>
                                                elm.onclick = () => {<br>
                                                    setClipPathDown();<br>
                                                }<br>
                                                <br>
                                            });<br>
                                        <br>
                                        <br>
                                        waitForElm('button > svg')<br>
                                            .then((elm) => {<br>
                                            <br>
                                                if (elm.classList.contains('chakra-icon')){<br>
                                                    <br>
                                                    elm.onclick = () => {<br>
                                                        setClipPathDown();<br>
                                                    }<br>
                                                    <br>
                                                } else {<br>
                                                    <br>
                                                }<br>
<br>
                                            });<br>
                                        <br>
                                        <br>
                                        waitForElm('#container-chat')<br>
                                            .then((elm) => {<br>
<br>
                                                if (elm && elm.offsetParent !== null){<br>
                                                    if (window.mobileCheck()){<br>
                                                        window.parent.document.querySelector('#genio-chat').style.bottom = "1px";<br>
                                                        window.parent.document.querySelector('#genio-chat').style.right = "2px";<br>
                                                        window.parent.document.querySelector('#genio-chat').style.width = "99%";<br>
                                                        window.parent.document.querySelector('#genio-chat').style.height = "99%";<br>
                                                        window.parent.document.querySelector('#genio-chat').style.clipPath = 'none';    <br>
                                                    } else {<br>
                                                        window.parent.document.querySelector('#genio-chat').style.clipPath = 'inset(13% 0px 0% 70%)';<br>
                                                    }<br>
                                                    <br>
                                                } else {<br>
                                                <br>
                                                    setClipPathDown();<br>
                                                    <br>
                                                }  <br>
                                            });<br>
<br>
                                    }<br>
                                    <br>
                                <`+ `/script>`<br>
                            <br>
                            // inset(13% 0px 0% 70%)<br>
                            // inset(80% 0px 0% 90%)<br>
                            iframe.setAttribute("style","position:fixed; bottom:5px; right:5px; width:90%; height:90%; margin:0; padding:0;border:none;overflow:hidden; z-index:999999;");<br>
                            iframe.setAttribute("allowtransparency","true");<br>
                            <br>
                            <br>
                            iframe.contentWindow.document.open();<br>
                            iframe.contentWindow.document.write(htmlcode);<br>
                            iframe.contentWindow.document.close();<br>

                            <br>
                            &lt;/script&gt;
                            <br>
                        </code>
                    </li>
                </ul>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-block font-weight-bold font-size-16"
                    data-dismiss="modal">Dismiss</button>
            </div>
        </div>
    </div>
</div>


<script>
  const copyButton = document.getElementById("copy-button");
  const textElement = document.getElementById("text-element").innerText;

  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(textElement).then(() => {
      alert("HTML code copied to clipboard!");
    });
  });
</script>