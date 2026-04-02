<div class="modal fade" id="addOpportunity" tabindex="-1" role="dialog" aria-labelledby="addOpportunity" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addOpportunity">
                    <i class="fas fa-handshake"></i> Add Opportunity
                </h5>
                <button type="button" onclick="closeForm()" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form>
                <div class="modal-body">
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Opportunity Information
                        </h5>
                    </div>
                    <div class="form-row mt-2">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="opportunity_name">Opportunity Name<span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input type="text" id="opportunity_name" class="form-control" placeholder="Type Opportunity Name">
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
                    </div>
                    <div class="row">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Account Name<span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <select name="account_name" id="account_name" class="form-control">
                                        <option value="" disabled selected>Choose Account Name</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Close Date<span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input type="text" class="form-control close_date datetimepicker-input" id="close_date"
                                    data-toggle="datetimepicker" data-target=".close_date">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="type">Type</label>
                                <div class="input-group">
                                    <label class="selectgroup-item">
                                        <input type="radio" name="type" id="type"value="existing business" class="selectgroup-input">
                                        <span class="selectgroup-button">Existing Business</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="type" id="type" value="new business" class="selectgroup-input">
                                        <span class="selectgroup-button">New Business</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="type" id="type" value="other" class="selectgroup-input" checked>
                                        <span class="selectgroup-button">Other</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="stage">Stage<span class="text-danger">*</span></label>
                                <div class="selectgroup selectgroup-pills">
                                    <label class="selectgroup-item">
                                        <input type="radio" name="stage" id="stage"value="qualification" class="selectgroup-input">
                                        <span class="selectgroup-button">Qualification</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="stage" id="stage" value="needs analysis" class="selectgroup-input">
                                        <span class="selectgroup-button">Needs Analysis</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="stage" id="stage" value="proposal" class="selectgroup-input">
                                        <span class="selectgroup-button">Proposal</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="stage" id="stage" value="negotiation" class="selectgroup-input">
                                        <span class="selectgroup-button">Negotiation</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="stage" id="stage" value="closed won" class="selectgroup-input">
                                        <span class="selectgroup-button">Closed Won</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="stage" id="stage" value="closed lost" class="selectgroup-input">
                                        <span class="selectgroup-button">Closed Lost</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="stage" id="stage" value="other" class="selectgroup-input" checked>
                                        <span class="selectgroup-button">Other</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="campaign">Primary Campaign Source</label>
                                <div class="input-group">
                                    <select name="campaign" id="campaign" class="form-control">
                                        <option value="testing"></option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="probability">Probability</label>
                                <div class="input-group">
                                    <input type="number" id="probability" step=0.01 min=1 class="form-control">
                                    <div class="input-group-prepend">
                                        <div class="input-group-text">%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="budget_confirmed">Budget Confirmed</label>
                                <div class="custom-control custom-switch custom-switch-md">
                                    <input type="checkbox" class="custom-control-input" id="budget_confirmed">
                                    <label class="custom-control-label" for="budget_confirmed" id="swipeLbl"></label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="amount">Amount</label>
                                <div class="input-group">
                                    <input type="text" id="amount" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="discovery_completed">Discovery Completed</label>
                                <div class="custom-control custom-switch custom-switch-md">
                                    <input type="checkbox" class="custom-control-input" id="discovery_completed">
                                    <label class="custom-control-label" for="discovery_completed" id="swipeLbl"></label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="roi_analysis_completed">ROI Analysis Completed</label>
                                <div class="custom-control custom-switch custom-switch-md">
                                    <input type="checkbox" class="custom-control-input" id="roi_analysis_completed">
                                    <label class="custom-control-label" for="roi_analysis_completed" id="swipeLbl"></label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="loss_reason">Loss Reason</label>
                                <div class="input-group">
                                    <select name="loss_reason" id="loss_reason" class="form-control">
                                        <option selected disabled>Choose Loss Reason</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Additional Information
                        </h5>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="next_step">Next Step</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="next_step" placeholder="Type next step">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="lead_source">Lead Source</label>
                                <div class="input-group">
                                    <select name="lead_source" id="lead_source" class="form-control">
                                        <option value="" disabled selected>Choose Lead Source</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-12">
                            <div class="form-group">
                                <label for="description">Description</label>
                                <div class="input-group">
                                    <textarea name="description" id="description" rows="5" class="form-control"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col-12 col-md-12 col-lg-12 text-right">
                        <div class="form-group">
                            <button class="btn btn-secondary" onclick="closeFormAdd()" type="button">Cancel</button>
                            <button class="btn btn-success" type="submit">Save</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
