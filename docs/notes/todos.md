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
- [ ] default sorting / default grouping
- [ ] add confirmation dialog (framework approach, to be enabled by field and action?)
- [ ] implement custom behaviour for combobox. E.g. Task -> Todos. Show only todos of that task. Updating the state of the task (completed / not completed)

## How we handle Deletes with soft delete

- project has many tasks, task has one project
- we "delete" a project, the task has still the reference but does not show it
- when we undelete the project, the task will show the project again
- same for projects when we "delete" a task (just filters out all the tasks that were deleted)
