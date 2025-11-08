"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

export default function PasswordField<
  TForm extends FieldValues
>({
  form,
  name,
  label = "Password",
  placeholder = "Masukkan password...",
  className,
}: {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const error = form.formState.errors[name]?.message as string | undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          {...form.register(name)}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
