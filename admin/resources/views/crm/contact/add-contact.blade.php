<div class="modal fade" id="addContact" tabindex="-1" role="dialog" aria-labelledby="addContact" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addContact">
                    <i class="fas fa-id-card"></i> Add Contact
                </h5>
                <button type="button" onclick="closFormAdd()" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form>
                <div class="modal-body">
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Contact Information
                        </h5>
                    </div>
                    <div class="form-row mt-2">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="salutation">Salutation<span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <select id="salutation" class="form-control">
                                        <option value="" disabled selected>Choose Salutation</option>
                                        <option value="Mr.">Mr.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Prof.">Prof.</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="full_name">Full Name<span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input type="text" id="full_name" class="form-control" placeholder="Example: Armeylia Milanda">
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
                                <label for="account_name">Account Name</label>
                                <div class="input-group" id="account_name">
                                    <select class="form-control">
                                        <option value="" selected disabled>Choose Account Name</option>
                                        <option value="MedLife.Inc">MedLife.Inc</option>
                                        <option value="MedLife.Inc">MedLife.Inc</option>
                                        <option value="MedLife.Inc">MedLife.Inc</option>
                                        <option value="MedLife.Inc">MedLife.Inc</option>
                                        <option value="MedLife.Inc">MedLife.Inc</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="reports_to">Reports To</label>
                                <div class="input-group">
                                    <select id="reports_to" class="form-control">
                                        <option value="" selected disabled>Choose Account Reports To</option>
                                        <option value="Udin samsudin">Udin samsudin</option>
                                        <option value="Udin samsudin">Udin samsudin</option>
                                        <option value="Udin samsudin">Udin samsudin</option>
                                        <option value="Udin samsudin">Udin samsudin</option>
                                        <option value="Udin samsudin">Udin samsudin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="title">Title</label>
                                <div class="input-group">
                                    <input id="title" type="text" class="form-control" placeholder="Example: Manager">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="department">Department</label>
                                <div class="input-group">
                                    <input id="department" type="text" class="form-control" placeholder="Example: IT">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <div class="input-group">
                                    <input id="email" type="email" class="form-control" placeholder="Example: armeylia_milanda@rcm.co.id">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="fax">Fax</label>
                                <div class="input-group">
                                    <input id="fax" type="text" class="form-control" placeholder="Example: 021-666 66">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="phone">Phone</label>
                                <div class="input-group">
                                    <input id="phone" type="text" class="form-control" placeholder="Example: 021-666 66">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="mobile">Mobile Phone</label>
                                <div class="input-group">
                                    <input id="mobile" type="text" class="form-control" placeholder="Example: 081383xxxxxx">
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
                        <div class="col-12 col-md-12 col-lg-12">
                            <div class="form-group">
                                <label for="mailing_street">Mailing Street Address</label>
                                <div class="input-group">
                                    <textarea type="text" id="mailing_street" class="form-control fixed-area" placeholder="Example: Jl Cipaganti No 175 Kec Curug Kel Kapuas"></textarea>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-7">
                                    <label for="mailing_city">Mailing City</label>
                                    <input type="text" class="form-control" id="mailing_city" placeholder="Example: Depok">
                                </div>
                                <div class="form-group col-md-5">
                                    <label for="mailing_province">Mailing Province</label>
                                    <input type="text" class="form-control" id="mailing_province" placeholder="Example: Jawa Barat">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-5">
                                    <label for="mailing_postalcode">Mailing Postal Code</label>
                                    <input type="text" class="form-control" id="mailing_postalcode" placeholder="Example: 16456">
                                </div>
                                <div class="form-group col-md-7">
                                    <label for="mailing_country">Billing Country</label>
                                    <select id="mailing_country" class="form-control">
                                        <option selected disabled>Choose Country</option>
                                        <option>...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col-12 col-md-12 col-lg-12 text-right">
                        <div class="form-group">
                            <button class="btn btn-secondary"  onclick="closeFormAdd()" type="button">Cancel</button>
                            <button class="btn btn-success " type="submit">Save</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
