"use client";

import Select, {
  Props as RSProps,
  SingleValue,
  StylesConfig,
  Theme,
} from "react-select";

export type Option = { value: number | string; label: string };

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v?.trim() ? v.trim() : fallback;
}

function shadcnTokens() {
  const radius = cssVar("--radius", "0.5rem");
  const bg = cssVar("--background", "#ffffff");
  const fg = cssVar("--foreground", "#0f172a");
  const mut = cssVar("--muted-foreground", "#6b7280");
  const border = cssVar("--input", "#e5e7eb"); 
  const ring = cssVar("--ring", "221 83% 53%"); 
  const primary = cssVar("--primary", "221 83% 53%");
  const primaryFg = cssVar("--primary-foreground", "#ffffff");

  const hslA = (triplet: string, a = 1) =>
    `hsl(${triplet}${triplet.includes("/") ? "" : ` / ${a}`})`;

  return {
    radius,
    bg,
    fg,
    mut,
    border,
    ring: hslA(ring, 0.45),
    primary: hslA(primary),
    primarySoft: hslA(primary, 0.12),
    primarySofter: hslA(primary, 0.08),
    primaryText: primaryFg,
  };
}

type Props = Omit<
  RSProps<Option, false>,
  "options" | "value" | "onChange" | "styles" | "theme"
> & {
  options: Option[];
  value?: number | string | null;
  onChange?: (value: number | string | null) => void;
  shadcnTheme?: boolean;
  extraStyles?: StylesConfig<Option, false>;
  themeOverride?: (theme: Theme) => Theme;
};

export default function RSelect({
  options,
  value,
  onChange,
  isSearchable = true,
  isClearable = true,
  shadcnTheme = true,
  extraStyles,
  themeOverride,
  ...rest
}: Props) {
  const selected =
    options.find((o) => String(o.value) === String(value ?? "")) ?? null;

  const t = shadcnTokens();

  const HOVER_GRADIENT =
    "linear-gradient(90deg, rgba(181,122,54,0.05), rgba(92,59,24,0.05))";
  const ACTIVE_GRADIENT =
    "linear-gradient(90deg, rgba(181,122,54,0.1), rgba(92,59,24,0.1))";

  const baseStyles: StylesConfig<Option, false> = {
    container: (p) => ({
      ...p,
      width: "100%",
    }),
    control: (p, state) => ({
      ...p,
      minHeight: 40,
      backgroundColor: t.bg,
      borderColor: state.isFocused ? t.primary : t.border,
      borderWidth: 1,
      borderRadius: t.radius,
      boxShadow: state.isFocused ? `0 0 0 3px ${t.ring}` : "none",
      "&:hover": { borderColor: t.primary },
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
    }),
    valueContainer: (p) => ({
      ...p,
      padding: "0 8px",
      gap: 4,
    }),
    placeholder: (p) => ({
      ...p,
      color: t.mut,
    }),
    singleValue: (p) => ({
      ...p,
      color: t.fg,
    }),
    input: (p) => ({
      ...p,
      color: t.fg,
    }),
    indicatorsContainer: (p) => ({
      ...p,
      gap: 2,
    }),
    indicatorSeparator: (p) => ({
      ...p,
      backgroundColor: "transparent",
    }),
    dropdownIndicator: (p, state) => ({
      ...p,
      color: state.isFocused ? t.primary : t.mut,
      paddingRight: 8,
      paddingLeft: 4,
      "&:hover": { color: t.primary },
    }),
    clearIndicator: (p) => ({
      ...p,
      color: t.mut,
      paddingRight: 4,
      "&:hover": { color: t.primary },
    }),
    menu: (p) => ({
      ...p,
      backgroundColor: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: t.radius,
      overflow: "hidden",
      boxShadow: `0 8px 24px rgba(0,0,0,.08)`,
      marginTop: 6,
    }),
    menuList: (p) => ({
      ...p,
      paddingTop: 6,
      paddingBottom: 6,
    }),
    option: (p, state) => {
      const background = state.isFocused
        ? HOVER_GRADIENT
        : state.isSelected
        ? t.primarySoft
        : "transparent";

      return {
        ...p,
        cursor: "pointer",
        fontSize: "0.875rem",
        lineHeight: "1.25rem",
        background,
        color: t.fg,
        ":active": { background: ACTIVE_GRADIENT },
        paddingTop: 8,
        paddingBottom: 8,
      };
    },
    noOptionsMessage: (p) => ({
      ...p,
      fontSize: "0.875rem",
      color: t.mut,
    }),
  };

  const baseTheme = (theme0: Theme): Theme => {
    if (!shadcnTheme) return theme0;
    return {
      ...theme0,
      borderRadius: 0,
      colors: {
        ...theme0.colors,
        primary: t.primary,
        primary25: t.primarySofter,
        primary50: t.primarySoft,
        neutral0: t.bg,
        neutral10: t.primarySoft,
        neutral20: t.border,
        neutral30: t.primary,
        neutral40: t.mut,
        neutral50: t.mut,
        neutral60: t.fg,
        neutral80: t.fg,
      },
      spacing: {
        ...theme0.spacing,
        baseUnit: 4,
        controlHeight: 40,
        menuGutter: 6,
      },
    };
  };

  const mergedStyles = extraStyles
    ? mergeStyles(baseStyles, extraStyles)
    : baseStyles;

  return (
    <Select
      options={options}
      value={selected}
      onChange={(opt: SingleValue<Option>) => onChange?.(opt?.value ?? null)}
      isSearchable={isSearchable}
      isClearable={isClearable}
      styles={mergedStyles}
      theme={(t0) =>
        themeOverride ? themeOverride(baseTheme(t0)) : baseTheme(t0)
      }
      {...rest}
    />
  );
}

function mergeStyles(
  a: StylesConfig<Option, false>,
  b: StylesConfig<Option, false>
) {
  const keys = new Set([
    ...(Object.keys(a) as (keyof typeof a)[]),
    ...(Object.keys(b) as (keyof typeof b)[]),
  ]);
  const out: any = {};
  keys.forEach((k) => {
    const ak = (a as any)[k];
    const bk = (b as any)[k];
    if (!ak) out[k] = bk;
    else if (!bk) out[k] = ak;
    else {
      out[k] = (base: any, state: any) => {
        const ra = typeof ak === "function" ? ak(base, state) : ak;
        const rb = typeof bk === "function" ? bk(base, state) : bk;
        return { ...ra, ...rb };
      };
    }
  });
  return out as StylesConfig<Option, false>;
}
