import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  icon: LucideIcon;
}

export function AuthInput({ 
  id, 
  type, 
  value, 
  onChange, 
  label, 
  required = true,
  icon: Icon 
}: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <Icon className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
      </div>
    </div>
  );
} 