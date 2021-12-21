import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ name: '', password: '' });
  const { name, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <p className='lead'>
        <i className='fas fa-user'></i> Sign Into Your Account
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
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            required
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Sign In' />
      </form>

      <p className='my-1'>
        Don't have an account? <Link to='/register'>Create one.</Link>
      </p>
    </>
  );
};

export default Login;
