const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-center items-center px-6 py-12">
      <div className="text-center bg-white p-10 md:p-16 rounded-3xl shadow-2xl shadow-blue-100 border border-blue-100">
        <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">
          403
        </h1>
        <div className="bg-blue-600 text-white px-4 py-1 text-sm rounded-full rotate-12 absolute -translate-y-1/2 translate-x-10">
          Access Denied
        </div>
        
        <h2 className="text-4xl font-bold text-gray-900 mt-10">
          Unauthorized Access
        </h2>
        
        <p className="text-gray-600 mt-4 max-w-md mx-auto">
          Oops! It seems you don't have the necessary permissions to view this page. Please contact support if you believe this is a mistake.
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg shadow-blue-200"
          >
            Go Back
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-200 hover:bg-blue-50 transition duration-300 ease-in-out"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;