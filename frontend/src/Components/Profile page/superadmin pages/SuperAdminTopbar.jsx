import { useState } from 'react';

const SuperAdminTopbar = ({ username = 'John Doe' }) => {
  const initials = username.split(' ').map((n) => n[0]).join('');
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="ml-64 h-16 bg-white shadow-md flex items-center justify-between px-6 z-10 relative">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center cursor-pointer"
            onClick={() => setDropdown(!dropdown)}
          >
            {initials}
          </div>
          {dropdown && (
            <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md py-2 w-40 text-sm">
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</div>
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminTopbar;
