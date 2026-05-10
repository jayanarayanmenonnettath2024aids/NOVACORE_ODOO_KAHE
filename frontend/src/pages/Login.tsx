import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Styles for the highly-custom spinning card design */}
      <style>{`
        @import url("https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700,800,900&display=swap");
        @import url("https://use.fontawesome.com/releases/v6.5.1/css/all.css");

        .login-page-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100vw;
          background: #25252b;
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: "Poppins", sans-serif;
          box-sizing: border-box;
        }

        .login-page-wrapper * {
          font-family: "Poppins", sans-serif;
          box-sizing: border-box;
        }

        @property --a {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .magic-box {
          position: relative;
          width: 400px;
          height: 200px;
          background: repeating-conic-gradient(
            from var(--a),
            #ff2770 0%,
            #ff2770 5%,
            transparent 5%,
            transparent 40%,
            #ff2770 50%
          );
          filter: drop-shadow(0 15px 50px #000);
          border-radius: 20px;
          animation: rotating-border 4s linear infinite;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: 0.5s;
          cursor: pointer;
        }

        @keyframes rotating-border {
          0% {
            --a: 0deg;
          }
          100% {
            --a: 360deg;
          }
        }

        .magic-box::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: repeating-conic-gradient(
            from var(--a),
            #45f3ff 0%,
            #45f3ff 5%,
            transparent 5%,
            transparent 40%,
            #45f3ff 50%
          );
          filter: drop-shadow(0 15px 50px #000);
          border-radius: 20px;
          animation: rotating-border 4s linear infinite;
          animation-delay: -1s;
        }

        .magic-box::after {
          content: "";
          position: absolute;
          inset: 4px;
          background: #2d2d39;
          border-radius: 15px;
          border: 8px solid #25252b;
        }

        /* Hover expansion of the box */
        .magic-box:hover,
        .magic-box:focus-within {
          width: 450px;
          height: 520px;
        }

        .magic-box:hover .login-container,
        .magic-box:focus-within .login-container {
          inset: 40px;
        }

        .magic-box:hover .login-box-content,
        .magic-box:focus-within .login-box-content {
          transform: translateY(0px);
        }

        .login-container {
          position: absolute;
          inset: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          border-radius: 10px;
          background: #00000033;
          color: #fff;
          z-index: 1000;
          box-shadow: inset 0 10px 20px #00000080;
          border-bottom: 2px solid #ffffff80;
          transition: 0.5s;
          overflow: hidden;
        }

        .login-box-content {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 15px;
          width: 80%;
          transform: translateY(140px);
          transition: 0.5s;
        }

        .login-box-content h2 {
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.2em;
          margin: 0;
          font-size: 1.5em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-box-content h2 i {
          color: #ff2770;
          text-shadow: 0 0 5px #ff2770, 0 0 20px #ff2770;
        }

        .login-box-content input {
          width: 100%;
          padding: 10px 20px;
          outline: none;
          border: none;
          font-size: 0.95em;
          color: #fff;
          background: #0000001a;
          border: 2px solid #fff;
          border-radius: 30px;
          transition: 0.3s;
        }

        .login-box-content input::placeholder {
          color: #999;
        }

        .login-box-content input:focus {
          border-color: #45f3ff;
          box-shadow: 0 0 8px rgba(69, 243, 255, 0.4);
        }

        .login-box-content input[type="submit"] {
          background: #45f3ff;
          border: none;
          font-weight: 600;
          color: #111;
          cursor: pointer;
          transition: 0.5s;
          margin-top: 5px;
        }

        .login-box-content input[type="submit"]:hover {
          box-shadow: 0 0 10px #45f3ff, 0 0 40px #45f3ff;
        }

        .login-box-content .group-links {
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 0.85em;
        }

        .login-box-content .group-links a {
          color: #fff;
          text-decoration: none;
          transition: 0.3s;
        }

        .login-box-content .group-links a:hover {
          text-decoration: underline;
        }

        .login-box-content .group-links a:nth-child(2) {
          color: #ff2770;
          font-weight: 600;
        }

        .login-error-msg {
          font-size: 0.75em;
          color: #ff2770;
          text-align: center;
          margin: 0;
          font-weight: 600;
        }
      `}</style>

      <div className="magic-box">
        <div className="login-container">
          <form onSubmit={handleSubmit(onSubmit)} className="login-box-content">
            <h2>
              <i className="fa-solid fa-right-to-bracket"></i>
              Login
              <i className="fa-solid fa-heart"></i>
            </h2>

            {error && <p className="login-error-msg">{error}</p>}

            <input 
              type="text" 
              placeholder="Email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="login-error-msg">{errors.email.message as string}</p>}

            <input 
              type="password" 
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="login-error-msg">{errors.password.message as string}</p>}

            <input 
              type="submit" 
              value={loading ? "Sign In..." : "Sign In"} 
              disabled={loading}
            />

            <div className="group-links">
              <Link to="/forgot-password">Forgot Password</Link>
              <Link to="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
