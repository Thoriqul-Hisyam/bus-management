"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PermissionTree from "@/components/permission/PermissionTree";
import { getPermissionMenuTree } from "@/actions/permission";
import { createPosition } from "@/actions/position";

export default function PositionCreatePage() {
  const [name, setName] = useState("");
  const [tree, setTree] = useState<any[]>([]);
  const [permIds, setPermIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      const t = await getPermissionMenuTree();
      setTree(t);
    });
  }, []);

  const onSubmit = () => {
    startTransition(async () => {
      const res = await createPosition({ name, permissionIds: permIds });
      if (res.ok) router.push("/master/position");
      else alert(res.error);
    });
  };

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tambah Jabatan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Jabatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Nama Jabatan</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Driver, Admin, Manager"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hak Akses (Opsional)</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionTree
            tree={tree}
            defaultChecked={permIds}
            onChange={(ids) => setPermIds(ids)}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => router.back()} disabled={isPending}>
          Batal
        </Button>
        <Button onClick={onSubmit} disabled={isPending || !name.trim()}>
          Simpan
        </Button>
      </div>
    </main>
  );
}
