"use client";

import { useEffect, useMemo, useState } from "react";
import type { PermissionMenuNode } from "@/actions/permission";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  tree: PermissionMenuNode[];
  defaultChecked?: number[];
  onChange?: (permissionIds: number[]) => void;
  className?: string;
};

export default function PermissionTree({
  tree,
  defaultChecked = [],
  onChange,
  className,
}: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set(defaultChecked));

  useEffect(() => {
    const next = new Set(defaultChecked);
    let same = next.size === checked.size;
    if (same) {
      for (const id of next) {
        if (!checked.has(id)) {
          same = false;
          break;
        }
      }
    }
    if (!same) {
      setChecked(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify([...defaultChecked].sort((a, b) => a - b))]);

  const allIdsByMenu = useMemo(() => {
    const map = new Map<number, number[]>();
    const walk = (node: PermissionMenuNode): number[] => {
      const self = node.permissions.map((p) => p.id);
      const child = node.children.flatMap(walk);
      const all = [...self, ...child];
      map.set(node.id, all);
      return all;
    };
    tree.forEach(walk);
    return map;
  }, [tree]);

  const isMenuAllChecked = (menuId: number) => {
    const ids = allIdsByMenu.get(menuId) ?? [];
    if (ids.length === 0) return false;
    return ids.every((id) => checked.has(id));
  };

  const isMenuAnyChecked = (menuId: number) => {
    const ids = allIdsByMenu.get(menuId) ?? [];
    return ids.some((id) => checked.has(id));
  };

  const toggleMenu = (menuId: number, value: boolean) => {
    const ids = allIdsByMenu.get(menuId) ?? [];
    const next = new Set(checked);
    ids.forEach((id) => {
      if (value) next.add(id);
      else next.delete(id);
    });
    setChecked(next);
    onChange?.(Array.from(next));
  };

  const togglePerm = (permId: number, value: boolean) => {
    const next = new Set(checked);
    if (value) next.add(permId);
    else next.delete(permId);
    setChecked(next);
    onChange?.(Array.from(next));
  };

  const MenuBlock = ({
    node,
    level = 0,
  }: {
    node: PermissionMenuNode;
    level?: number;
  }) => {
    const allOn = isMenuAllChecked(node.id);
    const anyOn = isMenuAnyChecked(node.id);

    return (
      <Card className={cn("p-4 mb-3", level > 0 && "ml-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{node.label}</div>
            {/* <div className="text-xs text-muted-foreground">{node.code}</div> */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {allOn ? "Semua aktif" : anyOn ? "Sebagian" : "Mati"}
            </span>
            <Switch checked={allOn} onCheckedChange={(v) => toggleMenu(node.id, v)} />
          </div>
        </div>

        {/* permissions di node ini */}
        {node.permissions.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {node.permissions.map((p) => {
              const id = `perm-${node.id}-${p.id}`;
              return (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    id={id}
                    checked={checked.has(p.id)}
                    onCheckedChange={(v) => togglePerm(p.id, Boolean(v))}
                  />
                  <Label htmlFor={id} className="cursor-pointer">
                    <span className="font-medium">{p.label ?? p.code}</span>
                    {/* <span className="ml-1 text-xs text-muted-foreground">
                      ({p.code})
                    </span> */}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {/* children */}
        {node.children.length > 0 && (
          <div className="mt-3">
            {node.children.map((c) => (
              <MenuBlock key={c.id} node={c} level={level + 1} />
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className={className}>
      {tree.map((n) => (
        <MenuBlock key={n.id} node={n} />
      ))}
      {tree.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada menu/permission.
        </p>
      )}
    </div>
  );
}
