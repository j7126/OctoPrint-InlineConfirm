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
        self.settingsViewModel = parameters[1];

        // startup complete
        self.onStartupComplete = function () {
            if ($('html#touch').val() == undefined) {
                $('#state_wrapper .row-fluid.print-control button#job_cancel').unbind();
                $('#state_wrapper .row-fluid.print-control button#job_cancel').click(self.jobCancel);
                $('#state_wrapper .row-fluid.print-control button#job_print').unbind();
                $('#state_wrapper .row-fluid.print-control button#job_print').click(self.jobPrint);
            }
            if (self.settingsViewModel.settings.plugins.preheat) {
                $('#state_wrapper').addClass('preheatPluginEnabled');
            }
        }

        var jobCancelOldText = '';
        self.jobCancel = InlineConfirm(
            '#state_wrapper .row-fluid.print-control button#job_cancel',
            self.printerStateModel.settings.feature_printCancelConfirmation,
            function () { OctoPrint.job.cancel(); },
            function (button, t) {
                $(button + ' > span').remove();
                $(button).textNodes().first().replaceWith(' Click again to confirm cancel <span>(' + t + ')</span>');
            },
            function (button) {
                jobCancelOldText = $(button).textNodes().first().text();
            },
            function (button) {
                console.log('a');
                $(button).textNodes().first().replaceWith(jobCancelOldText);
                $(button + ' > span').remove();
            }
        );
        var jobPrintOldText = '';
        self.jobPrint = InlineConfirm(
            '#state_wrapper .row-fluid.print-control button#job_print',
            function () {
                return self.printerStateModel.settings.feature_printStartConfirmation() || self.printerStateModel.isPaused();
            },
            function () {
                if (self.printerStateModel.isPaused())
                    OctoPrint.job.restart();
                else
                    OctoPrint.job.start();
            },
            function (button, t) {
                $(button + ' > span > span').remove();
                $(button + ' > span').html(' Click again to confirm print ' + (self.printerStateModel.isPaused() ? 'restart' : 'start') + ' <span>(' + t + ')</span>');
            },
            function (button) {
                jobPrintOldText = $(button + ' > span').html();
            },
            function (button, oldtext) {
                $(button + ' > span').html(jobPrintOldText);
            }
        );

        function InlineConfirm(button, condition, action, setText, start, end) {
            var confirming = false;
            var interval = null;
            var f = function (e) {
                e.preventDefault();
                if (confirming) {
                    end(button);
                    $(button).removeClass('confirm');
                    clearInterval(interval);
                    interval = null;
                    action();
                    confirming = false;
                } else if (!condition()) {
                    action();
                } else {
                    start(button);
                    confirming = true;
                    $(button).addClass('confirm');
                    var t = 5;
                    setTimeout(() => {
                        if (confirming) {
                            setText(button, t);
                            t--;
                        }
                    }, 500);
                    interval = setInterval(function () {
                        if (t < 0) {
                            end(button);
                            $(button).removeClass('confirm');
                            confirming = false;
                            clearInterval(interval);
                            interval = null;
                        } else {
                            setText(button, t);
                            t--;
                        }
                    }, 1000);
                }
            };
            return f;
        }
    };

    // view model class, parameters for constructor, container to bind to
    OCTOPRINT_VIEWMODELS.push({
        construct: InlineConfirmViewModel,
        dependencies: ["printerStateViewModel", "settingsViewModel"]
    });

});
