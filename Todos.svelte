<script>
  import { useMachine } from "./useMachine";
  import { useHashChange } from "./useHashChange";
  import { todosMachine } from "./todosMachine";
  import Todo from "./Todo.svelte";

  const { state, send } = useMachine(
    todosMachine.withConfig(
      {
        actions: {
          persist: ctx => {
            localStorage.setItem("todos-xstate", JSON.stringify(ctx.todos));
          }
        }
      },
      // initial state from localstorage
      {
        todo: "Learn state machines",
        todos: (() => {
          try {
            return JSON.parse(localStorage.getItem("todos-xstate")) || [];
          } catch (e) {
            return [];
          }
        })()
      }
    )
  );

  function filterTodos(state, todos) {
    if (state.matches("all")) {
      return todos;
    }

    if (state.matches("active")) {
      return todos.filter(todo => !todo.completed);
    }

    if (state.matches("completed")) {
      return todos.filter(todo => todo.completed);
    }
  }

  const hash = useHashChange();
  $: send(`SHOW.${$hash.slice(2) || "all"}`);

  $: todos = $state.context.todos;
  $: todo = $state.context.todo;

  $: numActiveTodos = todos.filter(todo => !todo.completed).length;
  $: allCompleted = todos.length > 0 && numActiveTodos === 0;
  $: mark = !allCompleted ? "completed" : "active";
  $: markEvent = `MARK.${mark}`;
  $: filteredTodos = filterTodos($state, todos);
</script>

<section class="todoapp" data-state={$state.toStrings()}>
  <header class="header">
    <h1>todos</h1>
    <input
      class="new-todo"
      placeholder="What needs to be done?"
      on:keypress={e => {
        if (e.key === 'Enter') {
          send({ type: 'NEWTODO.COMMIT', value: e.target.value })
        }
      }}
      on:input={e => send({ type: 'NEWTODO.CHANGE', value: e.target.value })}
      value={todo} />
  </header>
  <section class="main">
    <input
      id="toggle-all"
      class="toggle-all"
      type="checkbox"
      checked={allCompleted}
      on:change={e => send(markEvent)} />
    <label for="toggle-all" title={`Mark all as ${mark}`}>
      Mark all as {mark}
    </label>
    <ul class="todo-list">
      {#each filteredTodos as todo, i (todo.id)}
        <Todo
          {todo}
          on:change={({ detail }) => send({
              type: 'TODO.COMMIT',
              todo: detail,
            })}
          on:delete={({ detail }) => send({
              type: 'TODO.DELETE',
              id: detail,
            })} />
      {/each}
    </ul>
  </section>

  {#if !!todos.length}
    <footer class="footer">
      <span class="todo-count">
        <strong>{numActiveTodos}</strong>
        item{numActiveTodos === 1 ? '' : 's'} left
      </span>
      <ul class="filters">
        <li>
          <a class:selected={$state.matches('all')} href="#/">All</a>
        </li>
        <li>
          <a class:selected={$state.matches('active')} href="#/active">
            Active
          </a>
        </li>
        <li>
          <a class:selected={$state.matches('completed')} href="#/completed">
            Completed
          </a>
        </li>
      </ul>
      {#if numActiveTodos < todos.length}
        <button on:click={_ => send('CLEAR_COMPLETED')} class="clear-completed">
          Clear completed
        </button>
      {/if}

    </footer>
  {/if}
</section>


<!-- Codesandbox bux? Styles in `index.html` don't get picked up -->
<style>
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
  }

  :global(button) {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    font-size: 100%;
    vertical-align: baseline;
    font-family: inherit;
    font-weight: inherit;
    color: inherit;
    -webkit-appearance: none;
    appearance: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(body) {
    font: 14px "Helvetica Neue", Helvetica, Arial, sans-serif;
    line-height: 1.4em;
    background: #f5f5f5;
    color: #4d4d4d;
    min-width: 230px;
    max-width: 550px;
    margin: 0 auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-weight: 300;
  }

  :global(:focus) {
    outline: 0;
  }

  :global(.hidden) {
    display: none;
  }

  :global(.todoapp) {
    background: #fff;
    margin: 130px 0 40px 0;
    position: relative;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
  }

  :global(.todoapp input::-webkit-input-placeholder) {
    font-style: italic;
    font-weight: 300;
    color: #e6e6e6;
  }

  :global(.todoapp input::-moz-placeholder) {
    font-style: italic;
    font-weight: 300;
    color: #e6e6e6;
  }

  :global(.todoapp input::input-placeholder) {
    font-style: italic;
    font-weight: 300;
    color: #e6e6e6;
  }

  :global(.todoapp h1) {
    position: absolute;
    top: -155px;
    width: 100%;
    font-size: 100px;
    font-weight: 100;
    text-align: center;
    color: rgba(175, 47, 47, 0.15);
    -webkit-text-rendering: optimizeLegibility;
    -moz-text-rendering: optimizeLegibility;
    text-rendering: optimizeLegibility;
  }

  :global(.new-todo),
  :global(.edit) {
    position: relative;
    margin: 0;
    width: 100%;
    font-size: 24px;
    font-family: inherit;
    font-weight: inherit;
    line-height: 1.4em;
    color: inherit;
    padding: 6px;
    border: 1px solid #999;
    box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(.new-todo) {
    padding: 16px 16px 16px 60px;
    border: none;
    background: rgba(0, 0, 0, 0.003);
    box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
  }

  :global(.main) {
    position: relative;
    z-index: 2;
    border-top: 1px solid #e6e6e6;
  }

  :global(.toggle-all) {
    width: 1px;
    height: 1px;
    border: none;
    /* Mobile Safari */
    opacity: 0;
    position: absolute;
    right: 100%;
    bottom: 100%;
  }

  :global(.toggle-all + label) {
    width: 60px;
    height: 34px;
    font-size: 0;
    position: absolute;
    top: -52px;
    left: -13px;
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  :global(.toggle-all + label:before) {
    content: "❯";
    font-size: 22px;
    color: #e6e6e6;
    padding: 10px 27px 10px 27px;
  }

  :global(.toggle-all:checked + label:before) {
    color: #737373;
  }

  :global(.todo-list) {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :global(.todo-list li) {
    position: relative;
    font-size: 24px;
    border-bottom: 1px solid #ededed;
  }

  :global(.todo-list li:last-child) {
    border-bottom: none;
  }

  :global(.todo-list li.editing) {
    border-bottom: none;
    padding: 0;
  }

  :global(.todo-list li.editing .edit) {
    display: block;
    width: calc(100% - 43px);
    padding: 12px 16px;
    margin: 0 0 0 43px;
  }

  :global(.todo-list li.editing .view) {
    display: none;
  }

  :global(.todo-list li .toggle) {
    text-align: center;
    width: 40px;
    /* auto, since non-WebKit browsers doesn't support input styling */
    height: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0;
    border: none;
    /* Mobile Safari */
    -webkit-appearance: none;
    appearance: none;
  }

  :global(.todo-list li .toggle) {
    opacity: 0;
  }

  :global(.todo-list li .toggle + label) {
    background-image: url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23ededed%22%20stroke-width%3D%223%22/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center left;
  }

  :global(.todo-list li .toggle:checked + label) {
    background-image: url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23bddad5%22%20stroke-width%3D%223%22/%3E%3Cpath%20fill%3D%22%235dc2af%22%20d%3D%22M72%2025L42%2071%2027%2056l-4%204%2020%2020%2034-52z%22/%3E%3C/svg%3E");
  }

  :global(.todo-list li label) {
    word-break: break-all;
    padding: 15px 15px 15px 60px;
    display: block;
    line-height: 1.2;
    transition: color 0.4s;
  }

  :global(.todo-list li.completed label) {
    color: #d9d9d9;
    text-decoration: line-through;
  }

  :global(.todo-list li .destroy) {
    display: none;
    position: absolute;
    top: 0;
    right: 10px;
    bottom: 0;
    width: 40px;
    height: 40px;
    margin: auto 0;
    font-size: 30px;
    color: #cc9a9a;
    margin-bottom: 11px;
    transition: color 0.2s ease-out;
  }

  :global(.todo-list li .destroy:hover) {
    color: #af5b5e;
  }

  :global(.todo-list li .destroy:after) {
    content: "×";
  }

  :global(.todo-list li:hover .destroy) {
    display: block;
  }

  :global(.todo-list li .edit) {
    display: none;
  }

  :global(.todo-list li.editing:last-child) {
    margin-bottom: -1px;
  }

  :global(.footer) {
    color: #777;
    padding: 10px 15px;
    height: 20px;
    text-align: center;
    border-top: 1px solid #e6e6e6;
  }

  :global(.footer:before) {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 50px;
    overflow: hidden;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2), 0 8px 0 -3px #f6f6f6,
      0 9px 1px -3px rgba(0, 0, 0, 0.2), 0 16px 0 -6px #f6f6f6,
      0 17px 2px -6px rgba(0, 0, 0, 0.2);
  }

  :global(.todo-count) {
    float: left;
    text-align: left;
  }

  :global(.todo-count strong) {
    font-weight: 300;
  }

  :global(.filters) {
    margin: 0;
    padding: 0;
    list-style: none;
    position: absolute;
    right: 0;
    left: 0;
  }

  :global(.filters li) {
    display: inline;
  }

  :global(.filters li a) {
    color: inherit;
    margin: 3px;
    padding: 3px 7px;
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: 3px;
  }

  :global(.filters li a:hover) {
    border-color: rgba(175, 47, 47, 0.1);
  }

  :global(.filters li a.selected) {
    border-color: rgba(175, 47, 47, 0.2);
  }

  :global(.clear-completed),
  :global(html .clear-completed:active) {
    float: right;
    position: relative;
    line-height: 20px;
    text-decoration: none;
    cursor: pointer;
  }

  :global(.clear-completed:hover) {
    text-decoration: underline;
  }

  :global(.info) {
    margin: 65px auto 0;
    color: #bfbfbf;
    font-size: 10px;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
    text-align: center;
  }

  :global(.info p) {
    line-height: 1;
  }

  :global(.info a) {
    color: inherit;
    text-decoration: none;
    font-weight: 400;
  }

  :global(.info a:hover) {
    text-decoration: underline;
  }

  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    :global(.toggle-all),
    :global(.todo-list li .toggle) {
      background: none;
    }

    :global(.todo-list li .toggle) {
      height: 40px;
    }
  }
  @media (max-width: 430px) {
    :global(.footer) {
      height: 50px;
    }

    :global(.filters) {
      bottom: 10px;
    }
  }
  :global(hr) {
    margin: 20px 0;
    border: 0;
    border-top: 1px dashed #c5c5c5;
    border-bottom: 1px dashed #f7f7f7;
  }

  :global(.learn a) {
    font-weight: normal;
    text-decoration: none;
    color: #b83f45;
  }

  :global(.learn a:hover) {
    text-decoration: underline;
    color: #787e7e;
  }

  :global(.learn h3),
  :global(.learn h4),
  :global(.learn h5) {
    margin: 10px 0;
    font-weight: 500;
    line-height: 1.2;
    color: #000;
  }

  :global(.learn h3) {
    font-size: 24px;
  }

  :global(.learn h4) {
    font-size: 18px;
  }

  :global(.learn h5) {
    margin-bottom: 0;
    font-size: 14px;
  }

  :global(.learn ul) {
    padding: 0;
    margin: 0 0 30px 25px;
  }

  :global(.learn li) {
    line-height: 20px;
  }

  :global(.learn p) {
    font-size: 15px;
    font-weight: 300;
    line-height: 1.3;
    margin-top: 0;
    margin-bottom: 0;
  }

  :global(#issue-count) {
    display: none;
  }

  :global(.quote) {
    border: none;
    margin: 20px 0 60px 0;
  }

  :global(.quote p) {
    font-style: italic;
  }

  :global(.quote p:before) {
    content: "“";
    font-size: 50px;
    opacity: 0.15;
    position: absolute;
    top: -20px;
    left: 3px;
  }

  :global(.quote p:after) {
    content: "”";
    font-size: 50px;
    opacity: 0.15;
    position: absolute;
    bottom: -42px;
    right: 3px;
  }

  :global(.quote footer) {
    position: absolute;
    bottom: -40px;
    right: 0;
  }

  :global(.quote footer img) {
    border-radius: 3px;
  }

  :global(.quote footer a) {
    margin-left: 5px;
    vertical-align: middle;
  }

  :global(.speech-bubble) {
    position: relative;
    padding: 10px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 5px;
  }

  :global(.speech-bubble:after) {
    content: "";
    position: absolute;
    top: 100%;
    right: 30px;
    border: 13px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.04);
  }

  :global(.learn-bar > .learn) {
    position: absolute;
    width: 272px;
    top: 8px;
    left: -300px;
    padding: 10px;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.6);
    transition-property: left;
    transition-duration: 500ms;
  }

  @media (min-width: 899px) {
    :global(.learn-bar) {
      width: auto;
      padding-left: 300px;
    }

    :global(.learn-bar > .learn) {
      left: 8px;
    }
  }
</style>