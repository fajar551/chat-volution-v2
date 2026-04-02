<div class="modal fade" id="addAccounts" tabindex="-1" role="dialog" aria-labelledby="addAccounts" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addAccounts">
                    <i class="fas fa-building"></i> Add Account Company
                </h5>
                <button type="button" onclick="closeForm()" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="btn-add-save" data-parsley-validate="">
                <div class="modal-body">
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Account Information
                        </h5>
                    </div>
                    <div class="form-row mt-2">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="account_name">Account Name<span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input data-parsley-minlength="3" data-parsley-required id="account_name"
                                        type="text" class="form-control" placeholder="Type Account Client Company Name">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Account Owner</label>
                                <div class="input-group">
                                    <input readonly disabled type="text" class="form-control-plaintext" value="Udin">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Type</label>
                                <div class="input-group">
                                    <select class="form-control selectpicker optionSelector">
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Parent Account</label>
                                <div class="input-group">
                                    <select class="form-control selectpicker optionParent">
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Website</label>
                                <div class="input-group">
                                    <input type="url" data-parsley-type="url" class="form-control"
                                        placeholder="Type Website Client">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Phone</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Type Phone Client">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Description</label>
                                <div class="input-group">
                                    <textarea id="description" cols="30" rows="1" class="form-control"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="industry">Industry</label>
                                <div class="input-group">
                                    <select class="form-control selectpicker-search optionSectors" id="industry">
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-12">
                            <div class="form-group">
                                <label for="company_size">Company Size</label>
                                <div class="input-group">
                                    <input id="company_size" class="form-control">
                                    <div class="input-group-append">
                                        <span class="input-group-text" id="basic-addon2">Employees</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Address Information
                        </h5>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="form-group">
                                <label for="billing_street">Billing Street Address</label>
                                <div class="input-group">
                                    <textarea type="text" id="billing_street" class="form-control fixed-area"
                                        placeholder="Type Billing Street"></textarea>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-7">
                                    <label for="billing_city">Billing City</label>
                                    <input type="text" class="form-control" id="billing_city"
                                        placeholder="Type Billing City">
                                </div>
                                <div class="form-group col-md-5">
                                    <label for="billing_province">Billing Province</label>
                                    <input type="text" class="form-control" id="billing_province"
                                        placeholder="Type Billing Province">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-5">
                                    <label for="billing_postalcode">Billing Postal Code</label>
                                    <input type="text" class="form-control" maxlength="21" id="billing_postalcode"
                                        placeholder="Type Postal Code">
                                </div>
                                <div class="form-group col-md-7">
                                    <label for="billing_country">Billing Country</label>
                                    <select id="billing_country" class="form-control selectpicker-search iLCountry">
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="form-group">
                                <label>Shipping Street Address</label>
                                <div class="input-group">
                                    <textarea type="text" class="form-control fixed-area"
                                        placeholder="Type Billing Street"></textarea>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-7">
                                    <label for="shiping_city">Shipping City</label>
                                    <input type="text" class="form-control" id="shiping_city"
                                        placeholder="Type Shipping City">
                                </div>
                                <div class="form-group col-md-5">
                                    <label for="shiping_province">Shipping Province</label>
                                    <input type="text" class="form-control" id="shiping_province"
                                        placeholder="Type Shipping Province">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-5">
                                    <label for="shiping_postalcode">Shipping Postal Code</label>
                                    <input type="text" class="form-control" maxlength="21" id="shiping_postalcode"
                                        placeholder="Type Postal Code">
                                </div>
                                <div class="form-group col-md-7">
                                    <label for="shiping_country">Shipping Country</label>
                                    <select id="shiping_country" class="form-control selectpicker-search iLCountry">
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col-12 col-md-12 col-lg-12 text-right">
                        <div class="form-group">
                            <button class="btn btn-secondary" onclick="closeForm()" type="button">Cancel</button>
                            <button class="btn btn-success" type="submit">Save</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
