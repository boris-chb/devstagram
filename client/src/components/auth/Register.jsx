import { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';
import PropTypes from 'prop-types';

const Register = ({ setAlert }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger', 4000);
    }
    setAlert('Signed up successfully!', 'success', 4000);
  };
  return (
    <>
      <p className='lead'>
        <i className='fa fa-user'></i> Create your account
      </p>
      <form onSubmit={onSubmit} className='form'>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={name}
            onChange={onChange}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email'
            name='email'
            value={email}
            onChange={onChange}
            required
          />
          <small className='form-text'>
            Use your Gravatar email if you have one to import avatar
          </small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={onChange}
            required
            minLength='6'
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            value={password2}
            onChange={onChange}
            required
            minLength='6'
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Sign Up' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Login</Link>
      </p>
    </>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  // removeAlert: PropTypes.func.isRequired,
};

// Connect to Redux
// takes in: (state, { actions })(current component to map the actions to)
export default connect(null, { setAlert })(Register);
// Result: setAlert is available to Register component via props.setAlert
