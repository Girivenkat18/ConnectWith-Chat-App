import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { ChatState } from '../Context/ChatProvider';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = ChatState();
  const [picLoading, setPicLoading] = useState(false);

  const postDetails = async (pics) => {
    if (!pics) {
      alert("Please Select an Image");
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/jpg") {
      setPicLoading(true);
      const data = new FormData();
      data.append("file", pics);
      try {
        const res = await axios.post("http://localhost:5001/api/upload", data);
        const newProfilePic = res.data.url;

        // Update profile in DB
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data: updatedUser } = await axios.put(
          "http://localhost:5001/api/auth/profile",
          { profilePic: newProfilePic },
          config
        );

        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert('Profile picture updated successfully!');
      } catch (err) {
        alert("Failed to update profile picture.");
      } finally {
        setPicLoading(false);
      }
    } else {
      alert("Please Select an Image (JPEG/PNG)");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">
        <div className="modal-header">
          <h2>My Profile</h2>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>
        <div className="modal-body profile-body">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img 
              src={user.profilePic} 
              alt={user.username} 
              className="avatar" 
              style={{ width: '120px', height: '120px', margin: '0 auto 10px', display: 'block' }} 
            />
            <h3 style={{ color: '#6d28d9', fontSize: '1.5rem', marginBottom: '5px' }}>{user.username}</h3>
             <p style={{ color: '#7c3aed' }}>{user.email}</p>
          </div>
          
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label style={{ display: 'inline-block', cursor: 'pointer', color: '#8b5cf6', background: '#ede4f7', padding: '8px 16px', borderRadius: '20px' }}>
              {picLoading ? 'Uploading...' : 'Update Profile Picture'}
              <input 
                type="file" 
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
                disabled={picLoading}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
