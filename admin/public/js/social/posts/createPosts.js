const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    showClass: {
        popup: "animated lightSpeedIn",
    },
    hideClass: {
        popup: "animated lightSpeedOut",
    },
    onOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
});

async function getThumbnailForVideo(videoUrl) {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    video.style.display = "none";
    canvas.style.display = "none";

    // Trigger video load
    await new Promise((resolve, reject) => {
        video.addEventListener("loadedmetadata", () => {
            video.width = video.videoWidth;
            video.height = video.videoHeight;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Seek the video to 25%
            video.currentTime = video.duration * 0.25;
        });
        video.addEventListener("seeked", () => resolve());
        video.src = videoUrl;
    });

    // Draw the thumbnailz
    canvas
        .getContext("2d")
        .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const imageUrl = canvas.toDataURL("image/png");
    return imageUrl;
}

async function previewImage() {
    var file = document.getElementById("file_content").files[0];
    var overview = document.getElementById("overview-file");
    var preview = document.getElementById("preview-file");
    var canvas = document.getElementById("canvas");
    overview.href = urls + "assets/images/small/img-4.jpg";
    preview.src = "assets/images/small/img-4.jpg";

    if (file == undefined || !file || file == null) {
        overview.href = urls + "assets/images/small/img-4.jpg";
        preview.src = "assets/images/small/img-4.jpg";
    } else {
        overview.href = urls + "assets/images/4Mg1.gif";
        preview.src = "assets/images/4Mg1.gif";
        var file_ext = file.name.split(".");
        var oFReader = new FileReader();
        if (
            file_ext[1].toLowerCase() == "jpg" ||
            file_ext[1].toLowerCase() == "jpeg"
        ) {
            oFReader = new FileReader();
            oFReader.readAsDataURL(file);
            oFReader.onload = function (oFREvent) {
                if (file_ext[1].toLowerCase() == "mp4") {
                    canvas
                        .getContext("2d")
                        .drawImage(
                            file,
                            2,
                            3,
                            file.videoWidth,
                            file.videoHeight
                        );
                }
                preview.src = oFREvent.target.result;
                overview.href = oFREvent.target.result;
            };
        } else if (file_ext[1] == "mp4") {
            const fileUrl = URL.createObjectURL(file);
            const thumbUrl = await getThumbnailForVideo(fileUrl);
            preview.src = thumbUrl;
            oFReader = new FileReader();
            oFReader.readAsDataURL(file);
            oFReader.onload = function (oFREvent) {
                overview.href = fileUrl;
            };
        } else {
            oFReader = false;
            overview.src = "assets/images/small/img-4.jpg";
            preview.src = "assets/images/small/img-4.jpg";
        }
    }
    // if (file == undefined || !file || file == null) {
    //     oFReader = false;
    //     document.getElementById("result-prview-image").src = "assets/images/small/img-4.jpg"
    // } else {
    //     oFReader = new FileReader();
    //     oFReader.readAsDataURL(file);
    //     oFReader.onload = function (oFREvent) {
    //         document.getElementById("result-prview-image").src = oFREvent.target.result;
    //     };
    // }
}

$(function () {
    $("#btn-save").parsley();
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        console.warn($("#description_post").val());
        // Swal.fire({
        //     title: 'Hmm',
        //     text: "Create Post Successfully!",
        //     icon: 'success',
        //     showCancelButton: false,
        //     allowEscapeKey: false,
        //     allowOutsideClick: false,
        //     showConfirmButton: false,
        //     timer: 2000,
        //     timerProgressBar: true
        // }).then(function () {
        //     $("#description_post").val(null);
        //     $("#file_content").val(null);
        //     previewImage()
        // });;
    });
});

var tiny = tinymce.init({
    selector: "textarea.notes",
    plugins: "emoticons",
    toolbar: "emoticons",
    toolbar_location: "bottom",
    menubar: false,
    resize: false,
    statusbar: false,
});
