<div class=" modal fade bs-example-modal-lg" id="modalContactFriend" tabindex="-1" role="dialog"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-users font-size-14 mr-2"></i> Friends
                </h5>
                <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="search-box chat-search-box">
                    <div class="position-relative position-minus10-left">
                        <input type="search" class="form-control search-form" id="keywordListContact"
                            placeholder="Search...">
                        <i class="ri-search-line search-icon"></i>
                    </div>
                </div>
                <ul class="list-unstyled chat-list mt-2" data-simplebar="init" style="max-height: 320px;">
                    <div class="simplebar-wrapper" style="margin: 0px;">
                        <div class="simplebar-height-auto-observer-wrapper">
                            <div class="simplebar-height-auto-observer"></div>
                        </div>
                        <div class="simplebar-mask">
                            <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll;">
                                    <div class="simplebar-content" style="padding: 0px;" id="listContacts"></div>
                                </div>
                            </div>
                        </div>
                        <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                        <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;">
                        </div>
                    </div>
                    <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                        <div class="simplebar-scrollbar"
                            style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class=" modal fade bs-example-modal-lg" id="modalActionListBubbleChat" tabindex="-1" role="dialog"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm" role="document">
        <div class="modal-content model-content-center">
            <div class="modal-body">
                <div class="list-group" id="action-list-bubble-chat"></div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-lg" id="modalFormGroup" tabindex="-1" role="dialog"
    aria-labelledby="staticBackdropLabel" aria-hidden="true" data-keyboard="false" data-backdrop="static">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-user-plus font-size-14 mr-2"></i> New Group ~ <span
                        class="font-weight-light font-size-14" id="menu-name-group"></span>
                </h5>
                <div class="float-right" id="btn-form-group"></div>
            </div>
            <div class="modal-body" id="body-form-group"></div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-lg" id="modalAddUserToGroup" tabindex="-1" role="dialog"
    aria-labelledby="staticBackdropLabel" aria-hidden="true" data-keyboard="false" data-backdrop="static">
    <div class="modal-dialog modal-dialog-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-users font-size-14 mr-2"></i> Choose User
                </h5>
                <div class="float-right">
                    <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <button type="button" class="btn btn-tangerin waves-effect" onclick="AddUserToGroup()"><i
                            class="fas fa-save"></i></button>
                </div>
            </div>
            <div class="modal-body">
                <div class="chat-list mb-2">
                    <ul class="list-inline horizontal-slide pt-1 mb-2" id="listChooseContacts"></ul>
                </div>
                <div class="search-box chat-search-box">
                    <div class="position-relative position-minus10-left">
                        <input type="search" class="form-control search-form" id="keywordListGroupContacts"
                            oninput="searchListGroupContact()" placeholder="Search...">
                        <i class="ri-search-line search-icon"></i>
                    </div>
                </div>
                <ul class="list-unstyled chat-list mt-2" data-simplebar="init" style="max-height: 100px;">
                    <div class="simplebar-wrapper" style="margin: 0px;">
                        <div class="simplebar-height-auto-observer-wrapper">
                            <div class="simplebar-height-auto-observer"></div>
                        </div>
                        <div class="simplebar-mask">
                            <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll;">
                                    <div class="simplebar-content" style="padding: 0px;" id="listGroupContacts"></div>
                                </div>
                            </div>
                        </div>
                        <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                        <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;">
                        </div>
                    </div>
                    <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                        <div class="simplebar-scrollbar"
                            style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-lg" id="modalDetailGroup" tabindex="-1" role="dialog"
    aria-labelledby="staticBackdropLabel">
    <div class="dropdown-menu action-detail-group"></div>
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-users font-size-14 mr-2"></i> Detail Group
                </h5>
                <div class="float-right">
                    <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body" id="body-detail-group">
                <div class="media mb-2">
                    <img class="d-flex mr-3 rounded-circle avatar-sm img-object-fit-cover" id="imageGroupUpdated"
                        alt="Generic placeholder image">
                    <div class="p-image">
                        <i class="fa fa-camera upload-button" onclick="uploadButtonImgDtGroup()"></i>
                        <input class="file-upload2" id="file-uploaded2" type="file" accept="image/*"
                            onchange="thumbnailGroupUploadedUpdate()" />
                    </div>
                    <div class="media-body">
                        <h5 class="text-muted" id="nameGroup"></h5>
                        <div class="form-group" id="formSubjectGroup"></div>
                        <small class="text-muted" id="membersGroup"></small>
                    </div>
                </div>
                <hr />
                <div class="row">
                    <div class="col-sm-6 col-md-6 col-xl-6">
                        <p class="font-weight-bold font-size-16">Members:</p>
                    </div>
                    <div class="col-sm-6 col-md-6 col-xl-6">
                        <span class="text-tangerin font-weight-bold font-size-18 pl-3 float-right mr-2 pointer"
                            title="Add User" onclick="getChooseUser()">
                            <span class="badge badge-tangerin-500">
                                <i class="ri-user-add-fill font-size-20"></i>
                            </span>
                        </span>
                    </div>
                </div>
                <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 100px;">
                    <div class="simplebar-wrapper" style="margin: 0px;">
                        <div class="simplebar-height-auto-observer-wrapper">
                            <div class="simplebar-height-auto-observer"></div>
                        </div>
                        <div class="simplebar-mask">
                            <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                <div class="simplebar-content-wrapper" style="height: auto;">
                                    <div class="simplebar-content" style="padding: 0px;" id="listMembersGroup"></div>
                                </div>
                            </div>
                        </div>
                        <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                        <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;">
                        </div>
                    </div>
                    <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                        <div class="simplebar-scrollbar"
                            style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-lg" id="modalPinnedMessage" data-keyboard="false" and data-backdrop="static"
    tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel">
    <div class="dropdown-menu action-detail-group"></div>
    <div class="modal-dialog modal-md" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-thumbtack mr-2 font-size-14"></i> Pinned Message
                </h5>
                <div class="float-right">
                    <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body" id="body-detail-group">
                <div class="chat-conversation">
                    <ul class="list-unstyled chat-list mt-1" data-simplebar="init" style="max-height: 100px;">
                        <div class="simplebar-wrapper chat-detail" style="margin: 0px -16px 0px 0px;">
                            <div class="simplebar-height-auto-observer-wrapper">
                                <div class="simplebar-height-auto-observer"></div>
                            </div>
                            <div class="simplebar-mask">
                                <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                    <div class="simplebar-content-wrapper list-detail-content-chat" tabindex="0"
                                        role="region" aria-label="scrollable content"
                                        style="height: 100%; overflow: hidden scroll;">
                                        <div class="d-flex justify-content-center loader-content-list-pinned">
                                            <div class="spinner-border text-secondary loader-content-list-pinned"
                                                role="status">
                                                <span class="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                        <div class="simplebar-content" id="listMessagePinned"
                                            style="padding: 0px 16px 0px 0px;">

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="simplebar-placeholder" style="width: auto; height: 1226px;"></div>
                        </div>
                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 0px, 0px); display: none; width: 0px;">
                            </div>
                        </div>
                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 307px, 0px); display: block; height: 284px;">
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-lg" id="modalManageWebhook" data-keyboard="false" and data-backdrop="static"
    tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel">
    <div class="dropdown-menu action-detail-group"></div>
    <div class="modal-dialog modal-md" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-cog mr-2 font-size-14"></i> Manage Webhook
                </h5>
                <div class="float-right">
                    <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body" id="body-detail-group">
                <div class="chat-conversation">
                    <ul class="list-unstyled webhook-list mt-1" data-simplebar="init" style="max-height: 50vh;">
                        <div class="simplebar-wrapper chat-detail" style="margin: 0px -16px 0px 0px;">
                            <div class="simplebar-height-auto-observer-wrapper">
                                <div class="simplebar-height-auto-observer"></div>
                            </div>
                            <div class="simplebar-mask">
                                <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                    <div class="simplebar-content-wrapper list-detail-webhhok" tabindex="0"
                                        role="region" aria-label="scrollable content"
                                        style="height: 100%; overflow: hidden scroll;">
                                        <div class="d-flex justify-content-center loader-list-webhook">
                                            <div class="spinner-border text-secondary loader-list-webhook"
                                                role="status">
                                                <span class="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                        <div class="simplebar-content" id="listWebhook"
                                            style="padding: 0px 16px 0px 0px;">
                                            
                                        </div>                                        
                                    </div>
                                </div>
                            </div>
                            <div class="simplebar-placeholder" style="width: auto; height: 1226px;"></div>
                        </div>
                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 0px, 0px); display: none; width: 0px;">
                            </div>
                        </div>
                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 307px, 0px); display: block; height: 284px;">
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
            <div class="modal-footer" style="display: block">
                <div class="d-flex justify-content-center loader-detail-list">
                    <div class="spinner-border text-secondary loader-detail-list"
                        role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div id="addWebhook" style="display: none">
                    <div class="form-group">
                        <label for="name_webhook">Name</label>
                        <input type="text" class="form-control" id="name_webhook"  placeholder="Enter Name">
                    </div>
                    <label for="custom-file">Avatar</label>
                    <div class="input-group mb-5">
                        <div class="custom-file">
                            <input type="file" class="custom-file-input" id="file_webhook">
                            <label class="custom-file-label" for="file_webhook">Choose file</label>
                        </div>
                    </div>
                    <button type="submit" id="cancel-button" class="btn btn-outline-danger">Cancel</button>
                    <button type="submit" id="add-button" onclick="saveWebhook()" class="btn btn-primary">Save</button>
                </div> 
                <div id="detailWebhook" style="display: none">
                    <div class="form-group d-none">
                        <label for="name_webhook_detail">Id</label>
                        <input type="number" class="form-control" id="id_webhook_detail">
                    </div>
                    <div class="form-group">
                        <label for="name_webhook_detail">Name</label>
                        <input type="text" class="form-control" id="name_webhook_detail"  placeholder="Enter Name">
                    </div>
                    <label for="custom-file">Avatar</label>
                    <div class="form-group d-none">
                        <label for="saved_webhook_detail">File</label>
                        <input type="text" class="form-control" id="saved_webhook_detail"  placeholder="Enter File">
                    </div>
                    <div class="input-group mb-5">
                        <div class="custom-file">
                            <input type="file" class="custom-file-input" id="file_webhook_detail">
                            <label class="custom-file-label" for="file_webhook_detail">Choose file</label>
                        </div>
                    </div>
                    <button type="submit" id="cancel-button" class="btn btn-outline-danger">Cancel</button>
                    <button type="submit" id="add-button" onclick="updateWebhook()" class="btn btn-primary">Save</button>
                </div>               
               <button class="btn btn-primary" id="show-add-webhook">Add Webhook</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-lg" id="modalDetailReplyMessage" data-keyboard="false" and
    data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel">
    <div class="dropdown-menu action-detail-group"></div>
    <div class="modal-dialog modal-md" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-comment-dots mr-2"></i> Detail Reply
                </h5>
                <div class="float-right">
                    <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body" id="body-detail-group">
                <div class="chat-conversation">
                    <ul class="list-unstyled chat-list mt-1" data-simplebar="init" style="max-height: 100px;">
                        <div class="simplebar-wrapper chat-detail" style="margin: 0px -16px 0px 0px;">
                            <div class="simplebar-height-auto-observer-wrapper">
                                <div class="simplebar-height-auto-observer"></div>
                            </div>
                            <div class="simplebar-mask">
                                <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                    <div class="simplebar-content-wrapper list-detail-content-chat" tabindex="0"
                                        role="region" aria-label="scrollable content"
                                        style="height: 100%; overflow: hidden scroll;">
                                        <div class="simplebar-content" id="detailReplyMessage"
                                            style="padding: 0px 16px 0px 0px;">

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="simplebar-placeholder" style="width: auto; height: 1226px;"></div>
                        </div>
                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 0px, 0px); display: none; width: 0px;">
                            </div>
                        </div>
                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 307px, 0px); display: block; height: 284px;">
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-lg" id="modalSearchMessage" tabindex="-1" role="dialog"
    aria-labelledby="staticBackdropLabel">
    <div class="dropdown-menu action-detail-group"></div>
    <div class="modal-dialog modal-md" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-comments font-size-14 mr-2"></i> Search Message
                </h5>
                <div class="float-right">
                    <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div class="search-box chat-search-box">
                    <div class="position-relative position-minus10-left">
                        <input type="search" class="form-control search-form" id="keywordMessage"
                            placeholder="Type suggestion messages...">
                        <i class="ri-search-line search-icon"></i>
                    </div>
                </div>
                <ul class="list-unstyled chat-list mt-2" data-simplebar="init" style="max-height: 320px;">
                    <div class="simplebar-wrapper" style="margin: 0px;">
                        <div class="simplebar-height-auto-observer-wrapper">
                            <div class="simplebar-height-auto-observer"></div>
                        </div>
                        <div class="simplebar-mask">
                            <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll;">
                                    <div class="simplebar-content" style="padding: 0px;" id="listSuggestionMessage">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                        <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;">
                        </div>
                    </div>
                    <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                        <div class="simplebar-scrollbar"
                            style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</div>

<!-- Modal -->
<div class="modal fade" id="preview" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="myModalLabel">Preview Image</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>                
            </div>
            <form method="post">
                <div class="modal-body">
                    <div id="loader" style="display: none"></div>
                    <img width="100%" class="mb-3" id="preview-image">
                    <hr>
                    <label for="input_caption">Caption</label>
                    <div contenteditable="true" class="chat-input type_msg" dir="auto" placeholder="enter your caption" id="input_caption"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="sendImage()" class="btn btn-tangerin">Send Image</button>
                </div>
            </form>            
        </div>
    </div>
</div>

<button class="UppyModalOpenerBtn" style="display: none;"></button>
<div class="DashboardContainer"></div>
<!-- <div id="drag-drop-area"></div> -->
