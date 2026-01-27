export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center h-64 w-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      <p className="mt-4 text-gray-600 font-semibold animate-pulse">
        Przywoływanie danych z Rift...
      </p>
    </div>
  );
};
