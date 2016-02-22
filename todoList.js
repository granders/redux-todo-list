// reducer for a *single* todo
const todo = (state, action) => {
  switch(action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }

      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

// redux reducer function
const todos = (state = [], action) => {
  switch(action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map((item) => {
        return todo(item, action)
      });
    default:
      return state;
  }
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch(action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const { combineReducers, createStore } = Redux;
const todoApp = combineReducers({
  todos: todos,
  visibilityFilter: visibilityFilter
});
const store = createStore(todoApp);
store.old_dispatch = store.dispatch;
store.dispatch = (action) => {
  if (typeof action === "undefined") {
    console.log("Initial state...")
  } else {
    console.log("Dispatching " + action.type);
    store.old_dispatch(action);
  }

  console.log("Current state:");
  console.log(store.getState());
};

///////////////////////////////////

var TodoItem = React.createClass({
  render: function() {
    var completed = this.props.completed;
    var text = this.props.text;
    var onClick = this.props.onClick;

    return (
      <li
        className={completed ? 'completed' : ''}
        onClick={onClick}>

        {text}
      </li>);
  }
});

var TodoList = React.createClass({
  render: function() {
    return (
      <ul>
        {this.props.todos
         .map(todo =>
           <TodoItem
            key={todo.id}
            {...todo}
            onClick={() => { this.props.onTodoClick(todo.id) }}
             />
         )}
      </ul>
    )
  }
});

var Link = React.createClass({
  render: function() {
    if (!this.props.active) {
      return (
        <span>{this.props.children}</span>
      );
    }

    return <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        this.props.onClick();
      }}>

      {this.props.children}
    </a>

  }
});

var FilterLink = React.createClass({
  componentDidMount: function() {
    this.unsubscribe = store.subscribe(() => { this.forceUpdate(); });
  },

  componentWillUnmount: function() {
    this.unsubscribe();
  },

  render: function() {
    const props = this.props;

    // Note that if there were another component that could independently
    // modify state.visibilityFilter, we could end up with a stale value
    // here. That's why we need to trigger a forceUpdate on every store
    // state change on the FilterLink component by subsribing in the
    // componentDidMount method
    const state = store.getState();

    return (
      <Link
        active={props.filter !== state.visibilityFilter}
        onClick={() => { this.selectFilter(props.filter); }}
        children={props.children}
      />
    );
  },
  selectFilter: function(filterName) {
    store.dispatch({
      type: 'SET_VISIBILITY_FILTER',
      filter: filterName
    })
  }
});

var TodoFilters = React.createClass({
  render: function() {
    return(
      <p>
        Show: {' '}
        <FilterLink filter="SHOW_ALL">
          All
        </FilterLink>
        {' '}
        <FilterLink filter="SHOW_ACTIVE">
          Active
        </FilterLink>
        {' '}
        <FilterLink filter="SHOW_COMPLETED">
          Completed
        </FilterLink>
      </p>);
  }
});

var AddTodo = React.createClass({
  render: function() {
    return (
      <div>
        <input ref={node => {
          this.input = node;}} />

        <button onClick={() => {
          this.props.onAdd(this.input.value);
          this.input.value = '';
        }}>
        Add Todo
        </button>
      </div>
    );
  }

});

let nextTodoId = 0;
var TodoApp = React.createClass({
  render: function() {
    return (
      <div>
        <AddTodo onAdd={(todoText) =>
          store.dispatch({
            type: 'ADD_TODO',
            text: todoText,
            id: nextTodoId++
          })
        }/>

        <TodoFilters />

        <TodoList
          todos={
            this.filterTodos(this.props.todos, this.props.visibilityFilter) }
          onTodoClick={ (id) => {store.dispatch({type: 'TOGGLE_TODO', id: id}); }}
        />
      </div>)
  },
  filterTodos: function(todos, filter) {
    return todos.filter(todo => {
        switch(filter) {
          case 'SHOW_ALL':
             return true;
          case 'SHOW_COMPLETED':
             return todo.completed;
           case 'SHOW_ACTIVE':
             return !todo.completed;
           default:
             return true;
        }
     })
  }
});

const render = () => {
  ReactDOM.render(
    <TodoApp
      { ...store.getState()}
    />,
    document.getElementById('root')
  );
};

store.subscribe(render);
render();
