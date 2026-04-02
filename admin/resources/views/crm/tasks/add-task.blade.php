<div class="modal fade" id="addTask" tabindex="-1" role="dialog" aria-labelledby="addTask" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addTask">
                    <i class="fas fa-tasks"></i> Add New Task
                </h5>
                <button type="button" onclick="closeForm()" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form>
                <div class="modal-body">
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Task Information
                        </h5>
                    </div>
                    <div class="form-row mt-2">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label>Subject<span class="text-danger">*</span></label>
                                <div class="selectgroup selectgroup-pills">
                                    <label class="selectgroup-item">
                                        <input type="radio" name="subject" id="subject" value="1"
                                            class="selectgroup-input" checked>
                                        <span class="selectgroup-button selectgroup-button-icon"><i
                                                class="fas fa-phone"></i> Call</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="subject" id="subject" value="2"
                                            class="selectgroup-input">
                                        <span class="selectgroup-button selectgroup-button-icon"><i
                                                class="fas fa-envelope"></i> Send Letter</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="subject" id="subject" value="2"
                                            class="selectgroup-input">
                                        <span class="selectgroup-button selectgroup-button-icon"><i
                                                class="fas fa-quote-right"></i> Send Quote</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="subject" id="subject" value="2"
                                            class="selectgroup-input">
                                        <span class="selectgroup-button">Other</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="assigned_to">Assigned To</label>
                                <select id="assigned_to" class="form-control">
                                    <option value="" selected disabled>Choose Assigned</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="due_date">Due Date</label>
                                <input type="text" class="form-control datepicker datetimepicker-input" id="due_date"
                                    data-toggle="datetimepicker" data-target=".datepicker">
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="name_contact">Name</label>
                                <select id="name_contact" class="form-control opt-conts">
                                    <option value="" selected disabled>Choose Name Contacts</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="related_to">Related To</label>
                                <select id="related_to" class="form-control opt-accounts">
                                    <option value="" selected disabled>Choose Accounts</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-12">
                            <div class="form-group">
                                <label for="comments">Comments</label>
                                <div class="input-group">
                                    <textarea id="comments" cols="30" rows="3" class="form-control"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Additional Information
                        </h5>
                    </div>
                    <div class="form-row mt-2">
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="priority">Priority<span class="text-danger">*</span></label>
                                <div class="selectgroup selectgroup-pills">
                                    <label class="selectgroup-item">
                                        <input type="radio" name="priority" id="priority" value="1"
                                            class="selectgroup-input" checked="">
                                        <span class="selectgroup-button">Normal</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="priority" id="priority" value="2"
                                            class="selectgroup-input">
                                        <span class="selectgroup-button">High</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-6">
                            <div class="form-group">
                                <label for="status">Status<span class="text-danger">*</span></label>
                                <div class="selectgroup selectgroup-pills">
                                    <label class="selectgroup-item">
                                        <input type="radio" name="status" id="status" value="1"
                                            class="selectgroup-input" checked="">
                                        <span class="selectgroup-button selectgroup-button-icon"><i
                                                class="fas fa-eye"></i> Open</span>
                                    </label>
                                    <label class="selectgroup-item">
                                        <input type="radio" name="status" id="status" value="2"
                                            class="selectgroup-input">
                                        <span class="selectgroup-button selectgroup-button-icon"><i
                                                class="fas fa-eye-slash"></i> Completed</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-header h-50 bg-light">
                        <h5 class="mb-0">
                            Other Information
                        </h5>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="form-group">
                                <label for="reminder_set">Reminder Set</label>
                                <div class="custom-control custom-switch custom-switch-md ">
                                    <input type="checkbox" class="custom-control-input" id="reminder_set"
                                        onchange="tabMenu()">
                                    <label class="custom-control-label" for="reminder_set" id="swipeLbl"></label>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="col-12 col-md-12 col-lg-12 dtt">
                                    <div class="form-group">
                                        <label for="dtt">Date Time Task</label>
                                        <div class="input-group">
                                            <input type="text"
                                                class="form-control datetimepicker datetimepicker-input datetime-reminder"
                                                id="dtt" data-toggle="datetimepicker" data-target=".datetimepicker">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 rd">
                                    <div class="form-group">
                                        <label for="reminder_date">Reminder Date</label>
                                        <div class="input-group">
                                            <select id="reminder_date" class="form-control">
                                                <option value="" selected disabled>Choose Reminder Date</option>
                                                <option value="1 days before">1 days before</option>
                                                <option value="2 days before">2 days before</option>
                                                <option value="3 days before">3 days before</option>
                                                <option value="4 days before">4 days before</option>
                                                <option value="5 days before">5 days before</option>
                                                <option value="6 days before">6 days before</option>
                                                <option value="1 weeks before">1 weeks before</option>
                                                <option value="2 weeks before">2 weeks before</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 rt">
                                    <div class="form-group">
                                        <label for="remainder_time">Remainder Time</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control timepicker datetimepicker-input"
                                                id="remainder_time" data-toggle="datetimepicker"
                                                data-target=".timepicker">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 col-lg-6">
                            <div class="form-group">
                                <label for="crsot">Create Recurring Series of Tasks</label>
                                <div class="custom-control custom-switch custom-switch-md ">
                                    <input type="checkbox" class="custom-control-input" id="crsot" onchange="tabMenu()">
                                    <label class="custom-control-label" for="crsot" id="swipeLbl"></label>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="col-12 col-md-12 col-lg-12 fq">
                                    <div class="form-group">
                                        <label for="frequency">Frequency</label>
                                        <div class="input-group iFq">

                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 repeat">
                                    <div class="form-group">
                                        <label for="repeat">Repeat</label>
                                        <div class="input-group irp">

                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 every">
                                    <div class="form-group">
                                        <label for="every">Every</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control it-every" min="1" max="30"
                                                id="every" placeholder="Input number" aria-label="Input number"
                                                aria-describedby="basic-addon2">
                                            <div class="input-group-append">
                                                <span class="input-group-text lbl-every" id="basic-addon2"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 ro">
                                    <label for="repeat_on">Repeat On</label>
                                    <div class="input-group iRo">

                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 when">
                                    <div class="form-group">
                                        <label for="when">When</label>
                                        <div class="input-group iwhen">

                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 dm">
                                    <div class="form-group">
                                        <label for="day_month">Day</label>
                                        <div class="input-group iDayMonth">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 dayYear">
                                    <div class="form-group">
                                        <label for="day_year">Day</label>
                                        <div class="input-group iDayYear">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 RoYear">
                                    <div class="form-group">
                                        <label for="ro_year">Repeat On</label>
                                        <div class="input-group iROY">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 MoYear">
                                    <div class="form-group">
                                        <label for="month_year">Month</label>
                                        <div class="input-group">
                                            <select name="month_year" id="month_year" class="form-control iMoy">

                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-12 col-lg-12 repeatMonth">
                                    <div class="form-group">
                                        <label for="repeat_on_month">Repeat On</label>
                                        <div class="input-group iMRO">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6 col-lg-6 sd">
                                    <div class="form-group">
                                        <label for="start_date">Start Date</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control start_date datetimepicker-input"
                                                id="start_date" data-toggle="datetimepicker" data-target=".start_date">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6 col-lg-6 ed">
                                    <div class="form-group">
                                        <label for="end_date">End Date</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control end_date datetimepicker-input"
                                                id="end_date" data-toggle="datetimepicker" data-target=".end_date">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col-12 col-md-12 col-lg-12 text-right">
                        <div class="form-group">
                            <button class="btn btn-secondary " onclick="closeForm()" type="button">Cancel</button>
                            <button class="btn btn-success " type="submit">Save</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
