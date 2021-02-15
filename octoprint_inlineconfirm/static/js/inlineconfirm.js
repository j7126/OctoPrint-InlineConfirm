/*
 * View model for OctoPrint-InlineConfirm
 *
 * Author: j7126
 * License: AGPLv3
 */
$(function () {
    jQuery.fn.textNodes = function () {
        return this.contents().filter(function () {
            return (this.nodeType === Node.TEXT_NODE && this.nodeValue.trim() !== "");
        });
    }
    function InlineConfirmViewModel(parameters) {
        var self = this;

        self.printerStateModel = parameters[0];

        // startup complete
        self.onStartupComplete = function () {
            if ($('html#touch').val() == undefined) {
                $('#state_wrapper .row-fluid.print-control button#job_cancel').unbind();
                $('#state_wrapper .row-fluid.print-control button#job_cancel').click(self.jobCancel);
            }
        }

        var jobCanceling = false;
        var jobCancelI = null;
        var jobCancelOldText = '';
        self.jobCancel = function (e) {
            e.preventDefault();
            if (jobCanceling) {
                $('#state_wrapper .row-fluid.print-control button#job_cancel').textNodes().first().replaceWith(jobCancelOldText);
                $('#state_wrapper .row-fluid.print-control button#job_cancel').removeClass('confirm');
                clearInterval(jobCancelI);
                jobCancelI = null;
                OctoPrint.job.cancel();
                $('#state_wrapper .row-fluid.print-control button#job_cancel > span').remove();
                jobCanceling = false;
            } else if (!self.printerStateModel.settings.feature_printCancelConfirmation()) {
                OctoPrint.job.cancel();
            } else {
                jobCanceling = true;
                jobCancelOldText = $('#state_wrapper .row-fluid.print-control button#job_cancel').textNodes().first().text();
                $('#state_wrapper .row-fluid.print-control button#job_cancel').addClass('confirm');
                var t = 5;
                var setText = function () {
                    $('#state_wrapper .row-fluid.print-control button#job_cancel > span').remove();
                    $('#state_wrapper .row-fluid.print-control button#job_cancel').textNodes().first().replaceWith(' Click again to confirm cancel <span>(' + t-- + ')</span>');
                }
                setTimeout(() => {
                    if (jobCanceling)
                        setText();
                }, 500);
                jobCancelI = setInterval(function () {
                    if (t < 0) {
                        $('#state_wrapper .row-fluid.print-control button#job_cancel').textNodes().first().replaceWith(jobCancelOldText);
                        $('#state_wrapper .row-fluid.print-control button#job_cancel').removeClass('confirm');
                        $('#state_wrapper .row-fluid.print-control button#job_cancel > span').remove();
                        clearInterval(jobCancelI);
                        jobCanceling = false;
                        jobCancelI = null;
                    } else
                        setText();
                }, 1000);
            }
        }
    };

    // view model class, parameters for constructor, container to bind to
    OCTOPRINT_VIEWMODELS.push({
        construct: InlineConfirmViewModel,
        dependencies: ["printerStateViewModel"]
    });

});
