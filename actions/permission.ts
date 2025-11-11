"use server";

import { prisma } from "@/lib/prisma";

export type PermissionLeaf = { id: number; code: string; label: string | null };
export type PermissionMenuNode = {
  id: number;
  code: string;
  label: string;
  sort: number;
  parentId: number | null;
  permissions: PermissionLeaf[];
  children: PermissionMenuNode[];
};

export async function getPermissionMenuTree(): Promise<PermissionMenuNode[]> {
  const menus = await prisma.permissionMenu.findMany({
    select: {
      id: true,
      code: true,
      label: true,
      sort: true,
      parentId: true,
      permissions: {
        select: { id: true, code: true, label: true },
        orderBy: [{ id: "asc" }],
      },
    },
    orderBy: [{ sort: "asc" }, { id: "asc" }],
  });

  const byId = new Map<number, PermissionMenuNode>();
  menus.forEach((m) => {
    byId.set(m.id, {
      id: m.id,
      code: m.code,
      label: m.label,
      sort: m.sort,
      parentId: m.parentId ?? null,
      permissions: (m.permissions || []).map((p) => ({
        id: p.id,
        code: p.code,
        label: p.label,
      })),
      children: [],
    });
  });

  const roots: PermissionMenuNode[] = [];
  byId.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortTree = (nodes: PermissionMenuNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort || a.id - b.id);
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}
