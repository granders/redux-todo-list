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
const { Provider } = ReactRedux;
const todoApp = combineReducers({
  todos: todos,
  visibilityFilter: visibilityFilter
});

const createVerboseStore = (reducer) => {
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

  return store;
};

///////////////////////////////////

// Use ReactRedux.connect to generate container components
const { connect } = ReactRedux;

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

const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter !== state.visibilityFilter
  };
}
const mapDispatchToLinkProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      });
    }
  }
}
const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link)

var TodoFilters = React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  render: function() {
    const { store } = this.context;

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
    const dispatch = this.props.dispatch;
    return (
      <div>
        <input ref={node => {
          this.input = node;}} />

        <button onClick={() => {
          dispatch({
            type: 'ADD_TODO',
            text: this.input.value,
            id: nextTodoId++
          });
          this.input.value = '';
        }}>
        Add Todo
        </button>
      </div>
    );
  }
});
AddTodo = connect()(AddTodo);

const filterTodos = function(todos, filter) {
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

// normally would call this mapStateToProps, but everything is in
// one file, so we'll make longer names to keep things unique
const mapStateToTodoListProps = (state) => {
  return {
      todos: filterTodos(state.todos, state.visibilityFilter)
  };
};
const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: (id) => { dispatch({type: 'TOGGLE_TODO', id: id}) }
  };
};
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

let nextTodoId = 0;
var TodoApp = React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  render: function() {
    const { store } = this.context;
    return (
      <div>
        <AddTodo />
        <TodoFilters />
        <VisibleTodoList />
      </div>)
  }
});

ReactDOM.render(
  <Provider store={createVerboseStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);
