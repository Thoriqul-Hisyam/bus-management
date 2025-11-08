// components/shared/crud-modal.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import {
  useForm,
  UseFormReturn,
  Resolver,
  DefaultValues,
  FieldValues,
} from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Helper untuk menyetel nilai nested di object berdasarkan path (a.b[0].c)
 * Di sini path dari Zod berupa array PropertyKey[], kita set pada object errors RHF.
 */
function setIn(obj: any, path: PropertyKey[], value: any) {
  let curr = obj;
  for (let i = 0; i < path.length; i++) {
    const key = String(path[i]); // aman untuk string/number/symbol
    if (i === path.length - 1) {
      curr[key] = value;
    } else {
      curr[key] = curr[key] ?? {};
      curr = curr[key];
    }
  }
}

/**
 * Resolver kustom: gunakan Zod schema.safeParseAsync untuk validasi,
 * dan mapping error Zod -> shape errors RHF.
 */
function makeZodResolver<TValues extends FieldValues>(
  schema: z.ZodType<TValues>
): Resolver<TValues> {
  return async (values: TValues) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      // Valid → kembalikan values yang sudah diparsing, tanpa error.
      return { values: result.data, errors: {} };
    }

    // Invalid → mapping issues Zod ke object errors-nya RHF
    const formErrors: Record<string, any> = {};

    for (const issue of result.error.issues) {
      // RHF error node minimal: { type, message }
      setIn(formErrors, issue.path, {
        type: issue.code,
        message: issue.message,
      });
    }

    return { values: {} as any, errors: formErrors };
  };
}

/**
 * CrudModal generic untuk form Create/Edit berbasis:
 *  - react-hook-form
 *  - zod (validasi via resolver kustom)
 *
 * TValues = bentuk data form (harus turunan FieldValues)
 * schema  = z.ZodType<TValues> (output = TValues)
 *
 * Perbaikan: Tangkap error dari onSubmit (mis. dari server action) dan tampilkan
 * form-level error di dalam modal agar tidak jadi runtime error.
 */
export function CrudModal<TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  renderFields,
  submitText = "Simpan",
  cancelText = "Batal",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  schema: z.ZodType<TValues>;
  defaultValues?: DefaultValues<TValues>;
  onSubmit: (values: TValues) => Promise<void>;
  renderFields: (f: UseFormReturn<TValues>) => React.ReactNode;
  submitText?: string;
  cancelText?: string;
}) {
  const resolver = React.useMemo(() => makeZodResolver(schema), [schema]);

  const form = useForm<TValues>({
    resolver,
    defaultValues,
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
    setFormError(null); // reset error ketika modal dibuka/ditutup atau defaultValues berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, open]);

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {/* Form-level error (server error) */}
        {formError ? (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        ) : null}

        <form
          onSubmit={form.handleSubmit(async (values) => {
            try {
              setFormError(null);
              await onSubmit(values);
            } catch (e: any) {
              // Tangkap error dari server action / handler pemanggil
              const msg =
                typeof e?.message === "string" && e.message.trim().length > 0
                  ? e.message
                  : "Gagal menyimpan data.";
              setFormError(msg);
            }
          })}
          className="space-y-4"
        >
          {renderFields(form)}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
