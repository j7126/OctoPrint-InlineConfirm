# coding=utf-8
from __future__ import absolute_import
import octoprint.plugin

class InlineConfirmPlugin(octoprint.plugin.AssetPlugin):

    # ~~ AssetPlugin mixin
    def get_assets(self):
        return dict(
            js=["js/inlineconfirm.js"],
            css=["css/inlineconfirm.css"]
        )

    # ~~ Softwareupdate hook
    def get_update_information(self):
        return dict(
            inlineconfirm=dict(
                displayName="Inline Confirm Plugin",
                displayVersion=self._plugin_version,

                # version check: github repository
                type="github_release",
                user="j7126",
                repo="OctoPrint-InlineConfirm",
                current=self._plugin_version,

                stable_branch=dict(
                            name="Stable",
                            branch="master",
                            comittish=["master"],
                ),

                # update method: pip
                pip="https://github.com/j7126/OctoPrint-InlineConfirm/archive/{target_version}.zip"
            )
        )


__plugin_name__ = "InlineConfirm"
__plugin_pythoncompat__ = ">=2.7,<4"


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = InlineConfirmPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
