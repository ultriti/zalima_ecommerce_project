import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTopbar = ({ username = 'Admin User' }) => {
  const initials = username.split(' ').map((n) => n[0]).join('');
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();

  const handleProfile = () => {
    setDropdown(false);
    navigate('/admin/profile');
  };

  const handleLogout = () => {
    setDropdown(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/admin/signin');
  };

  return (
    <div className="fixed left-64 top-0 right-0 h-16 bg-white shadow-md flex items-center justify-between px-8 z-40">
      <div className="text-lg font-semibold">Admin Dashboard</div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center cursor-pointer"
            onClick={() => setDropdown(!dropdown)}
          >
            {initials}
          </div>
          {dropdown && (
            <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md py-2 w-40 text-sm z-50">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleProfile}
              >
                Profile
              </div>
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;