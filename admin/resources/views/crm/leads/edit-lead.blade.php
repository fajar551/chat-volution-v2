<div class="modal fade" id="editLead" tabindex="-1" role="dialog" aria-labelledby="editLead" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editLead">
                    <i class="fas fa-building"></i> Edit Lead
                </h5>
                <button type="button" onclick="closeFormEdit()" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form>
                <div class="modal-body">
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Lead Information
                        </h5>
                    </div>
                    <div class="form-row mt-2">
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="form-group">
                                <label for="lead_status">Lead Status<span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <select id="lead_status" class="form-control">
                                        <option value="" selected disabled>Choose Lead Status</option>
                                        <option value="Unqualified">Unqualified</option>
                                        <option value="New">New</option>
                                        <option value="Working">Working</option>
                                        <option value="Nurturing">Nurturing</option>
                                        <option value="Qualified">Qualified</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="salutation">Salutation</label>
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
                                    <input type="text" id="full_name" class="form-control" placeholder="Example: Masashi Kishimoto">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="form-group">
                                <label>Lead Owner</label>
                                <div class="input-group">
                                    <input readonly disabled type="text" class="form-control-plaintext" value="Udin">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="website">Website</label>
                                <div class="input-group">
                                    <input type="url" id="website" class="form-control" placeholder="Example: https://qwords.co.id">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12">
                            <div class="form-row mt-2">
                                <div class="col-12 col-md-6 col-lg-6">
                                    <div class="form-group">
                                        <label for="title">Title</label>
                                        <div class="input-group">
                                            <input id="title" type="text" class="form-control" placeholder="Example: Manager">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6 col-lg-6">
                                    <div class="form-group">
                                        <label for="company">Company</label>
                                        <div class="input-group">
                                            <input id="company" type="text" class="form-control" placeholder="Example: PT Qwords Company International">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-6">
                                    <div class="form-group">
                                        <label for="email">Email</label>
                                        <div class="input-group">
                                            <input id="email" type="email" class="form-control" placeholder="Example: masashi@crm.co.id">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-6">
                                    <div class="form-group">
                                        <label>Industry</label>
                                        <div class="input-group">
                                            <select class="form-control optionSectors" id="agentSelected">
                                            </select>
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
                                        <label for="nip">NIP(Employee Number In Comporate)</label>
                                        <div class="input-group">
                                            <input id="nip" type="text" class="form-control" placeholder="Example: 99857">
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
                                <div class="col-12 col-md-12 col-lg-6">
                                    <div class="form-group">
                                        <label>Lead Source</label>
                                        <div class="input-group">
                                            <select class="form-control optionLeads" id="agentSelected">
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-6">
                                    <div class="form-group">
                                        <label>Rating</label>
                                        <div class="input-group">
                                            <select class="form-control" id="agentSelected">
                                                <option value="" selected disabled>Choose Rate</option>
                                                <option value="Hot">Hot</option>
                                                <option value="Warm">Warm</option>
                                                <option value="Cold">Cold</option>
                                            </select>
                                        </div>
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
                        <div class="col-12 col-md-12 col-lg-12">
                            <div class="form-group">
                                <label for="street">Street Address</label>
                                <div class="input-group">
                                    <textarea type="text" id="street" class="form-control fixed-area" placeholder="Example: Jl Cipaganti No 175 Kec Curug Kel Kapuas"></textarea>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-7">
                                    <label for="city">City</label>
                                    <input type="text" class="form-control" id="city" placeholder="Example: Depok">
                                </div>
                                <div class="form-group col-md-5">
                                    <label for="province">Province</label>
                                    <input type="text" class="form-control" id="province" placeholder="Example: Jawa Barat">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-5">
                                    <label for="postalcode">Postal Code</label>
                                    <input type="text" class="form-control" id="postalcode" placeholder="Example: 16456">
                                </div>
                                <div class="form-group col-md-7">
                                    <label for="country">Billing Country</label>
                                    <select id="country" class="form-control">
                                        <option selected disabled>Choose Country</option>
                                        <option>...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            System Information
                        </h5>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="col-12 col-md-12 col-lg-12 mb-2">
                                <h6 class="label label-inverse">
                                    <i class="fas fa-circle"></i> Created By
                                </h6>
                                <span>
                                    <a class="text-url-dark">faiz
                                        adie</a>, 11/14/2021, 11:14 PM
                                </span>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="col-12 col-md-12 col-lg-12 mb-2">
                                <h6 class="label label-inverse">
                                    <i class="fas fa-circle"></i> Last Modified By
                                </h6>
                                <span>
                                    <a class="text-url-dark">faiz
                                        adie</a>, 11/14/2021, 11:14 PM
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col-12 col-md-12 col-lg-12 text-right">
                        <div class="form-group">
                            <button class="btn btn-secondary " onclick="closeFormEdit()" type="button">Cancel</button>
                            <button class="btn btn-success " type="submit">Save</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
