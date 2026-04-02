<div class="modal fade" id="addToken" tabindex="-1" role="dialog" aria-labelledby="addToken" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addToken">
                    <i class="fas fa-plus mr-2"></i> Add New Token
                </h5>
            </div>
            <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>

                <div class="modal-body">
                    <div class="form-group">
                        <input type="text" id="name" data-parsley-minlength="2" data-parsley-required class="form-control" placeholder="Name">
                        <span class="text-danger" id="err_name"></span>
                    </div>
                    <div class="form-group">
                        <input type="text" id="domain" data-parsley-required class="form-control" placeholder="Domain">
                        <span class="text-danger" id="err_domain"></span>
                    </div>
                    <div class="page-copy" id="page-copy">

                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary font-weight-bold font-size-16 " onclick="closeAdd()">Close</button>
                    <button type="submit" class="btn btn-tangerin font-weight-bold font-size-16 btn-add">Add</button>
                </div>
            </form>
        </div>
    </div>
</div>