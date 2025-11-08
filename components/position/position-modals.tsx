"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  name: z.string().min(1, "Nama jabatan wajib diisi"),
});
type FormValues = z.infer<typeof FormSchema>;

export function PositionCreateEditDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues?: { id?: number | null; name: string };
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: defaultValues?.name ?? "" },
  });

  React.useEffect(() => {
    reset({ name: defaultValues?.name ?? "" });
  }, [defaultValues, reset]);

  const isEdit = !!defaultValues?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Jabatan" : "Tambah Jabatan"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui nama jabatan di bawah ini."
              : "Isi nama jabatan untuk menambahkan data baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Jabatan</label>
            <Input
              autoFocus
              placeholder="Contoh: Driver, Admin, Manager"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
