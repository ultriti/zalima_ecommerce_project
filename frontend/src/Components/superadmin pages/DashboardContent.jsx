const DashboardContent = () => {
    return (
      <div className="ml-64 mt-16 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-semibold mb-6">Welcome, SuperAdmin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Total Users</h2>
            <p className="text-3xl font-bold">1,245</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Active Vendors</h2>
            <p className="text-3xl font-bold">150</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Products Listed</h2>
            <p className="text-3xl font-bold">3,212</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">New Signups</h2>
            <p className="text-3xl font-bold">82</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Traffic Overview</h2>
            <p>Graph or chart component goes here.</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default DashboardContent;
  