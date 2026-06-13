/* Continue AI — website analytics. DISABLED by default.
 *
 * This runs ONLY on the marketing website — never in the extension. It ships
 * OFF: with no key set, nothing loads and no requests are made, which keeps the
 * site consistent with Continue AI's "no servers of ours, nothing transmitted"
 * stance.
 *
 * If you ever want privacy-friendly, cookieless analytics on the SITE (separate
 * from the extension), create a project at https://posthog.com, paste its
 * Project API Key ("phc_…") into POSTHOG_KEY below, and redeploy. Until then this
 * file is a no-op. */
(function () {
  "use strict";

  var POSTHOG_KEY = "";                            // empty → analytics stays OFF
  var POSTHOG_HOST = "https://us.i.posthog.com";

  if (!POSTHOG_KEY || POSTHOG_KEY.indexOf("REPLACE") !== -1) {
    return; // disabled: load nothing, send nothing
  }

  // --- Official PostHog loader (only runs if a key is set above) ---
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: "localStorage",      // cookieless
    disable_session_recording: true,  // no session replay
    autocapture: true,
    capture_pageview: true
  });
})();
