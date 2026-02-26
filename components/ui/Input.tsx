"use client";
import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-gray-500 font-medium text-sm select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full border-2 rounded-lg text-sm transition-all outline-none",
              "placeholder:text-gray-400 bg-orange-50/40",
              prefix ? "pl-10 pr-4 py-3" : "px-4 py-3",
              error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
