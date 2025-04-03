---
id: 3oswb7egfyio0f447w91ocs
title: Outline
desc: ''
updated: 1723444550206
created: 1723444498044
---

# Outline

- [x] translations models
- [x] translations for create new and delete in contextmenui
- [x] handle Delete in contextmenu
- [x] add direction of sorting do display options
- [x] display options (hide deleted field from grouping sorting if showDeleted = false)
- [x] sort by deleted -> asc/desc not working
- [x] refactor the add label translation to view fields
- [x] soft delete project -> remove project from task -> by ignoring all with deleted = true
- [x] remove deleted from relational query
- [x] refactor the usage of all the index deleted filter usages
- [x] make tests pass
- [x] tests contextmenu
- [x] fix all build errors
- [x] fix github actions: all e2e run
- [x] handling mutation return types
- [x] add sonner for alerts
- [x] implement default / fallback component
- [x] task has sub-tasks
- [x] tasks has todos (model with only a label, status)
- [x] add test for one-to-many: tasks has many todos
- [x] add test for deleting a task
- [x] add tests for grouping / sorting
- [x] default sorting / default grouping
- [x] add confirmation dialog (framework approach, to be enabled by field and action?)
- [x] BUG: When we select a tag in the commandbar -> then select one in the list combobox -> Error
- [x] BUG: Contextmenu -> boolean field -> should toggle the value and not open the commandbar
- [x] can click on list item right click -> Edit task -> opens commandform
- [x] can click on list item rigjt click -> non relational fields edit -> open
- [x] BUG: When we scoll down, then update the task, we suddenly only see the last x tasks -> need test
- [x] show on which deployment i am currently am, or with which i am connected....
- [x] BUG when set sorting to "Name" -> scroll down -> load more data, this data is not sorted!
- [x] write tests to make sure all works
- [x] Filter0
- [x] button text commandform
- [x] error message show for delete and for update single attribute
- [x] in rename or change description, we see the reset database command, related to the bug below
- [x] in commandbar edit relation -> we see an empty row? remove
- [x] in priority in commandbar -> shows the number and not the related text
- [x] translation commandbar placeholder
- [x] german translation: "Neues Aufgabe"
- [x] commandbar placeholder -> show correct placeholder
- [x] add headings for other relation related commands (add new Project, etc.)
- [x] in contextmenu -> prorject -> new project, click nothing happens
- [x] click on filter in context menu should open the commandbar
- [x] header label in commandbar - setting project e.g;
- [x] contextmenu -> click tag -> select/deselect tag -> wrong behaviour -> add test

- [ ] does not displays the deleted items -> add test
- [ ] delete should be optimisc updaate..
- [ ] Copy in contextmenu does nothing
- [ ] in combobox render field names, label should be aligned (with or without icon), maybe default icon
- [ ] in combobox, "Ändern projects"
- [ ] add validation rules to config, name must have 3 charachtes, use arktype, frontend and backend -> add test
- [ ] in commandbar -> click new project -> error

<!-- FEATURE -->

- [ ] Commandform -> extract field input components into own components
- [ ] when created a new task -> click on notifiaction -> open task
- [ ] open after creation, in config
- [ ] update design / message / icon of success notification
- [ ] way to show what fields are missing / errors in form
- [ ] add tipTap
- [ ] implement custom behaviour for combobox. E.g. Task -> Todos. Show only todos of that task. Updating the state of the task (completed / not completed)

## How we handle Deletes with soft delete

- project has many tasks, task has one project
- we "delete" a project, the task has still the reference but does not show it
- when we undelete the project, the task will show the project again
- same for projects when we "delete" a task (just filters out all the tasks that were deleted)
