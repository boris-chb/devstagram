import { SET_ALERT, REMOVE_ALERT } from './types';
import { v4 } from 'uuid';

// dispatch function available from Thunk Middleware
export const setAlert =
  (msg, alertType, timeout = 5000) =>
  (dispatch) => {
    const id = v4();
    // Dispatch action to reducer
    dispatch({
      type: SET_ALERT,
      payload: { msg, alertType, id },
    });

    // Remove Alert after {timeout} seconds.
    setTimeout(() => {
      dispatch({
        type: REMOVE_ALERT,
        payload: id,
      });
    }, timeout);
  };

export const removeAlert = (id) => (dispatch) => {
  dispatch({
    type: REMOVE_ALERT,
    payload: id,
  });
};
