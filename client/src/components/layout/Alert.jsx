import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  // If more than one alert is being passed:
  alerts &&
  alerts.length > 0 &&
  alerts.map((alert) => {
    const { id, alertType, msg: message } = alert;
    return (
      <div key={id} className={`alert alert-${alertType}`}>
        {message}
      </div>
    );
  });

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

// Get Alert State (Redux State -> Component Prop)
const mapStateToProps = (state) => ({
  alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);
