---
id: 42o2k6t4wxdatm8de68elg2
title: Ideas&features
desc: ''
updated: 1724251430282
created: 1723657175909
---

# Ideas&features

- [ ] Dynamic filtering for the view => taskView.addFilter("userId", params.userId)
  - this allows for apps with such a routing structure /user/jannikwienecke/view/tasks
- [ ] search for firstname + lastname, currently we can just always only for one field (displayField | searchField)
- [ ] extend the default include: like. Project -> owner -> users. Currently just Project -> owner
- [ ] currently the index name for many to many fields must be the same as the field name.
- [ ] implement a kind of linter that checks and warns if the user has created a "good" schema with index and search fields.

## BUGS

- [ ] Nextjs Server side with react query: when updating a record, and then refreshing the page the record is not updated (server) but it is updated (client). Flickering
- Convex cannot upload the functions due to a jotai esm module import.. Need to uncomment this to make it work
- currently we have projects -> tasks. We send X (e.g. 10) tasks of that project to the frontend.
  - When we now update the tasks. We delete all the tasks from the project that were not send with the mutation. If the project has 100 tasks. We always delete all 90 tasks that were not sent to the frontend... -> MAYBE NOT. Maybe all is fine.
- when an error happens at a mutation, the reset of (for exqample), the select tasks in project view not working
- update the mutation and query dto props types -> we do not send all the stuff liek viewCOnfig anymore
