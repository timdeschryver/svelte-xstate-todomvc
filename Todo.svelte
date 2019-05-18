<script>
  export let todo;

  import { createEventDispatcher } from "svelte";
  import { useMachine } from "./useMachine";
  import { todoMachine } from "./todoMachine";

  const dispatch = createEventDispatcher();

  let inputRef;

  const { state, send } = useMachine(
    todoMachine.withConfig(
      {
        actions: {
          focusInput() {
            setTimeout(() => {
              inputRef && inputRef.select();
            }, 0);
          },
          notifyDeleted(ctx) {
            dispatch("delete", ctx.id);
          },
          notifyChanged(ctx) {
            dispatch("change", {
              id: ctx.id,
              title: ctx.title,
              completed: ctx.completed
            });
          }
        }
      },
      todo // extended state
    )
  );

  $: completed = $state.context.completed;
  $: title = $state.context.title;
  $: todo$ = todo;

  $: {
    setTimeout(() => {
      if (todo.completed !== completed) {
        send("TOGGLE_COMPLETE");
      }
    });
  }
</script>

<li
  class:editing={$state.matches('editing')}
  class:completed
  data-todo-state={completed ? 'completed' : 'active'}>
  <div class="view">
    <input
      class="toggle"
      type="checkbox"
      on:change={_ => send('TOGGLE_COMPLETE')}
      checked={completed} />
    <label on:dblclick={e => send('EDIT')}> {title} </label>
    <button class="destroy" on:click={() => send('DELETE')} />
  </div>
  <input
    class="edit"
    value={title}
    on:blur={_ => send('BLUR')}
    on:input={e => send({ type: 'CHANGE', value: e.target.value })}
    on:keypress={e => {
      if (e.key === 'Enter') {
        send('COMMIT')
      }
    }}
    on:keydown={e => {
      if (e.key === 'Escape') {
        send('CANCEL')
      }
    }}
    bind:this={inputRef} />
</li>
