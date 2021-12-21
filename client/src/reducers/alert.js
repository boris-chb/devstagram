import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

const alert = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT:
      // payload: { msg, alertType, id }
      return [...state, payload];
    case REMOVE_ALERT:
      // payload: { id }
      return state.filter((alert) => alert.id !== payload);
    default:
      return state;
  }
};

export default alert;
