"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebformTemplate = void 0;
var fs = require("fs");
var core_1 = require("@freon4dsl/core");
var StudyConfigurationModelEnvironment_1 = require("../../config/gen/StudyConfigurationModelEnvironment");
var WebformTemplate = /** @class */ (function () {
    function WebformTemplate() {
    }
    WebformTemplate.loadModel = function (modelName) {
        core_1.FreLogger.muteAllLogs();
        var tmp = StudyConfigurationModelEnvironment_1.StudyConfigurationModelEnvironment.getInstance();
        var serializer = new core_1.FreLionwebSerializer();
        console.log("current directory:" + process.cwd());
        var metaModel = JSON.parse(fs.readFileSync("./src/StudyConfiguration/custom/__tests__/modelstore/StudyConfiguration/".concat(modelName, ".json")).toString());
        var ts = serializer.toTypeScriptInstance(metaModel);
        var model = ts;
        return model;
    };
    WebformTemplate.writeWebForms = function (model) {
        var _this = this;
        model.periods.forEach(function (period, periodNumber) {
            // log("Period Name:" + period.name);
            period.events.forEach(function (event, eventNumber) {
                // log("Event Name:" + event.name);
                // Get the list of activities that go on this form
                var activities = event.checkList.activities;
                var template = "# TASK WEBFORM - ".concat(event.name, " \nlangcode: en\nstatus: open\ndependencies: {  }\nweight: 0\nopen: null\nclose: null\nuid: 1\ntemplate: false\narchive: false\nid: ").concat(event.freId, "\ntitle: ").concat(event.name, "\ndescription: ''\ncategories:\n  - Task\nelements: |-\n  placeholder_for_expand_collapse:\n    '#type': details\n    '#title': placeholder_for_expand_collapse\n    '#title_display': invisible\n    '#states':\n      invisible:\n        - ':input[name=\"step_1\"]':\n            checked: true\n        - or\n        - ':input[name=\"step_1\"]':\n            unchecked: true\n    '#access_create_roles':\n      - authenticated\n    '#access_update_roles':\n      - authenticated\n    '#access_view_roles':\n      - authenticated\n").concat(activities.map(function (a, counter) { return "<#list steps?values as step>\n  step_".concat(counter, ":\n    '#type': checkbox\n    '#title': 'Step ").concat(counter, " - ").concat(a.name, "'\n    '#wrapper_attributes':\n      class:\n        - step-header\n  step").concat(counter, "_details:\n    '#type': details\n    '#title': Details\n    '#title_display': invisible\n    '#attributes':\n      class:\n        - step-content\n    step").concat(counter, "_instructions:\n      '#type': processed_text\n      '#text': '<div id=\"container\" class=\"step-detail\"><div id=\"definition\" class=\"step-detail-definition\"><ul><li>").concat((a.decision.text), "</li></ul></div></div>'\n      '#format': full_html"); }), "\n  submit_buttons:\n    '#type': webform_flexbox\n    complete:\n      '#type': webform_actions\n      '#title': 'Complete Now'\n      '#flex': 0\n      '#attributes':\n        class:\n          - task-primary-button\n      '#submit__label': 'Complete Now'\n      '#update__label': 'Complete Now'\n    complete_later:\n      '#type': webform_actions\n      '#title': 'Complete Later'\n      '#flex': 0\n      '#attributes':\n        class:\n          - task-secondary-button\n      '#submit__label': 'Complete Later'\n      '#update__label': 'Complete Later'\ncss: ''\njavascript: ''\nsettings:\n  ajax: false\n  ajax_scroll_top: form\n  ajax_progress_type: ''\n  ajax_effect: ''\n  ajax_speed: null\n  page: true\n  page_submit_path: ''\n  page_confirm_path: ''\n  page_theme_name: ''\n  form_title: source_entity_webform\n  form_submit_once: true\n  form_open_message: ''\n  form_close_message: ''\n  form_exception_message: ''\n  form_previous_submissions: false\n  form_confidential: false\n  form_confidential_message: ''\n  form_disable_remote_addr: false\n  form_convert_anonymous: false\n  form_prepopulate: false\n  form_prepopulate_source_entity: false\n  form_prepopulate_source_entity_required: false\n  form_prepopulate_source_entity_type: ''\n  form_unsaved: false\n  form_disable_back: true\n  form_submit_back: false\n  form_disable_autocomplete: false\n  form_novalidate: false\n  form_disable_inline_errors: false\n  form_required: false\n  form_autofocus: false\n  form_details_toggle: false\n  form_reset: false\n  form_access_denied: default\n  form_access_denied_title: ''\n  form_access_denied_message: ''\n  form_access_denied_attributes: {  }\n  form_file_limit: ''\n  form_attributes: {  }\n  form_method: ''\n  form_action: ''\n  share: false\n  share_node: false\n  share_theme_name: ''\n  share_title: true\n  share_page_body_attributes: {  }\n  submission_label: ''\n  submission_exception_message: ''\n  submission_locked_message: ''\n  submission_log: false\n  submission_excluded_elements: {  }\n  submission_exclude_empty: false\n  submission_exclude_empty_checkbox: false\n  submission_views: {  }\n  submission_views_replace: {  }\n  submission_user_columns: {  }\n  submission_user_duplicate: false\n  submission_access_denied: default\n  submission_access_denied_title: ''\n  submission_access_denied_message: ''\n  submission_access_denied_attributes: {  }\n  previous_submission_message: ''\n  previous_submissions_message: ''\n  autofill: false\n  autofill_message: ''\n  autofill_excluded_elements: {  }\n  wizard_progress_bar: true\n  wizard_progress_pages: false\n  wizard_progress_percentage: false\n  wizard_progress_link: false\n  wizard_progress_states: false\n  wizard_start_label: ''\n  wizard_preview_link: false\n  wizard_confirmation: true\n  wizard_confirmation_label: ''\n  wizard_auto_forward: true\n  wizard_auto_forward_hide_next_button: false\n  wizard_keyboard: true\n  wizard_track: ''\n  wizard_prev_button_label: ''\n  wizard_next_button_label: ''\n  wizard_toggle: false\n  wizard_toggle_show_label: ''\n  wizard_toggle_hide_label: ''\n  wizard_page_type: container\n  wizard_page_title_tag: h2\n  preview: 0\n  preview_label: ''\n  preview_title: ''\n  preview_message: ''\n  preview_attributes: {  }\n  preview_excluded_elements: {  }\n  preview_exclude_empty: true\n  preview_exclude_empty_checkbox: false\n  draft: none\n  draft_multiple: false\n  draft_auto_save: false\n  draft_saved_message: ''\n  draft_loaded_message: ''\n  draft_pending_single_message: ''\n  draft_pending_multiple_message: ''\n  confirmation_type: page\n  confirmation_url: ''\n  confirmation_title: ''\n  confirmation_message: ''\n  confirmation_attributes: {  }\n  confirmation_back: true\n  confirmation_back_label: ''\n  confirmation_back_attributes: {  }\n  confirmation_exclude_query: false\n  confirmation_exclude_token: false\n  confirmation_update: false\n  limit_total: null\n  limit_total_interval: null\n  limit_total_message: ''\n  limit_total_unique: false\n  limit_user: null\n  limit_user_interval: null\n  limit_user_message: ''\n  limit_user_unique: false\n  entity_limit_total: null\n  entity_limit_total_interval: null\n  entity_limit_user: null\n  entity_limit_user_interval: null\n  purge: none\n  purge_days: null\n  results_disabled: false\n  results_disabled_ignore: false\n  results_customize: false\n  token_view: false\n  token_update: false\n  token_delete: false\n  serial_disabled: false\naccess:\n  create:\n    roles:\n      - authenticated\n    users: {  }\n    permissions: {  }\n  view_any:\n    roles:\n      - authenticated\n    users: {  }\n    permissions: {  }\n  update_any:\n    roles:\n      - authenticated\n    users: {  }\n    permissions: {  }\n  delete_any:\n    roles:\n      - authenticated\n    users: {  }\n    permissions: {  }\n  purge_any:\n    roles: {  }\n    users: {  }\n    permissions: {  }\n  view_own:\n    roles: {  }\n    users: {  }\n    permissions: {  }\n  update_own:\n    roles: {  }\n    users: {  }\n    permissions: {  }\n  delete_own:\n    roles: {  }\n    users: {  }\n    permissions: {  }\n  administer:\n    roles: {  }\n    users: {  }\n    permissions: {  }\n  test:\n    roles: {  }\n    users: {  }\n    permissions: {  }\n  configuration:\n    roles: {  }\n    users: {  }\n    permissions: {  }\nhandlers: {  }\nvariants: {  }");
                _this.writeWebFormToFile(template, event.name);
            });
        });
    };
    WebformTemplate.writeWebFormToFile = function (webFormYaml, formName) {
        // log("template:" + webFormYaml);
        var fileName = "".concat(formName, ".yaml");
        if (fs.existsSync(fileName)) {
            try {
                fs.unlinkSync(fileName);
                // log(`${fileName} has been removed`);
            }
            catch (err) {
                console.error("Error removing file ".concat(fileName, ": ").concat(err));
            }
        }
        try {
            fs.writeFileSync(fileName, webFormYaml);
            // log(`${fileName} has been written`);
        }
        catch (err) {
            console.error('Error writing file:', err);
        }
    };
    return WebformTemplate;
}());
exports.WebformTemplate = WebformTemplate;
