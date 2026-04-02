let layerWDTH = screen.width;
let pm = "pending-menu";
let ptm = "pending-transfer-menu";
let om = "ongoing-menu";
let hm = "history-menu";

// const smallDisplayDefault =[
//     {
//         menu:`icon-${pm}`,
//         status_remove:'class',
//         val_remove: 'font-size-20',
//         status_add:'class',
//         val_add: 'font-size-24'
//     },
//     {
//         menu:`icon-${ptm}`,
//         status_remove:'class',
//         val_remove: 'font-size-20',
//         status_add:'class',
//         val_add: 'font-size-24'
//     },
//     {
//         menu:`icon-${om}`,
//         status_remove:'class',
//         val_remove: 'font-size-20',
//         status_add:'class',
//         val_add: 'font-size-24'
//     },
//     {
//         menu:`icon-${hm}`,
//         status_remove:'class',
//         val_remove: 'font-size-20',
//         status_add:'class',
//         val_add: 'font-size-24'
//     },

//     {
//         menu:`label-${pm}`,
//         status_remove:'class',
//         val_remove: 'font-size-18',
//         status_add:'class',
//         val_add: 'font-size-16'
//     },
//     {
//         menu:`label-${ptm}`,
//         status_remove:'class',
//         val_remove: 'font-size-18',
//         status_add:'class',
//         val_add: 'font-size-16'
//     },
//     {
//         menu:`label-${om}`,
//         status_remove:'class',
//         val_remove: 'font-size-18',
//         status_add:'class',
//         val_add: 'font-size-16'
//     },
//     {
//         menu:`label-${hm}`,
//         status_remove:'class',
//         val_remove: 'font-size-18',
//         status_add:'class',
//         val_add: 'font-size-16'
//     },
// ]

// const bigDisplayDefault = [
//     {
//         menu:`icon-${pm}`,
//         status_remove:'class',
//         val_remove: 'font-size-24',
//         status_add:'class',
//         val_add: 'font-size-20'
//     },
//     {
//         menu:`icon-${ptm}`,
//         status_remove:'class',
//         val_remove: 'font-size-24',
//         status_add:'class',
//         val_add: 'font-size-20'
//     },
//     {
//         menu:`icon-${om}`,
//         status_remove:'class',
//         val_remove: 'font-size-24',
//         status_add:'class',
//         val_add: 'font-size-20'
//     },
//     {
//         menu:`icon-${hm}`,
//         status_remove:'class',
//         val_remove: 'font-size-24',
//         status_add:'class',
//         val_add: 'font-size-20'
//     },

//     {
//         menu:`label-${pm}`,
//         status_remove:'class',
//         val_remove: 'font-size-16',
//         status_add:'class',
//         val_add: 'font-size-18'
//     },
//     {
//         menu:`label-${ptm}`,
//         status_remove:'class',
//         val_remove: 'font-size-16',
//         status_add:'class',
//         val_add: 'font-size-18'
//     },
//     {
//         menu:`label-${om}`,
//         status_remove:'class',
//         val_remove: 'font-size-16',
//         status_add:'class',
//         val_add: 'font-size-18'
//     },
//     {
//         menu:`label-${hm}`,
//         status_remove:'class',
//         val_remove: 'font-size-16',
//         status_add:'class',
//         val_add: 'font-size-18'
//     },
// ];

if (layerWDTH < 1000) {
    // smallDisplayDefault.forEach(value => {
    //     if (value.status_remove == 'class') {
    //         $(`#${value.menu}`).removeClass(value.val_remove);
    //         $(`#${value.menu}`).addClass(value.val_add);
    //     }
    // });
    // if (layerWDTH < 350) {
    //     $("#input_chat").attr("style","width:280px;max-width:280px");
    // }else if(layerWDTH < 400){
    //     $("#input_chat").attr("style","width:320px;max-width:320px");
    // }else if(layerWDTH < 450){
    //     $("#input_chat").attr("style","width:420px;max-width:420px");
    // }else if(layerWDTH < 800){
    //     $("#input_chat").attr("style","width:710px;max-width:710px");
    // }else if(layerWDTH < 985){
    //     $("#input_chat").attr("style","width:950px;max-width:950px");
    // }
} else {
    // bigDisplayDefault.forEach(value => {
    //     if (value.status_remove == 'class') {
    //         $(`#${value.menu}`).removeClass(value.val_remove);
    //         $(`#${value.menu}`).addClass(value.val_add);
    //     }
    // });
    // if(layerWDTH < 1025){
    //     $("#input_chat").attr("style","width:240px;max-width:240px");
    // }else if(layerWDTH < 1400){
    //     $("#input_chat").attr("style","width:590px;max-width:600px");
    // }else if(layerWDTH < 2000){
    //     $("#input_chat").attr("style","width:720px;max-width:720px");
    // }else{
    //     $("#input_chat").attr("style","width:1900px;max-width:1900px");
    // }
}

$(window).resize(function (e) {
    let layer = $("body").innerWidth();
    if (layer < 1000) {
        // smallDisplayDefault.forEach(value => {
        //     if (value.status_remove == 'class') {
        //         $(`#${value.menu}`).removeClass(value.val_remove);
        //         $(`#${value.menu}`).addClass(value.val_add);
        //     }
        // });
        // if (layer < 350) {
        //     $("#input_chat").attr("style", "width:280px;max-width:280px");
        // } else if (layer < 400) {
        //     $("#input_chat").attr("style", "width:320px;max-width:320px");
        // } else if (layer < 450) {
        //     $("#input_chat").attr("style", "width:420px;max-width:420px");
        // } else if (layer < 800) {
        //     $("#input_chat").attr("style", "width:710px;max-width:710px");
        // } else if (layer < 985) {
        //     $("#input_chat").attr("style", "width:950px;max-width:950px");
        // }
    } else {
        // bigDisplayDefault.forEach(value => {
        //     if (value.status_remove == 'class') {
        //         $(`#${value.menu}`).removeClass(value.val_remove);
        //         $(`#${value.menu}`).addClass(value.val_add);
        //     }
        // });
        // if (layer < 1025) {
        //     $("#input_chat").attr("style", "width:240px;max-width:240px");
        // } else if (layer < 1400) {
        //     $("#input_chat").attr("style", "width:590px;max-width:600px");
        // } else if (layer < 2000) {
        //     $("#input_chat").attr("style", "width:720px;max-width:720px");
        // } else {
        //     $("#input_chat").attr("style", "width:1900px;max-width:1900px");
        // }
    }
});
