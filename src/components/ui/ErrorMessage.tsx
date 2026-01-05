interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export const ErrorMessage = ({ message, retry }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-64 w-full text-center p-4">
      <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
        {/* Możesz tu dodać ikonę np. z react-icons */}
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Wystąpił błąd</h3>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md font-bold cursor-pointer"
        >
          Spróbuj ponownie
        </button>
      )}
    </div>
  );
};