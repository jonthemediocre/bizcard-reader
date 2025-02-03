import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="w-full p-4 bg-red-50 rounded-md flex items-start space-x-2 mb-4">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-red-700">{message}</p>
  </div>
);

export default ErrorMessage;