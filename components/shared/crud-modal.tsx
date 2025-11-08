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

function setIn(obj: any, path: PropertyKey[], value: any) {
  let curr = obj;
  for (let i = 0; i < path.length; i++) {
    const key = String(path[i]);
    if (i === path.length - 1) {
      curr[key] = value;
    } else {
      curr[key] = curr[key] ?? {};
      curr = curr[key];
    }
  }
}

function makeZodResolver<TValues extends FieldValues>(
  schema: z.ZodType<TValues>
): Resolver<TValues> {
  return async (values: TValues) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const formErrors: Record<string, any> = {};

    for (const issue of result.error.issues) {
      setIn(formErrors, issue.path, {
        type: issue.code,
        message: issue.message,
      });
    }

    return { values: {} as any, errors: formErrors };
  };
}

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

  React.useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
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

        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
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
