"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface CalendarPickerProps {
  value: string; // DD-MM-YYYY
  onChange: (date: string) => void;
  daysForward?: number; // inclusive (today + daysForward)
  className?: string;
  startFromToday?: boolean;
}

function formatDDMMYYYY(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function parseDDMMYYYY(v: string): Date | null {
  const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const y = Number(m[3]);
  const date = new Date(y, mo, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo ||
    date.getDate() !== d
  )
    return null;
  return date;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  daysForward = 4,
  className = "",
  startFromToday = true,
}) => {
  const today = useMemo(() => new Date(), []);
  const minDate = startFromToday
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
    : today;
  const allowed = useMemo(
    () =>
      Array.from(
        { length: daysForward + 1 },
        (_, i) => new Date(minDate.getTime() + i * 86400000)
      ),
    [daysForward, minDate]
  );
  const allowedSet = useMemo(
    () => new Set(allowed.map((d) => formatDDMMYYYY(d))),
    [allowed]
  );
  const maxDate = allowed[allowed.length - 1];
  const initialSelected = parseDDMMYYYY(value) || allowed[0];
  const [viewMonth, setViewMonth] = useState(initialSelected.getMonth());
  const [viewYear, setViewYear] = useState(initialSelected.getFullYear());
  const [focused, setFocused] = useState<string>(
    formatDDMMYYYY(initialSelected)
  );

  useEffect(() => {
    const d = parseDDMMYYYY(value);
    if (d) {
      setFocused(formatDDMMYYYY(d));
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [value]);

  const goMonth = useCallback(
    (delta: number) => {
      const newDate = new Date(viewYear, viewMonth + delta, 1);
      const monthStart = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const monthEnd = new Date(
        newDate.getFullYear(),
        newDate.getMonth() + 1,
        0
      );
      if (monthEnd < minDate || monthStart > maxDate) return;
      setViewMonth(newDate.getMonth());
      setViewYear(newDate.getFullYear());
    },
    [viewMonth, viewYear, minDate, maxDate]
  );

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++)
      arr.push(new Date(viewYear, viewMonth, d));
    return arr;
  }, [viewMonth, viewYear]);

  const valueStr = value;
  const changeFocused = (d: Date) => {
    const f = formatDDMMYYYY(d);
    setFocused(f);
    if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear) {
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  };
  const adjustFocus = (days: number) => {
    const current = parseDDMMYYYY(focused) || allowed[0];
    const target = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate() + days
    );
    if (target < minDate || target > maxDate) return;
    changeFocused(target);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        adjustFocus(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        adjustFocus(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        adjustFocus(7);
        break;
      case "ArrowUp":
        e.preventDefault();
        adjustFocus(-7);
        break;
      case "Home":
        e.preventDefault();
        changeFocused(allowed[0]);
        break;
      case "End":
        e.preventDefault();
        changeFocused(maxDate);
        break;
      case "PageDown":
        e.preventDefault();
        goMonth(1);
        break;
      case "PageUp":
        e.preventDefault();
        goMonth(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (allowedSet.has(focused)) onChange(focused);
        break;
    }
  };

  const gridRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const btn = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[data-date='${focused}']`
    );
    btn?.focus();
  }, [focused, viewMonth, viewYear]);

  const prevDisabled = useMemo(() => {
    const prevMonthEnd = new Date(viewYear, viewMonth, 0);
    return prevMonthEnd < minDate;
  }, [viewMonth, viewYear, minDate]);
  const nextDisabled = useMemo(() => {
    const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
    return nextMonthStart > maxDate;
  }, [viewMonth, viewYear, maxDate]);

  return (
    <div
      className={
        "inline-block select-none rounded-lg border-2 border-black bg-card p-3 shadow-md font-mono text-xs " +
        className
      }
      role="group"
      aria-label="Calendar date picker"
      onKeyDown={onKeyDown}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <button
          type="button"
          aria-label="Previous month"
          disabled={prevDisabled}
          onClick={() => goMonth(-1)}
          className="px-2 py-1 rounded-md border-2 border-black bg-background disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/60"
        >
          ◀
        </button>
        <span className="font-semibold text-sm flex-1 text-center">
          {new Date(viewYear, viewMonth, 1).toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          disabled={nextDisabled}
          onClick={() => goMonth(1)}
          className="px-2 py-1 rounded-md border-2 border-black bg-background disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/60"
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((h) => (
          <div
            key={h}
            className="text-[10px] text-muted-foreground text-center"
          >
            {h}
          </div>
        ))}
      </div>
      <div
        ref={gridRef}
        className="grid grid-cols-7 gap-1"
        aria-label="Calendar grid"
      >
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const label = d.getDate();
          const f = formatDDMMYYYY(d);
          const isAllowed = allowedSet.has(f);
          const isSelected = f === valueStr;
          const isFocused = f === focused;
          const disabled = !isAllowed;
          return (
            <button
              key={i}
              type="button"
              data-date={f}
              aria-label={`${f}${isSelected ? " selected" : ""}`}
              aria-pressed={isSelected}
              disabled={disabled}
              tabIndex={isFocused ? 0 : -1}
              onClick={() => !disabled && onChange(f)}
              onFocus={() => setFocused(f)}
              className={
                "h-8 w-8 flex items-center justify-center rounded-md border-2 outline-none transition-all focus:ring-2 focus:ring-primary " +
                (isSelected
                  ? "bg-primary text-black border-black shadow"
                  : !disabled
                  ? "bg-background hover:bg-primary/60 border-black"
                  : "bg-muted/40 text-muted-foreground border-dashed border-muted cursor-not-allowed")
              }
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground flex justify-between gap-2">
        <span>
          Selected: <span className="font-semibold">{valueStr}</span>
        </span>
        <span>
          Range: {formatDDMMYYYY(minDate)} → {formatDDMMYYYY(maxDate)}
        </span>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        Keys: Arrows move, PgUp/PgDn month, Home/End range, Enter select
      </div>
    </div>
  );
};

CalendarPicker.displayName = "CalendarPicker";
