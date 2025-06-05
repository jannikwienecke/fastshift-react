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
- [x] check for error handling in commandbar
- [x] does not displays the deleted items -> add test
- [x] delete should be optimisc updaate..
- [x] in commandbar -> click new project -> error
- [x] cannot create a project from the task view -> we dont have the relational data for project (owner e.g.)
- [x] how to handle fields that are calculated from other fields (name <- firstname & lastname)
- [x] Copy in contextmenu does nothing
- [x] in combobox, "Ändern projects"
- [x] add validation rules to config, name must have 3 charachtes, use arktype, frontend and backend -> add test
- [x] in convex helper -> taskId: mutation.payload.id -> make dynamic
- [x] task can only add 1 todo for example, how would that work
- [x] refactor select many to many in all places
- [x] local mode -> load all
- [x] add tests for validation rules frontend and backend
- [x] in combobox render field names, label should be aligned (with or without icon), maybe default icon

## How we handle Deletes with soft delete

- project has many tasks, task has one project
- we "delete" a project, the task has still the reference but does not show it
- when we undelete the project, the task will show the project again
- same for projects when we "delete" a task (just filters out all the tasks that were deleted)

- [x] handle e.g. projects -> tasks list in detail
- [x] switching between views when we have a filter on one of the views -> error
- [x] filter in main tasks list -> effects list in projects -> task
- [x] when i set the project to a different one and its not in the list anymore -> remove optimistically
- [x] projects -> tasks should not be in sidebar of detail, tags should be (config )
- [x] not updating when convex db updates in task list view (only task view) (i think worked again)
- [x] leeren gruppen anzeigen/ausblenden. Blendet nicht alle richtig aus
- [x] i am on a custom view -> move to another view, filter etc. stays -> not correct!
- [x] local filtering for sub views not implemented
- [x] when i am at projects -> tasks, dont show the filter for projects and the grouping for projects
- [x] remove tasks from sidebar (with config)
- [x] when setting field from commandbar like email -> will not be validated
- [x] not everyting of the contextmenu list item is clickable
- [x] deleting "breaks" the app. Nothing is clickable
- [x] show deleted in sub view not working
- [x] should be "change category" in the combobox for project (we have always just one), update in test as well,
- [x] change commandbar item in sublist -> create new task in project. Preselect project.
- [x] if we are in projects -task, but create a task in a different project. should not be visible after creation
- [x] checkmark in combobox list
- [x] check query behaviour in commandbar (use debounced query for viewfield of type relation)
- [x] handle views in sub list
- [x] add back custom commands
- [x] cannot filter by tasks -> todos
- [x] handle click on list item in sub view
- [x] placeholder in commandbar for selected view
<!-- todo tests -->

- [x] cannot go back from a custom view / sub view to main
- [ ] does not show tasks of project if we are on a custom project view

- [x] add test for filter not used in sub view
- [x] add test for switching between views when one has filter set
- [x] add test for: when setting field from commandbar like email -> will not be validated
- [x] tests for saving view config in sub view

<!--  -->

## History

- [x] set updated at when create new entry
- [x] add test data entries in init script
- [x] show date in list view
- [x] click on history item (e.g. right click) -> go to detail view of it
- [x] show owner and not the user
- [x] add config to disable go to in relation field on click
- [x] click on relation in list to go to
- [x] fix owner (firstname, lastname, name)
- [x] can filter history by tablename
- [x] handle many to many history items with type "delete"
- [x] fix translation strings for filtering
- [x] can filter by timestamp
- [x] can filter by id
- [x] adjst the detail view -> custom one -> yes
- [x] can navigate from detail view to detail of changed model
- [x] when navigate to tasks from history. Click on tags. Not showing correctly
- [x] when we add a tag, the order changes as soon as the mutation is done
- [x] display options in history not shown

<!-- Toos activity tab -->

- [x] in tasks lis view, change tags, click on create new tag. nothing happens
- [x] test: in detail task view -> go to create tag commandform
- [x] test: in detail task view -> try to add or remove tags
- [x] test: in detail task view -> have 3 tags, remove one, add a different one, add back the first thta were removed

Small Bugs to fix

- [x] in tasks detail, todos list. Open commandbar -> shows wrong options (Rename Task. Should be Name of todo)
- [x] in add task in project, project is not selected...
- [x] in add task in project, priority is not rendered correctly
- [x] the due date field in project detail, has no icon shown

Small Features to add

- [x] activity list, we need to add a useActivity hook for real time updates.
- [x] scrollable list for acitivty
- [x] when we create a tag inside a task detail view, we need to directly add this tag to this task
- [x] add a go to button next to the relational value in detail
- [x] in tab header -> show icon
- [x] in tab content. show the display field more prominent and add a go to button
- [x] in combobox popover, if not found -> show create
- [x] create sepearte store for values that should be persisted on local storage and the synced

### Next Feature to add:

- [ ] add -> user can comment on an model, inside the acitivty list

### Small Feature:

- [x] find in view
- [x] sidebar list view, filter on the relational and enum values
- [x] group by enum
- [x] if we are doing a search/filtering and we are fetchMore.isDone -> local search...
- [x] star/unstar from the right sidebar
- [x] menu dropdown in the right sidebar
- [x] check how options in right click contextmenu are implemented
- [ ] select one or more rows -> show correct action commands, show action popover like linear
- [ ] action buttons in views
- [ ] if i query the commandbar, and the edit view fields are in the list, sort them to the top
- [ ] when created a new task -> click on notifiaction -> open task
- [ ] open after creation, in config
- [ ] color picker and color indicator for fields with type "color" or something like this
- [ ] chat in activity
- [ ] chat activity (optimistic update)
- [ ] implement custom behaviour for combobox. E.g. Task -> Todos. Show only todos of that task. Updating the state of the task (completed / not completed)
- [ ] in detail activity list -> combine activies based on the type and the date
- [ ] add tipTap

### Add tests

- [ ] in tasks detail, todos list. Open commandbar -> shows wrong options (Rename Task. Should be Name of todo)
- [ ] when we create a tag inside a task detail view, we need to directly add this tag to this task
- [x] history in detail view (activity list)
- [ ] in combobox: deselect tag, select, deselect, select. Not Updating in ui anymore
- [x] extend smoke test and make sure it runs first
- [x] be on owner page -> navigate to history page
- [x] be on detail page of tasks -> navigate to list page of tasks
- [x] be on tasks all -> navigate to tasks urgent
