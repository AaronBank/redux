const typeDetection = (obj) => {
  const typeString = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'Symbol']
  let result = typeString.map(item => ({ [`[object ${item}]`]: item.toLowerCase() }))

  if ( obj === null ) return 'null'

  return typeof obj === 'object' || typeof obj === 'function' ?
  result[ toString.call( obj ) ] || 'object' : typeof obj
}

const createStore = (reducer) => {
  let state
  let listeners = []

  const dispatch = (action, reducer) => {
    const newState = reducer(state, action)

    if (newState && typeDetection(newState) === 'object') {
      state = { ...state, ...newState }

      listeners.forEach(subscribers => subscribers())
    } else {
      throw new Error(`Reducer expects an object, and actually gets an ${typeDetection(newState)}.`)
    }
  }

  const getState = () => ({ ...state })

  const subscribe = subscriber => {
    listeners.push(subscriber)
    return (subscriber) => {
      listeners = listeners.filter(subscribers => subscriber !== subscribers )
    }
  }

  dispatch({})

  return { dispatch, getState, subscribe }
}

const combineReducers = (reducers) => {
  const initState = {}

  return (state = initState, action) => {
    combineState = {}

    Object.keys(reducers).forEach(key => {
      const currentState = reducers[key]

      combineState[key] = currentState(state, action)
    })

    return combineState
  }
}

const compose = (...funcs) => (...args) => {
  const lastFunc = funcs.pop()

  return funcs.reduceRight( (prev, next) => {
    return next(next)
  }, lastFunc(...args))
}

const applyMiddleware = (...middleWares) => createStore => reducer => {
  const store = createStore(reducer)
  const middles = middleWares.map(middleware => middleware(store))
  const dispatch = compose(...middles)(store.dispatch)

  return { ...store, dispatch }
}

export { createStore, combineReducers, applyMiddleware, compose }