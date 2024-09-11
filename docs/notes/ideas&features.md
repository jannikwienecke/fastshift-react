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

## BUGS

- [ ] Nextjs Server side with react query: when updating a record, and then refreshing the page the record is not updated (server) but it is updated (client). Flickering
- Convex cannot upload the functions due to a jotai esm module import.. Need to uncomment this to make it work
