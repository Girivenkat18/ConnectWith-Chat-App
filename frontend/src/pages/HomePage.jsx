import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';

const HomePage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const postDetails = async (pics) => {
    setPicLoading(true);
    if (!pics) {
      alert("Please Select an Image");
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/jpg") {
      const data = new FormData();
      data.append("file", pics);
      try {
        const res = await axios.post("/api/upload", data);
        setProfilePic(res.data.url);
      } catch (err) {
        alert("Failed to upload profile picture. " + (err.response?.data?.message || ''));
      }
    } else {
      alert("Please Select an Image (JPEG/PNG)");
    }
    setPicLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      let data;
      if (isLogin) {
        const res = await axios.post(
          '/api/auth/login',
          { email, password },
          config
        );
        data = res.data;
      } else {
        const res = await axios.post(
          '/api/auth',
          { username, email, password, profilePic },
          config
        );
        data = res.data;
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      navigate('/chats');
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Profile Picture (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
                disabled={picLoading}
              />
              {picLoading && <small style={{ color: '#9b88e1' }}>Uploading image...</small>}
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading || picLoading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default HomePage;
