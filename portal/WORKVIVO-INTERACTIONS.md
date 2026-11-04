# Workvivo post interactions

Open a Workvivo post from Workvivo Insights or view a native/associated post in Post Library. In **Stakeholder Interactions**, click **Add Interaction**, choose the stakeholder and action, select the interaction date, optionally enter notes, and save.

There is no separate stakeholder reporting page or sidebar item. Interaction records belong to the current saved post ID. Supported stakeholders reuse Configuration master identities, including aliases after a rename. Supported default names are added to Configuration on first use; arbitrary names are not accepted through the form.

New records use the existing generic record store with kind `workvivo_interaction`. They contain the post ID, stakeholder master ID, interaction type, date, optional notes, and a count of one. Repeated submissions with the same record ID do not add another interaction. No new database table, migration, or environment variable is required.

Workvivo-associated Facebook/Instagram posts retain their original post ID. Their Workvivo actions are distinct from external engagement metrics and external interaction logs. Existing imported interactions linked to native Workvivo posts remain available in the internal summary.

Workvivo Insights includes stakeholder, theme, partner and monthly interaction summaries. Counts are logged actions, not unique people or stakeholder-attributed audience engagement. Theme rankings use recorded Workvivo categories/topics; no themes are inferred from titles. Missing logs do not establish lack of interest.

New monthly report snapshots include these summaries within **Workvivo Performance**. They do not add a standalone stakeholder report or AIC/GRA section. Workvivo-specific AI commentary must cite explicit Workvivo interaction evidence. Notes are shown in post details and are not passed into analytics or AI reporting evidence.

Deleting or archiving a post moves its Workvivo logs into the same recovery group; restoring that group restores the logs. Removing a Workvivo association excludes its logs from current internal analytics without deleting the historical records.

Validation: `node scripts/test-workvivo-interactions.mjs` and `node scripts/test-monthly-reports.mjs`.
