"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PermissionTree from "@/components/permission/PermissionTree";
import { getPermissionMenuTree } from "@/actions/permission";
import { getPositionDetail, updatePosition } from "@/actions/position";

export default function PositionEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [name, setName] = useState("");
  const [tree, setTree] = useState<any[]>([]);
  const [permIds, setPermIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      const [t, detail] = await Promise.all([
        getPermissionMenuTree(),
        getPositionDetail(id),
      ]);
      setTree(t);
      if (detail.ok) {
        setName(detail.data.name);
        setPermIds(detail.data.permissionIds);
      } else {
        alert(detail.error);
      }
      setLoaded(true);
    });
  }, [id]);

  const onSubmit = () => {
    startTransition(async () => {
      const res = await updatePosition({ id, name, permissionIds: permIds });
      if (res.ok) router.push("/master/position");
      else alert(res.error);
    });
  };

  if (!loaded) {
    return <main className="p-6">Memuat...</main>;
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ubah Jabatan</h1>
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
              placeholder="Nama jabatan"
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
          Simpan Perubahan
        </Button>
      </div>
    </main>
  );
}
